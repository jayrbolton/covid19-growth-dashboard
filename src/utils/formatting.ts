
// Pretty-print a number. eg. 123456 -> 123,456
export function formatNumber(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// Return a localized format of a utc date
// `date` should be in the format [year, month, day]
export function formatUTCDate(date: Array<number>) {
    return new Date(date.join('-')).toLocaleDateString();
}
