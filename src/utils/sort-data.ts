/*
 * Sorting functions
 */


// Sort all entries by the current total confirmed cases
// Data is sorted in place without cloning
export function sortByTotalConfirmed(rows, dir='desc') {
    genericSort(rows, row => row.col0.stats[0].stat);
}

// Sort by the recent growth rate over last 7 days
// Data is sorted in place without cloning
export function sortByGrowth(rows, dir='desc') {
    genericSort(rows, row => row.col1.stats[1].stat, dir);
}

// Sort by the recent growth rate over last 7 days
// Data is sorted in place without cloning
export function sortByDeaths(rows, dir='desc') {
    genericSort(rows, row => row.col0.stats[1].stat, dir);
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
