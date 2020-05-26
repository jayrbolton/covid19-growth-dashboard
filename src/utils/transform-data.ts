/*
 * Generic data transformation utils
 */
import { UI_SETTINGS } from "../constants/ui-settings";
import { percent, getPercentGrowth, getAvgChange } from "./math";
import { DashboardData, DashboardEntry, EntryStat } from "../types/dashboard";
import { slugify } from "./slugify";

// Compute the timeSeriesWindow array for each entry's stat using a daysAgo offset
export function setTimeSeriesWindow(
  entries: Array<DashboardEntry>,
  daysAgo: number = 0
): void {
  const sliceStart = -1 * UI_SETTINGS.timeSeriesLen - daysAgo - 1;
  let sliceEnd = sliceStart + UI_SETTINGS.timeSeriesLen + 1;
  if (sliceEnd === 0) {
    sliceEnd = undefined;
  }
  entries.forEach((entry: DashboardEntry) => {
    entry.stats.forEach((stat: EntryStat) => {
      computeTimeSeriesWindow(
        stat,
        "timeSeriesWindow",
        UI_SETTINGS.timeSeriesLen,
        daysAgo
      );
      computeTimeSeriesWindow(
        stat,
        "longWindow",
        UI_SETTINGS.longSeriesLen,
        daysAgo
      );
      computeAverages(stat);
      stat.id = slugify(stat.label);
    });
  });
}

// Compute the values, percentages of max, and average percent growth
// Mutates stat
function computeTimeSeriesWindow(stat, key, len, daysAgo) {
  const series = stat.timeSeries;
  const sliceStart = -1 * len - daysAgo - 1;
  let sliceEnd = sliceStart + len + 1;
  if (sliceEnd === 0) {
    sliceEnd = undefined;
  }
  const values = series.slice(sliceStart, sliceEnd);
  const windowMax = values.reduce((max, n) => (n > max ? n : max), 0);
  const percentages = values.map((v) => percent(v, windowMax));
  stat[key] = {
    values,
    percentages,
    percentGrowth: getPercentGrowth(values),
  };
}

// For the longWindow, compute the multiple averages
// Mutates stat
function computeAverages(stat) {
  const vals = stat.longWindow.values;
  stat.longWindow.percentGrowths = [];
  stat.longWindow.change = [];
  UI_SETTINGS.detailsAverages.forEach((days) => {
    const window = vals.slice(vals.length - days, vals.length);
    stat.longWindow.percentGrowths.push(getPercentGrowth(window));
    stat.longWindow.change.push(getAvgChange(window));
  });
}
