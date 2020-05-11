/**
 * Transform the covidtracking.com data:
 * Take the raw JSON response and transform it into a DashboardData type
 */
import { STATE_CODES, STATE_NAMES } from "../../constants/states";
import { DashboardData, EntryStat } from "../../types/dashboard";
import { genericSort, sortByStat } from "../sort-data";
import { percent } from "../math";
import { setTimeSeriesWindow } from "../transform-data";
import { slugify } from '../slugify';

export function transformData(resp: string): DashboardData {
  const data = JSON.parse(resp)
    // Combine all repeated state entries into one aggregate object
    .reduce((accum, row) => {
      const state = row.state;
      if (!(state in accum)) {
        accum[state] = { state, series: [] };
      }
      accum[state].series.unshift(row);
      return accum;
    }, {});
  computeUSTotals(data);
  // Convert the data into DashboardData
  let entries = [];
  for (const state in data) {
    const stateName = STATE_CODES[state];
    const series = data[state].series;
    const location = getLocation(data[state]);
    const entry = {
      location,
      id: slugify(location),
      stats: ENTRY_STATS.map((each) => each.createStat(series)),
    };
    entries.push(entry);
  }
  const entryLabels = ENTRY_STATS.map(({ label }) => label);
  setTimeSeriesWindow(entries, 0);
  sortByStat(entries, 0);
  return { entries, entryLabels, timeSeriesOffset: 0 };
}

function getLocation(row) {
  const stateName = STATE_CODES[row.state];
  return [stateName, row.country || "US"].filter((x) => x).join(", ");
}

// Compute an entry for all aggregated totals for the country
function computeUSTotals(data) {
  // Keys are entry dates for fast lookup
  const aggregateSet = {};
  for (const key in data) {
    for (const entry of data[key].series) {
      const id = entry.date;
      if (!(id in aggregateSet)) {
        aggregateSet[id] = Object.assign({}, entry); // clone
        aggregateSet[id].state = "totals";
      } else {
        for (const entryKey in entry) {
          if (typeof entry[entryKey] !== "number") {
            continue;
          }
          aggregateSet[id][entryKey] += entry[entryKey];
        }
      }
    }
  }
  const aggregateArr = [];
  for (const key in aggregateSet) {
    aggregateArr.push(aggregateSet[key]);
  }
  genericSort(aggregateArr, (each) => each.date, "asc");
  data["totals"] = {
    state: null,
    country: "US Totals",
    series: aggregateArr,
  };
}

// Generic function to create an EntryStat object for some series
function stat(label, series, isPercentage = false): EntryStat {
  const stat = {
    label,
    isPercentage,
    timeSeries: series,
  };
  return stat;
}

// A collection of EntryStat labels and generator functions
const ENTRY_STATS = [
  {
    label: "Positive cases, cumulative",
    createStat(series) {
      return stat(
        this.label,
        series.map((each) => each.positive)
      );
    },
  },
  {
    label: "Percent of tests positive",
    createStat(series) {
      const nonulls = series.filter((each) => {
        return each.positive !== null && each.totalTestResults !== null;
      });
      return stat(
        this.label,
        nonulls.map((each) => {
          return percent(each.positive, each.totalTestResults);
        }),
        true
      );
    },
  },
  {
    label: "Hospitalized, current",
    createStat(series) {
      return stat(
        this.label,
        series.map((each) => each.hospitalizedCurrently)
      );
    },
  },
  {
    label: "Deaths",
    createStat(series) {
      return stat(
        this.label,
        series.map((each) => each.death)
      );
    },
  },
  {
    label: "Mortality rate",
    createStat(series) {
      const nonulls = series.filter((each) => {
        return each.death !== null && each.positive !== null;
      });
      return stat(
        this.label,
        nonulls.map((each) => {
          return percent(each.death, each.positive);
        }),
        true
      );
    },
  },
  {
    label: "Negative tests, cumulative",
    createStat(series) {
      return stat(
        this.label,
        series.map((each) => each.negative)
      );
    },
  },
  {
    label: "Percent of tests negative",
    createStat(series) {
      const nonulls = series.filter((each) => {
        return each.negative !== null && each.totalTestResults !== null;
      });
      return stat(
        this.label,
        nonulls.map((each) => {
          return percent(each.negative, each.totalTestResults);
        }),
        true
      );
    },
  },
  {
    label: "Total tests, cumulative",
    createStat(series) {
      return stat(
        this.label,
        series.map((each) => each.totalTestResults)
      );
    },
  },
  {
    label: "Hospitalized, cumulative",
    createStat(series) {
      return stat(
        this.label,
        series.map((each) => each.hospitalizedCumulative)
      );
    },
  },
  {
    label: "Percent positive hospitalized",
    createStat(series) {
      const nonulls = series.filter((each) => {
        return each.hospitalizedCumulative !== null && each.positive !== null;
      });
      return stat(
        this.label,
        nonulls.map((each) => {
          return percent(each.hospitalizedCumulative, each.positive);
        }),
        true
      );
    },
  },
];
