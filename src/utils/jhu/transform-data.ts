/*
 * Take data from the source and convert it into something more usable for our purposes.
 */
import { JHU_SOURCE } from "../../constants/data-sources";
import { rowToArray } from "../csv-parse";
import { percent } from "../math";
import { setTimeSeriesWindow } from "../transform-data";
import { sortByStat } from "../sort-data";
import { DashboardData } from "../../types/dashboard";
import { slugify } from '../slugify';

const LABELS = [
  "Confirmed cases, cumulative",
  "Recovered, cumulative",
  "Active cases",
  "Deaths",
  "Mortality rate",
  "Percent recovered",
];

// Parse the CSV headers and rows into a mapping of location to arrays of metrics
export function parseData(sourceData) {
  let dates = null; // All date columns, values parsed from the headers
  let agg = {}; // An aggregated mapping of id (constructed from lat/lng) to row data
  // Parse and aggregate the data
  for (const key in sourceData) {
    const text = sourceData[key];
    const lines = text.split("\n");
    if (!dates) {
      const headers = rowToArray(lines[0]);
      dates = parseDatesFromHeaders(headers);
    }
    lines.slice(1).forEach((rowStr) => {
      const row = rowToArray(rowStr);
      if (!row || !row.length) {
        return;
      }
      const location = row[JHU_SOURCE.countryIdx];
      const timeSeries = row.slice(JHU_SOURCE.seriesIdx);
      if (location in agg) {
        if (key in agg[location].cases) {
          const cases = agg[location].cases[key];
          for (let idx = 0; idx < timeSeries.length; idx++) {
            cases[idx] += timeSeries[idx];
          }
        } else {
          agg[location].cases[key] = timeSeries;
        }
      } else {
        agg[location] = {
          location,
          id: slugify(location),
          cases: {
            [key]: timeSeries,
          },
        };
      }
    });
  }
  return agg;
}

// Convert a blob of csv text into an array of objects with some normalization on dates, etc
// Used for the the Dashboard component
export function transformData(sourceData): DashboardData {
  const agg = parseData(sourceData);
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
  return { entries, entryLabels: LABELS, timeSeriesOffset: 0 };
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
    const percentRecovered = recovered.map((rec, idx) =>
      percent(rec, confirmed[idx])
    );
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
        timeSeries: deaths,
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
function parseDatesFromHeaders(headers) {
  const regex = new RegExp(JHU_SOURCE.dateRegex);
  const ret = [];
  for (const str of headers.slice(JHU_SOURCE.seriesIdx)) {
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
    aggregate: true,
    location: "Worldwide",
    id: 'worldwide',
    cases: {},
  };
  const totalCases = {};
  for (const key of JHU_SOURCE.categoryKeys) {
    totalCases[key] = [];
  }
  for (const row of rows) {
    for (const key of JHU_SOURCE.categoryKeys) {
      // 3 iterations
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
export function renameCountries(rows, prop = "location") {
  const mapping = {
    "Korea, South": "South Korea",
    US: "USA",
  };
  for (const row of rows) {
    if (row[prop] in mapping) {
      row[prop] = mapping[row[prop]];
    }
  }
}
