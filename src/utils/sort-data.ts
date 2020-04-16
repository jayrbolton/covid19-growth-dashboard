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
            return ts[ts.length - 1];
        });
    }
}

export function genericSort(rows: Array<any>, accessor, dir='desc') {
    rows.sort((rowA, rowB) => {
        const valA = accessor(rowA)
        const valB = accessor(rowB)
        if (valA < valB) {
            return dir === 'asc' ? -1 : 1;
        } else if (valA > valB) {
            return  dir === 'asc' ? 1 : -1;
        } else {
            return 0;
        }
    });
}
