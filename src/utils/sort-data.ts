/*
 * Sorting functions
 */


// Sort all entries by the current total confirmed cases
export function sortByTotalConfirmed(data, dir='desc') {
    // Data is sorted in place without cloning
    data.sort((rowA, rowB) => {
        const confirmedA = rowA.totals.confirmed[rowA.totals.confirmed.length - 1];
        const confirmedB = rowB.totals.confirmed[rowB.totals.confirmed.length - 1];
        if (confirmedA < confirmedB) {
            return dir === 'asc' ? -1 : 1;
        } else if (confirmedA > confirmedB) {
            return  dir === 'asc' ? 1 : -1;
        } else {
            return 0;
        }
    });
    return data;
}
