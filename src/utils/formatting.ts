
// Pretty-print a number. eg. 123456 -> 123,456
export function formatNumber(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
