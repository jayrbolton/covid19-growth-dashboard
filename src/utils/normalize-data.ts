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
    let maxTotal = 0;
    console.log(sourceData);
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
            // console.log(`setting totals for id ${id} with key ${key} to ${ts}`)
            agg[id].totals[key] = ts;
            const current = ts[ts.length - 1];
            agg[id].currentTotals[key] = current;
            if (current > maxTotal) {
                maxTotal = current;
            }
        })
    }
    // Convert the aggregation object into an array
    const rows = [];
    for (const key in agg) {
        rows.push(agg[key]);
    }
    return {
        maxTotal: 200000,
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
// It would be better to use a library. But I got frustrated looking at the libraries on npm and decided to write this simple parser.
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
