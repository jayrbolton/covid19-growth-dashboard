
// Pretty-print a number. eg. 123456 -> 123,456
export function formatNumber(x): string {
    if (x === null) {
        // In our data sources, null values are interpreted as "Unknown"
        return '?';
    }
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

export function formatUTCDateStr(date: string) {
    return new Date(date).toLocaleDateString();
}
