import * as colors from "../../constants/graph-colors.json";
import { DashboardData } from "../../types/dashboard";
import { rowToArray } from "../csv-parse";
import { percent, getPercentGrowth, getGrowthRate } from "../math";
import { setTimeSeriesWindow } from "../transform-data";
import { sortByStat } from "../sort-data";

const LABELS = ["Confirmed cases, cumulative", "Deaths", "Mortality rate"];

export function transformData(resp: string): DashboardData {
  const textRows = resp.split("\n");
  const headers = rowToArray(textRows[0]);
  const rows = textRows.slice(1).map(rowToArray);
  // First we need to aggregate all the rows by location
  const agg = {};
  for (const row of rows) {
    const id = [row[1], row[2], row[3]].join(":");
    if (!(id in agg)) {
      agg[id] = [];
    }
    agg[id].push(row);
  }
  const ret = {
    entries: [],
    entryLabels: LABELS,
    timeSeriesOffset: 0,
  };
  for (const fips in agg) {
    const series = agg[fips];
    const cases = series.map((row) => row[4]);
    const deaths = series.map((row) => row[5]);
    const mortality = series.map((row) => percent(row[5], row[4]));
    const location = [series[0][1], series[0][2]].join(", ");
    const stats = [
      {
        label: LABELS[0],
        isPercentage: false,
        timeSeries: cases,
      },
      {
        label: LABELS[1],
        isPercentage: false,
        timeSeries: deaths,
      },
      {
        label: LABELS[2],
        isPercentage: true,
        timeSeries: mortality,
      },
    ];
    const entry = {
      location,
      stats,
    };
    ret.entries.push(entry);
  }
  setTimeSeriesWindow(ret.entries);
  sortByStat(ret.entries, 0);
  return ret;
}
