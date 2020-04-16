// Generic data transformation utils
import * as uiSettings from '../constants/ui-settings.json';
import {percent, getPercentGrowth} from './math';
import {DashboardData, DashboardEntry, EntryStat} from '../types/dashboard';


// Compute the timeSeriesWindow array for each entry's stat using a daysAgo offset
export function setTimeSeriesWindow(entries: Array<DashboardEntry>, daysAgo: number = 0): void {
  const sliceEnd = -(daysAgo + 1);
  const sliceStart = -uiSettings.timeSeriesLen - daysAgo;
  entries.forEach((entry: DashboardEntry) => {
    entry.stats.forEach((stat: EntryStat) => {
        const values = stat.timeSeries.slice(sliceStart, sliceEnd);
        const max = values.reduce((max, n) => n > max ? n : max, 0);
        const percentages = values.map(v => percent(v, max))
        stat.timeSeriesWindow = {
            values,
            percentages,
            percentGrowth: getPercentGrowth(values),
        }
    });
  });
}
