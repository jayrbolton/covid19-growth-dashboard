/*
 * Filtering functions
 */


// Filter rows by region (country/region/province/state) -- exact prefix match, case-insensitive
// Mutates rows
// Returns a count of total hidden rows
export function filterRows(rows, region: string) {
    region = region.toLowerCase();
    let hiddenCount = 0;
    for (const row of rows) {
        const loc = (row.province + ', ' + row.country).toLowerCase();
        if (loc.indexOf(region) === -1) {
            row.hidden = true;
            hiddenCount += 1;
        } else {
            row.hidden = false;
        }
    }
    return hiddenCount
}
