/*
 * Take data from the source and convert it into something more usable for our purposes.
 */
import parse from 'csv-parse';
import * as dataSources from '~constants/data-sources.json';

const parser = parse({delimiter: dataSources.delimiter});

// Convert a blob of csv text into an array of objects with some normalization on dates, etc
export function normalizeData(sourceData) {
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
                    totals: {},
                    currentTotals: {}
                };
                for (const key of dataSources.categoryKeys) {
                    agg[id].totals[key] = [];
                    agg[id].currentTotals[key] = 0;
                }
            }
            const ts = row.slice(dataSources.seriesIdx);
            agg[id].totals[key] = ts;
            const current = ts[ts.length - 1];
            agg[id].currentTotals[key] = current;
        });
    }
    // Convert the aggregation object into an array
    const rows = [];
    for (const key in agg) {
        rows.push(agg[key]);
    }
    // Additional pre-computation
    getActives(rows);
    getAverages(rows);
    getPercentages(rows);
    getMaxes(rows);
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

// Compute case averages, such as new cases in the last 7 days
// Mutates input
function getAverages (rows) {
    let idx = 0;
    for (const row of rows) {
        const active = row.totals.active;
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
        if (row.country === 'Korea, South') {
            console.log('active', active);
            console.log('new cases', newCases);
            console.log('new cases 7 d', newCases7d);
        }
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
        const confirmed = row.totals.confirmed.reduce((max, n) => n > max ? n : max, 0);
        const recovered = row.totals.recovered.reduce((max, n) => n > max ? n : max, 0);
        const deaths = row.totals.deaths.reduce((max, n) => n > max ? n : max, 0);
        row.maxes = {
            confirmed, recovered, deaths
        }
    }
}

/**
 * Adds an array of active cases on each date for each region.
 * This mutates each row.totals
 * @param rows
 */
function getActives(rows) {
    for (const row of rows) {
        row.totals.active = row.totals.confirmed.map((n, idx) =>
            n - row.totals.recovered[idx] - row.totals.deaths[idx]
        );
        row.currentTotals.active = row.currentTotals.confirmed -
            row.currentTotals.deaths -
            row.currentTotals.recovered;
    }
}
