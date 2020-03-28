/*
 * Sorting functions
 */

export function sortByStat(rows, index, dir='desc') {
    genericSort(rows, row => row.stats[index].val, dir);
}

export function genericSort(rows, accessor, dir='desc') {
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
