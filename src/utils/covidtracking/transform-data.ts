/**
 * Transform the covidtracking.com data:
 * Take the raw JSON response and transform it into a DashboardData type
 */
import * as stateCodes from '../../constants/state-codes.json';
import {DashboardData} from '../../types/dashboard';
import {genericSort} from '../../utils/sort-data';
import {percent, getPercentGrowth, getGrowthRate} from '../../utils/math';

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
    // Convert the data into DashboardData
    let entries = [];
    const entryStats = [
        {
            label: 'Positive cases, cumulative',
            stat(series) {
                return getStat(this.label, COLORS[0], series.map(each => each.positive));
            }
        },
        {
            label: 'Percent positive',
            stat (series) {
                const nonulls = series.filter(each => {
                    return each.positive !== null && each.totalTestResults !== null
                });
                return getPercentageStat(this.label, COLORS[4], nonulls.map(each => {
                    return percent(each.positive, each.totalTestResults);
                }));
            }
        },
        {
            label: 'Hospitalized, current',
            stat (series) {
                return getStat(this.label, COLORS[3], series.map(each => each.hospitalizedCurrently));
            }
        },
        {
            label: 'Deaths',
            stat (series) {
                return getStat(this.label, COLORS[2], series.map(each => each.death));
            }
        },
        {
            label: 'Mortality rate',
            stat (series) {
                const nonulls = series.filter(each => {
                    return each.death !== null && each.positive !== null;
                });
                return getPercentageStat(this.label, COLORS[2], nonulls.map(each => {
                    return percent (each.death, each.positive);
                }));
            }
        },
        {
            label: 'Negative tests, cumulative',
            stat (series) {
                return getStat(this.label, COLORS[5], series.map(each => each.negative));
            }
        },
        {
            label: 'Total tests, cumulative',
            stat (series) {
                return getStat(this.label, COLORS[6], series.map(each => each.totalTestResults));
            }
        },
        {
            label: 'Hospitalized, cumulative',
            stat (series) {
                return getStat(this.label, COLORS[1], series.map(each => each.hospitalizedCumulative));
            }
        },
        {
            label: 'Percent positive hospitalized',
            stat (series) {
                const nonulls = series.filter(each => {
                    return each.hospitalizedCumulative !== null && each.positive !== null;
                });
                return getPercentageStat(this.label, COLORS[2], nonulls.map(each => {
                    return percent (each.hospitalizedCumulative, each.positive);
                }));
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
    let current = series[series.length - 1];
    const stat = {
        label,
        val: current,
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
