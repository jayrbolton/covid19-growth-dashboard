/*
 * Take data from the source and convert it into something more usable for our purposes.
 */
import parse from 'csv-parse';
import * as dataSources from '../constants/data-sources.json';
import * as states from '../constants/states.json';
import * as stateCodes from '../constants/state-codes.json';

const parser = parse({delimiter: dataSources.delimiter});

// Convert a blob of csv text into an array of objects with some normalization on dates, etc
export function transformData(sourceData) {
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
    let rows = [];
    for (const key in agg) {
        rows.push(agg[key]);
    }
    // Additional pre-computation
    rows = removeUSCounties(rows); // This must come before any aggregation
    insertAggregations(rows); // This must go before the below transformations
    getCurrentTotals(rows);
    getActives(rows);
    getAverages(rows);
    getPercentages(rows);
    getMaxes(rows);
    renameCountries(rows);
    return {
        dates: dates,
        rows: rows
    };
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
 * Compute aggregated totals for each time series in the region
 * Mutates each row in rows
 * @param rows
 */
function getCurrentTotals(rows) {
    for (const row of rows) {
        row.currentTotals = {}
        for (const key of dataSources.categoryKeys) {
            const timeSeries = row.cases[key];
            const current = timeSeries[timeSeries.length - 1];
            row.currentTotals[key] = current;
        }
    }
}

// Compute case averages, such as new cases in the last 7 days
// Mutates input
function getAverages (rows) {
    let idx = 0;
    for (const row of rows) {
        const active = row.cases.active;
        const newCases = active.reduce((agg, current, idx) => {
            let prev = 0;
            if (idx > 0) {
                prev = active[idx - 1];
            }
            agg.push(current - prev);
            return agg;
        }, [])
        const newCasesSum = newCases.reduce((sum, n) => sum + n, 0);
        const newCasesAllTime = Math.round(newCasesSum / newCases.length * 100) / 100;
        const sevenDays = newCases.slice(-7);
        const newCases7d = Math.round(sevenDays.reduce((sum, n) => sum + n, 0) / sevenDays.length * 100) / 100;
        row.averages = {
            newCasesAllTime,
            newCases7d
        };
        idx += 1;
    }
}

// Calculate percentage stats for the cases (eg. what is the percentage of deaths as compared to confirmed)?
// Mutates rows
function getPercentages (rows) {
    for (const row of rows) {
        const {confirmed, deaths, recovered, active} = row.currentTotals;
        let deathsPercentage = 0,
            recoveredPercentage = 0,
            activePercentage = 0;
        if (confirmed > 0) {
            deathsPercentage = Math.round(deaths * 1000 / confirmed) / 10;
            recoveredPercentage = Math.round(recovered * 1000 / confirmed) / 10;
            activePercentage = Math.round(active * 1000 / confirmed) / 10;
        }
        row.percentages = {
            deathsPercentage,
            recoveredPercentage,
            activePercentage
        }
    }
}

// Calculate max values for each time series
// Mutates rows
function getMaxes (rows) {
    for (const row of rows) {
        const confirmed = row.cases.confirmed.reduce((max, n) => n > max ? n : max, 0);
        const recovered = row.cases.recovered.reduce((max, n) => n > max ? n : max, 0);
        const deaths = row.cases.deaths.reduce((max, n) => n > max ? n : max, 0);
        row.maxes = {
            confirmed, recovered, deaths
        }
    }
}

/**
 * Adds an array of active cases on each date for each region.
 * This mutates each row.cases
 * @param rows
 */
function getActives(rows) {
    for (const row of rows) {
        row.cases.active = row.cases.confirmed.map((n, idx) =>
            n - row.cases.recovered[idx] - row.cases.deaths[idx]
        );
        row.currentTotals.active = row.currentTotals.confirmed -
            row.currentTotals.deaths -
            row.currentTotals.recovered;
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

/**
 * At one point, JHU was keeping data on US counties, and then stopped updating
 * their numbers. These counties need to be removed from the entries, and their
 * numbers added into the numbers for the whole-state entry.
 * @param rows
 */
function removeUSCounties(rows) {
    // Mapping of county "province" names to proper state names
    // We must take the stats for each county prior to 3/17 and aggregate them into the whole-state entries
    // "Washington, D.C." is a sub-region of "District of Columbia"
    // This is handled as a special case.
    const filtered = [];
    const countyRegex = /^.+, ([A-Z]\.?[A-Z]\.?)$/
    // Mapping of state names to rows
    const states = {};
    const counties = [];
    for (const row of rows) {
        if (row.country === 'US') {
            if (countyRegex.test(row.province)) {
                // Found a county
                counties.push(row);
            } else {
                // Not a county
                states[row.province] = row;
                filtered.push(row);
            }
        } else {
            filtered.push(row);
        }
    }
    for (const county of counties) {
        const matches = county.province.match(countyRegex);
        if (matches && matches.length === 2) {
            const stateCode = matches[1];
            const stateName = stateCodes[stateCode];
            const state = states[stateName];
            for (const key of dataSources.categoryKeys) { // 3 iterations
                state.cases[key] = state.cases[key].map((stateTotal, idx) => {
                    return stateTotal + county.cases[key][idx];
                })
            }
        } else {
            console.error('Unknown county: ' + county);
            continue;
        }
    }
    console.log(filtered);
    return filtered;
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
