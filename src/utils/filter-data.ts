/*
 * Filtering functions
 */
import {DashboardEntry} from '../types/dashboard';


// Mark entries as hidden if their location does not have the query string as a substring
// Return the total number of entries that were not hidden
export function filterLocation(entries: Array<DashboardEntry>, query: string = ''): number {
    let resultsCount = 0;
    entries.forEach((entry: DashboardEntry) => {
        const ref = String(entry.location).toLowerCase().trim();
        entry.hidden = ref.indexOf(query) === -1;
        if (!entry.hidden) {
          resultsCount += 1;
        }
    });
  return resultsCount;
}
