/*
 * Generic data transformation utils
 */
import { UI_SETTINGS } from "../constants/ui-settings";
import { percent, getPercentGrowth } from "./math";
import { DashboardData, DashboardEntry, EntryStat } from "../types/dashboard";

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
      const values = stat.timeSeries.slice(sliceStart, sliceEnd);
      const max = values.reduce((max, n) => (n > max ? n : max), 0);
      const percentages = values.map((v) => percent(v, max));
      stat.timeSeriesWindow = {
        values,
        percentages,
        percentGrowth: getPercentGrowth(values),
      };
    });
  });
}
