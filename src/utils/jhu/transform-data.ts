/*
 * Take data from the source and convert it into something more usable for our purposes.
 */
import * as dataSources from '../../constants/data-sources.json';
import * as states from '../../constants/states.json';
import * as stateCodes from '../../constants/state-codes.json';
import * as colors from '../../constants/graph-colors.json';

import {rowToArray} from '../csv-parse';
import {percent} from '../math';
import {setTimeSeriesWindow} from '../transform-data';
import {sortByStat} from '../sort-data';
import {DashboardData} from '../../types/dashboard';

const LABELS = [
    'Confirmed cases, cumulative',
    'Recovered, cumulative',
    'Active cases',
    'Deaths',
    'Mortality rate',
    'Percent recovered'
];

// Convert a blob of csv text into an array of objects with some normalization on dates, etc
export function transformData(sourceData): DashboardData {
    let dates = null; // All date columns, values parsed from the headers
    let agg = {}; // An aggregated mapping of id (constructed from lat/lng) to row data
    // Parse and aggregate the data
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
            const id = row[dataSources.countryIdx];
            const timeSeries = row.slice(dataSources.seriesIdx);
            if (id in agg) {
                if (key in agg[id].cases) {
                    const cases = agg[id].cases[key];
                    for (let idx = 0; idx < timeSeries.length; idx++) {
                        cases[idx] += timeSeries[idx];
                    }
                } else {
                    agg[id].cases[key] = timeSeries;
                }
            } else {
                const location = row[dataSources.countryIdx];
                agg[id] = {
                    location,
                    cases: {
                        [key]: timeSeries
                    },
                };
            }
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
    setTimeSeriesWindow(entries);
    sortByStat(entries, 0);
    return {entries, entryLabels: LABELS, timeSeriesOffset: 0};
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
        const recovered = entry.cases.recovered;
        const active = confirmed.map((con, idx) => con - recovered[idx]);
        const mortality = deaths.map((d, idx) => percent(d, confirmed[idx]));
        const percentRecovered = recovered.map((rec, idx) => percent(rec, confirmed[idx]));
        entry.stats = [
            {
                label: LABELS[0],
                isPercentage: false,
                timeSeries: confirmed,
            },
            {
                label: LABELS[1],
                isPercentage: false,
                timeSeries: recovered,
            },
            {
                label: LABELS[2],
                isPercentage: false,
                timeSeries: active,
            },
            {
                label: LABELS[3],
                isPercentage: false,
                timeSeries: deaths
            },
            {
                label: LABELS[4],
                isPercentage: true,
                timeSeries: mortality,
            },
            {
                label: LABELS[5],
                isPercentage: true,
                timeSeries: percentRecovered,
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

// Compute additional region entries in `rows` as aggregations of countries,
// continents, or the whole world.
// Mutates rows
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
            if (!row.cases[key]) {
                continue;
            }
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

// Some of the country names used by JHU are not ideal. This replaces them with clearer names.
// mutates rows
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
