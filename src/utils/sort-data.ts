/*
 * Sorting functions
 */
import {DashboardEntry} from '../types/dashboard';

// Sort by a some EntryStat within a DashboardEntry
// idxOffset
export function sortByStat(entries: Array<DashboardEntry>, statIdx: number, growth=false): void {
    if (growth) {
        // Sort by percentage growth
        genericSort(entries, entry => entry.stats[statIdx].timeSeriesWindow.percentGrowth);
    } else {
        // Sort by current time series value
        genericSort(entries, entry => {
            const ts = entry.stats[statIdx].timeSeriesWindow.values;
            const val = ts[ts.length - 1];
            return val;
        });
    }
}

// Sort by an entry in the stats for each region offset by a number of days ago
export function sortByDaysAgo(entries: Array<DashboardEntry>, daysAgo: number, statIdx: number): void {
    const indexes = entries.map((_, idx) => idx);
    genericSort(indexes, idx => {
        const entry = entries[idx];
        const series = entries[idx].stats[statIdx].timeSeries;
        return series[series.length - (daysAgo + 1)];
    });
    indexes.forEach((idx, order) => {
        entries[idx].order = order;
    });
}

export function genericSort(rows: Array<any>, accessor, dir='desc') {
    rows.sort((rowA, rowB) => {
        let valA = accessor(rowA)
        let valB = accessor(rowB)
        if (isNaN(valA) || valA === null || valA === undefined) {
            valA = 0;
        }
        if (isNaN(valB) || valB === null || valB === undefined) {
            valB = 0;
        }
        if (valA < valB) {
            return dir === 'asc' ? -1 : 1;
        } else if (valA > valB) {
            return  dir === 'asc' ? 1 : -1;
        } else {
            return 0;
        }
    });
}
