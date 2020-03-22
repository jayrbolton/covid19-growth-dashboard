/*
 * Sorting functions
 */


// Sort all entries by the current total confirmed cases
// Data is sorted in place without cloning
export function sortByTotalConfirmed(rows, dir='desc') {
    genericSort(rows, row => row.cases.confirmed[row.cases.confirmed.length - 1]);
}

// Sort by the recent growth rate over last 7 days
// Data is sorted in place without cloning
export function sortByGrowth(rows, dir='desc') {
    genericSort(rows, row => row.averages.newCases7d, dir);
}

function genericSort(rows, accessor, dir='desc') {
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
