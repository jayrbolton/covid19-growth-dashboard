
// Average daily percent change of a series of values
export function getPercentGrowth(series: Array<number>): number {
    const percentages = series.map((val, idx) => {
        if (idx === 0) {
            return 0;
        }
        let prev = series[idx - 1];
        if (prev === 0) {
            return 0;
        }
        return (val - prev) * 100 / prev;
    });
    const sum = percentages.reduce((sum, n) => sum + n, 0);
    return Math.round(sum / series.length * 100) / 100;
}

// Get the exponential growth rate of a time series
export function getGrowthRate(series) {
    const first = series.find(n => n > 0);
    const current = series[series.length - 1];
    const growth = Math.log(current / first) / series.length;
    return Math.round(growth * 100) / 100;
}

// Get the rounded percentage of n out of `total`
export function percent(n, total) {
    if (total === 0) {
        return 0;
    }
    return Math.round(n * 100 / total * 10) / 10;
}

