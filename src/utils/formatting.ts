// Pretty-print a number. eg. 123456 -> 123,456
// Also, 120000 -> 120k
export function formatNumber(
  x: number | null,
  roundThousands: boolean = true
): string {
  if (x === null || isNaN(x)) {
    // In our data sources, null values are interpreted as "Unknown"
    return "?";
  }
  if (roundThousands && x > 0 && x % 1000 === 0) {
    return x / 1000 + "k";
  }
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

export function formatUTCDateStr(date: string) {
  return new Date(date).toLocaleDateString();
}

export function pluralize(word: string, count: number): string {
  return count === 1 ? word : word + "s";
}
