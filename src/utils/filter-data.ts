/*
 * Filtering functions
 */


// Filter rows by region (country/region/province/state) -- exact prefix match, case-insensitive
// Returns a new array of arrays
export function filterByCountry(rows, query: string = '') {
    return genericSearch(rows, row => row.country, query);
}

// Filter rows by region (country/region/province/state) -- exact prefix match, case-insensitive
// Returns a new array of arrays
export function filterByProvince(rows, query: string = '') {
    return genericSearch(rows, row => row.province || '', query);
}

function genericSearch(rows, accessor, query) {
    query = query.toLowerCase();
    let hiddenCount = 0;
    return rows.filter(row => {
        const ref = String(accessor(row)).toLowerCase().trim();
        return ref.indexOf(query) === 0;
    });
}
