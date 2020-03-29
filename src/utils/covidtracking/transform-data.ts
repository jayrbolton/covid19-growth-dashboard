/**
 * Transform the covidtracking.com data:
 * Take the raw JSON response and transform it into a DashboardData type
 */
import * as stateCodes from '../../constants/state-codes.json';
import {DashboardData} from '../../types/dashboard';
import {genericSort} from '../../utils/sort-data';

const COLORS = [
    '#AA3377',
    '#BBBBBB',
    '#66CCEE',
    '#CCBB44',
    '#4477AA',
    '#228833',
    '#EE6677'
]

export function transformData(resp: string): DashboardData {
    // TODO on any server or parse error, show a UI message "failed to load data"
    const data = JSON.parse(resp)
        // Combine all repeated state entries into one aggregate object
        .reduce((accum, row) => {
            const state = row.state;
            if (!(state in accum)) {
                accum[state] = {state, series: []};
            }
            // For some reason, many of these keys are sometimes set to null.
            const numberKeys = ['positive', 'negative', 'pending', 'hospitalized', 'death', 'totalTestResults', 'totalTestResults', 'deathIncrease', 'hospitalizedIncrease', 'negativeIncrease', 'positiveIncrease', 'totalTestResultsIncrease'];
            for (const key of numberKeys) {
                if (row[key] === null) {
                    row[key] = 0;
                }
            }
            accum[state].series.unshift(row);
            return accum;
        }, {});
    // Compute an entry for all aggregated totals for the country
    // Keys are entry dates for fast lookup
    const aggregateSet = {};
    for (const key in data) {
        for (const entry of data[key].series) {
            const id = entry.date;
            if (!(id in aggregateSet)) {
                aggregateSet[id] = Object.assign({}, entry);  // clone
                aggregateSet[id].state = 'totals';
            } else {
                for (const entryKey in entry) {
                    if (typeof entry[entryKey] !== 'number') {
                        continue;
                    }
                    aggregateSet[id][entryKey] += entry[entryKey];
                }
            }
        }
    }
    const aggregateArr = [];
    for (const key in aggregateSet) {
        aggregateArr.push(aggregateSet[key]);
    }
    genericSort(aggregateArr, each => each.date, 'asc');
    data['totals'] = {
        state: null,
        country: 'US Totals',
        series: aggregateArr
    }
    /*
    const negative = getStat('Negative cases', COLORS[5], series.map(each => each.negative));
    const totalTests = getStat('Total tests', COLORS[1], series.map(each => each.totalTestResults));
    // Percentage stats
    const mortality = getPercentageStat('Percent death', COLORS[0], series.map(each => {
        return percent(each.death, each.positive);
    }));
    const percentHospitalized = getPercentageStat('Percent hospitalized', COLORS[3], data[state].series.map(each => {
        return percent(each.hospitalized, each.positive);
    }));
    */
    // Convert the data into DashboardData
    let entries = [];
    const entryStats = [
        {
            label: 'Positive cases',
            stat(series) {
                return getStat(this.label, COLORS[0], series.map(each => each.positive));
            }
        },
        {
            label: 'Percent positive',
            stat (series) {
                return getPercentageStat(this.label, COLORS[4], series.map(each => {
                    return percent(each.positive, each.totalTestResults);
                }));
            }
        },
        {
            label: 'Hospitalized',
            stat (series) {
                return getStat(this.label, COLORS[3], series.map(each => each.hospitalized));
            }
        },
        {
            label: 'Deaths',
            stat (series) {
                return getStat(this.label, COLORS[2], series.map(each => each.death));
            }
        }
    ];
    // Labels and accessor functions for each entry stats const entryStats = [
    for (const state in data) {
        const stateName = stateCodes[state];
        const series = data[state].series;
        const entry = {
            location: getLocation(data[state]),
            stats: entryStats.map(each => each.stat(series)),
        };
        entries.push(entry);
    }
    const entryLabels = entryStats.map(({label}) => label);
    return {entries, entryLabels};
}

function getLocation(row) {
    const stateName = stateCodes[row.state];
    return [stateName, row.country || 'US'].filter(x => x).join(', ');
}

function getStat(label, color, series) {
    const timeSeries = {values: series, color}
    const stat = {
        label,
        val: series[series.length - 1],
        isPercentage: false,
        percentGrowth: getPercentGrowth(series),
        growthRate: getGrowthRate(series),
        timeSeries,
    };
    return stat;
}

function getPercentageStat(label, color, series) {
    const timeSeries = {values: series, color};
    const stat = {
        label,
        val: series[series.length - 1],
        isPercentage: true,
        percentGrowth: getPercentGrowth(series),
        growthRate: getGrowthRate(series),
        timeSeries,
    };
    return stat;
}

function getPercentPositiveStat(row) {
    const series = row.series.map(each => {
        return percent(each.positive, each.totalTestResults);
    });
    console.log(series);
    const timeSeries = {
        values: series,
        color: COLORS[1],
    }
    const stat = {
        label: 'Percent positive',
        val: series[series.length - 1],
        isPercentage: true,
        percentGrowth: getPercentGrowth(series),
        growthRate: getGrowthRate(series),
        timeSeries,
    };
    return stat;
}

function getMortalityStat(row) {
    const series = row.series.map(each => {
        return percent(each.deaths, each.totalTestResults);
    });
    console.log(series);
    const timeSeries = {
        values: series,
        color: COLORS[1],
    }
    const stat = {
        label: 'Percent positive',
        val: series[series.length - 1],
        isPercentage: true,
        percentGrowth: getPercentGrowth(series),
        growthRate: getGrowthRate(series),
        timeSeries,
    };
    return stat;
}

/**
 * Average daily percent change 
 */
function getPercentGrowth(series: Array<number>): number {
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

function getGrowthRate(series) {
    const first = series.find(n => n > 0);
    const current = series[series.length - 1];
    const growth = Math.log(current / first) / series.length;
    return Math.round(growth * 100) / 100;
}

function percent(n, total) {
    if (total === 0) {
        return 0;
    }
    return Math.round(n * 100 / total * 10) / 10;
}
