/*
 * Take data from the source and convert it into something more usable for our purposes.
 */
import * as dataSources from '../../constants/data-sources.json';
import * as states from '../../constants/states.json';
import * as stateCodes from '../../constants/state-codes.json';

import {getPercentGrowth, getGrowthRate, percent} from '../../utils/math';
import {DashboardData} from '../../types/dashboard';

const CONFIRMED_COLOR = 'rgb(53, 126, 221)';

// Convert a blob of csv text into an array of objects with some normalization on dates, etc
export function transformData(sourceData): DashboardData {
    let dates = null; // All date columns, values parsed from the headers
    let agg = {}; // An aggregated mapping of id (constructed from lat/lng) to row data
    // Largest totals for creating bars
    for (const key in sourceData) {
        const text = sourceData[key];
        const lines = text.split('\n');
        if (!dates) {
            const headers = rowToArray(lines[0]);
            dates = parseDatesFromHeaders(headers);
        }
        lines.slice(1).forEach(rowStr => {
            const row = rowToArray(rowStr);
            if (!row || !row.length) {
                return;
            }
            const id = String(row[dataSources.latIdx]) + ',' + String(row[dataSources.lngIdx]);
            if (!(id in agg)) {
                const location = [row[dataSources.provinceIdx], row[dataSources.countryIdx]].filter(x => x).join(', ');
                agg[id] = {
                    location,
                    cases: {},
                };
            }
            const timeSeries = row.slice(dataSources.seriesIdx);
            agg[id].cases[key] = timeSeries;
        });
    }
    // Convert the aggregation object into an array
    let entries = [];
    for (const key in agg) {
        entries.push(agg[key]);
    }
    // Additional pre-computation
    insertAggregations(entries); // This must go before the below transformations
    renameCountries(entries);
    computeStats(entries);
    removeExtras(entries);
    const entryLabels = ['Confirmed', 'Deaths'];
    return {entries, entryLabels};
}

// Remove unneeded intermediate data
function removeExtras(entries) {
    for (const entry of entries) {
        delete entry.cases;
    }
}

function computeStats(entries) {
    for (const entry of entries) {
        const confirmed = entry.cases.confirmed;
        const deaths = entry.cases.deaths;
        const mortality = deaths.map((d, idx) => percent(d, confirmed[idx]));
        entry.stats = [
            {
                label: 'Confirmed',
                val: confirmed[confirmed.length - 1],
                isPercentage: false,
                percentGrowth: getPercentGrowth(confirmed),
                growthRate: getGrowthRate(confirmed),
                timeSeries: {
                    values: confirmed,
                    color: '#AA3377',
                }
            },
            {
                label: 'Deaths',
                val: deaths[deaths.length - 1],
                isPercentage: false,
                percentGrowth: getPercentGrowth(deaths),
                growthRate: getGrowthRate(deaths),
                timeSeries: {
                    values: deaths,
                    color: '#BBBBBB',
                }
            },
            {
                label: 'Mortality rate',
                val: mortality[mortality.length - 1],
                isPercentage: true,
                percentGrowth: getPercentGrowth(mortality),
                growthRate: getGrowthRate(mortality),
                timeSeries: {
                    values: mortality,
                    color: '#CCBB44',
                }
            },
        ];
    }
}

// Get the array of dates as [year, month, day] triples
function parseDatesFromHeaders (headers) {
    const regex = new RegExp(dataSources.dateRegex);
    const ret = [];
    for (const str of headers.slice(dataSources.seriesIdx)) {
        const matches = str.match(regex);
        // Date keys have the US-based format "month/day/year" such as "1/20/20"
        const month = Number(matches[1]);
        const day = Number(matches[2]);
        const year = 2000 + Number(matches[3]);
        ret.push([year, month, day]);
    }
    return ret;
}

// Parse a CSV row into an array of strings, taking quotes into account.
// It would be better to use a library. But I got frustrated looking at the libraries on npm and
// decided to write this simple parser.
function rowToArray(row) {
    let inQuoted = false; // Are we within a quoted string? If so, include commas in the column val
    let vals = [];
    let val = "";
    for (const ch of row) {
        if (ch === '"') {
            // Toggle the inQuoted bool
            inQuoted = !inQuoted;
        } else if (ch === ',' && !inQuoted) {
            inQuoted = false;
            vals.push(parseColumnVal(val));
            val = "";
        } else {
            val += ch;
        }
    }
    if (val.length) {
        // Push any final column value
        vals.push(parseColumnVal(val));
    }
    return vals;
}

// Parse a string into a number, if it is a number. Otherwise leave it.
function parseColumnVal(val) {
    val = val.trim();
    if (val === "") {
        return null;
    } else if (isNaN(val)) {
        return val;
    } else {
        return Number(val);
    }
}

/**
 * Compute additional region entries in `rows` as aggregations of countries,
 * continents, or the whole world.
 * Mutates rows
 * @param rows
 */
function insertAggregations(rows) {
    const worldwide = {
        location: 'Worldwide',
        cases: {}
    }
    const totalCases = {};
    for (const key of dataSources.categoryKeys) {
        totalCases[key] = [];
    }
    for (const row of rows) {
        for (const key of dataSources.categoryKeys) { // 3 iterations
            row.cases[key].forEach((total, idx) => {
                if (totalCases[key].length === idx) {
                    totalCases[key].push(total);
                } else {
                    totalCases[key][idx] += total;
                }
            });
        }
    }
    worldwide.cases = totalCases;
    rows.push(worldwide);
}

// Calculate percentage stats for the cases (eg. what is the percentage of deaths as compared to confirmed)?
// Mutates rows
function getPercentages (rows) {
    for (const row of rows) {
        const {confirmed, deaths} = row.currentTotals;
        let deathsPercentage = 0;
        if (confirmed > 0) {
            deathsPercentage = Math.round(deaths * 1000 / confirmed) / 10;
        }
        row.percentages = {deathsPercentage}
    }
}

/**
 * Some of the country names used by JHU are not ideal. This replaces them with clearer names.
 * mutates rows
 * @param rows
 */
function renameCountries(rows) {
    const mapping = {
        'Korea, South': 'South Korea',
        'US': 'USA',
    };
    for (const row of rows) {
        if (row.location in mapping) {
            row.location = mapping[row.location];
        }
    }
}
