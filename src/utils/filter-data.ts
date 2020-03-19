/*
 * Filtering functions
 */


// Filter rows by region (country/region/province/state) -- exact prefix match, case-insensitive
// Mutates rows
// Returns a count of total hidden rows
export function filterByCountry(rows, query: string = '') {
    return genericSearch(rows, row => row.country, query);
}

// Filter rows by region (country/region/province/state) -- exact prefix match, case-insensitive
// Mutates rows
// Returns a count of total hidden rows
export function filterByProvince(rows, query: string = '') {
    return genericSearch(rows, row => row.province || '', query);
}

function genericSearch(rows, accessor, query) {
    query = query.toLowerCase();
    let hiddenCount = 0;
    for (const row of rows) {
        const ref = String(accessor(row)).toLowerCase().trim();
        if (ref.indexOf(query) !== 0) {
            row.hidden = true;
            hiddenCount += 1;
        } else {
            row.hidden = false;
        }
    }
    return hiddenCount
}
