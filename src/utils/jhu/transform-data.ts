/*
 * Take data from the source and convert it into something more usable for our purposes.
 */
import * as dataSources from '../../constants/data-sources.json';
import * as states from '../../constants/states.json';
import * as stateCodes from '../../constants/state-codes.json';

import {DashboardData} from '../../components/dashboard';

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
                agg[id] = {
                    province: row[dataSources.provinceIdx],
                    country: row[dataSources.countryIdx],
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
    computeCol0Data(entries);
    computeCol1Data(entries);
    computeTimeSeries(entries);
    removeExtras(entries);

    return {
        count: entries.length,
        entries
    };
}

// Remove unneeded intermediate data
function removeExtras(entries) {
    for (const entry of entries) {
        delete entry.cases;
    }
}

function computeCol0Data(entries) {
    for (const entry of entries) {
        const confirmed = entry.cases.confirmed[entry.cases.confirmed.length - 1];
        const deaths = entry.cases.deaths[entry.cases.deaths.length - 1];
        const maxConfirmed = entry.cases.confirmed.reduce((max, n) => n > max ? n : max, 0);
        const stats = [
            {
                label: 'Confirmed',
                stat: confirmed,
                percentage: Math.round(confirmed * 100 / maxConfirmed * 100) / 100,
                barColor: CONFIRMED_COLOR
            },
            {
                label: 'Deaths',
                stat: deaths,
                percentage: Math.round(deaths * 100 / maxConfirmed * 100) / 100,
                barColor: '#777'
            },
        ];
        entry.col0 = {stats};
    }
}

function computeCol1Data(entries) {
    for (const entry of entries) {
        const {confirmed, deaths} = entry.cases;
        const newCases = confirmed.reduce((agg, current, idx) => {
            let prev = 0;
            if (idx > 0) {
                prev = confirmed[idx - 1];
            }
            agg.push(current - prev);
            return agg;
        }, []);
        const newCasesSum = newCases.reduce((sum, n) => sum + n, 0);
        const newCasesAll = Math.round(newCasesSum / newCases.length * 100) / 100;
        const sevenDays = newCases.slice(-7);
        const newCases7d = Math.round(sevenDays.reduce((sum, n) => sum + n, 0) / sevenDays.length * 100) / 100;
        const threeDays = newCases.slice(-3);
        const newCases3d = Math.round(threeDays.reduce((sum, n) => sum + n, 0) / threeDays.length * 100) / 100;
        const stats = [
            {
                label: `Last ${confirmed.length} days`,
                stat: newCasesAll
            },
            {
                label: 'Last 7 days',
                stat: newCases7d
            },
            {
                label: 'Last 3 days',
                stat: newCases3d
            }
        ]
        entry.col1 = {
            title: 'Average new cases per day:',
            stats
        }
    }
}

function computeTimeSeries(entries) {
    const colors = [CONFIRMED_COLOR];
    const labels = ['Confirmed'];
    for (const entry of entries) {
        const {confirmed} = entry.cases;
        const max = entry.cases.confirmed.reduce((max, n) => n > max ? n : max, 0);
        const percentages = confirmed.slice(-50)
            .map(n => [Math.round(n * 100 / max)]);
        const start = new Date();
        start.setDate(start.getDate() - 50);
        const end = new Date();
        entry.bars = {
            percentages,
            colors,
            labels,
            yMax: max,
            xMin: start,
            xMax: end,
            yLabel: 'cases',
            xLabel: 'days'
        }
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
    // A set of colonial countries that have an entry for the country as a
    // whole, plus a handful of additional entries that represent outlying managed
    // colonies. For example, there is an entry for "Denmark" as well as for
    // "Faroe Islands, Denmark". We don't want to aggregate these examples.
    const skips = {'France': true, 'Denmark': true, 'Netherlands': true, 'United Kingdom': true};
    const worldwide = {
        province: null,
        country: 'Worldwide',
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
    // Aggregate each country that has split-up province entries
    // A mapping from country name to row idx
    const byCountry = {}
    rows.forEach((row, idx) => {
        if (!row.province || row.country in skips) {
            return;
        }
        if (!(row.country in byCountry)) {
            byCountry[row.country] = [];
        }
        byCountry[row.country].push(idx);
    });
    for (const country in byCountry) {
        const countryRow = {
            province: null,
            country,
            cases: {}
        };
        const totalCases = {};
        for (const key of dataSources.categoryKeys) {
            totalCases[key] = [];
        }
        // Aggregate case totals for every province in this country
        for (const row of rows) {
            if (row.country !== country) {
                continue;
            }
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
        countryRow.cases = totalCases;
        rows.push(countryRow);
    }
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
        if (row.country in mapping) {
            row.country = mapping[row.country];
        }
    }
}
