/*
 * Filtering functions
 */


export function filterLocation(rows, query: string = '') {
    return genericSearch(rows, row => row.location, query);
}

function genericSearch(rows, accessor, query) {
    query = query.toLowerCase();
    let hiddenCount = 0;
    return rows.filter(row => {
        const ref = String(accessor(row)).toLowerCase().trim();
        return ref.indexOf(query) !== -1;
    });
}
