interface FormatNumberParams {
  num?: number | null;
  // Whether to truncate even thousands and append "k"
  roundThousands?: boolean;
  // Whether to truncate millions and append "m"
  roundMillions?: boolean;
  // Whether to show percentage symbol
  percentage?: boolean;
  // Whether to show positive sign (negative is always shown)
  showSign?: boolean;
}

// Pretty-print a number. eg. 123456 -> 123,456
// Also, 120000 -> 120k
export function formatNumber({
  num = null,
  roundThousands = false,
  roundMillions = false,
  percentage = false,
  showSign = false,
}: FormatNumberParams): string {
  const isZero = num === 0;
  const isPositive = num > 0;
  if (num === null || isNaN(num)) {
    // In our data sources, null values are interpreted as "Unknown"
    return "?";
  }
  if (roundMillions && num >= 1000000) {
    const modm = num % 1000000;
    const modmodm = modm % 100000;
    if (modm === 0 || modmodm === 0) {
      return num / 1000000 + "m";
    }
  } else if (roundThousands && num > 0) {
    if (num % 1000 === 0) {
      return num / 1000 + "k";
    }
  }
  let ret = num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  if (percentage) {
    ret = ret + "%";
  }
  if (showSign && !isZero) {
    ret = isPositive ? "+" + ret : ret;
  }
  return ret;
}

export function formatUTCDateStr(date: string) {
  return new Date(date).toLocaleDateString();
}

export function pluralize(word: string, count: number): string {
  return count === 1 ? word : word + "s";
}
