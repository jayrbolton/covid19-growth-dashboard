
// Average daily percent change of a series of values
export function getPercentGrowth(series: Array<number>): number {
    const nonulls = series.filter(val => val !== null && !isNaN(val));
    if (!nonulls.length) {
        return 0;
    }
    // Differences between today and yesterday
    const diffs = nonulls.map((val, idx) => {
        if (idx === 0) {
            return val;
        }
        return val - nonulls[idx - 1];
    });
    const percentages = diffs.reduce((agg, val, idx) => {
        if (idx === 0) {
            return agg;
        }
        const prev = nonulls[idx - 1];
        if (prev === 0) {
            return agg;
        }
        agg.push(val * 100 / prev);
        return agg;
    }, []);
    if (!percentages.length) {
        return 0;
    }
    const sum = percentages.reduce((sum, n) => sum + n, 0);
    const ret = sum / percentages.length;
    return Math.round(ret * 100) / 100;
}

// Get the exponential growth rate of a time series
export function getGrowthRate(series) {
    const first = series.find(n => n > 0);
    const current = series[series.length - 1];
    const growth = Math.log(current / first) / series.length;
    return Math.round(growth * 100) / 100;
}

// Get the rounded percentage of n out of `total` (two decimal places)
export function percent(n, total) {
    if (total === 0) {
        return 0;
    }
    return Math.round(n * 100 / total * 10) / 10;
}
