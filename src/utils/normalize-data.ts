/*
 * Take data from the source and convert it into something more usable for our purposes.
 */
import parse from 'csv-parse';
import * as dataSources from '~constants/data-sources.json';

const parser = parse({delimiter: dataSources.delimiter});

// TODO sort time series by date
// TODO combine the three time series (confirmed, deaths, recovered) into one array

// Convert a blob of csv text into an array of objects with some normalization on dates, etc
export function normalizeData(sourceData) {
    const ret = {};
    for (const key in sourceData) {
        const text = sourceData[key];
        const lines = text.split('\n');
        const headers = rowToArray(lines[0]);
        const rows = lines.slice(1)
            .map((row) => parseRow(row, headers))
            .map(normalizeDates);
        ret[key] = rows;
    }
    return ret;
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

// Convert a row into an object where the keys are the headers
function parseRow(row, headers) {
    const arr = rowToArray(row);
    const ret = {};
    headers.forEach((key, idx) => {
        ret[key] = arr[idx];
    });
    return ret;
}

// Convert all the date keys (such as {"2/22/2020": 123}) into an array of pairs of normalized dates [["2020-02-22", 123]])
function normalizeDates(data) {
    const re = new RegExp(dataSources.dateRegex);
    const timeSeries = [];
    for (const key in data) {
        const matches = key.match(re);
        // Date keys have the US-based format "month/day/year" such as "1/20/20"
        if (matches && matches.length === 4) {
            const month = Number(matches[1]);
            const day = Number(matches[2]);
            const year = 2000 + Number(matches[3]);
            timeSeries.push([[year, month, day], data[key]]);
            delete data[key];
        }
    }
    data.ts = timeSeries;
    return data;
}
