/**
 * Transform the covidtracking.com data:
 * Take the raw JSON response and transform it into a DashboardData type
 */
import * as stateCodes from '../../constants/state-codes.json';
import {DashboardData} from '../../types/dashboard';
import {genericSort} from '../../utils/sort-data';

const TESTS_TOTAL_COLOR = 'rgb(53, 126, 221)';
const NEG_COLOR = '#00449E';
const POS_COLOR = '#FF6300';

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
    // Convert the data into DashboardData
    let entries = [];
    // Labels and accessor functions for each entry stats const entryStats = [
    const entryStats = [
        {
            label: 'Positive cases',
            accessor: entry => entry.positive,
            percentage: false
        },
        {
            label: 'Total tests',
            accessor: entry => entry.totalTestResults,
            percentage: false
        },
        {
            label: 'Percent positive',
            accessor: entry => Math.round(entry.positive * 100 / entry.totalTestResults * 10) / 10,
            percentage: true
        },
        {
            label: 'Hospitalized',
            accessor: entry => entry.hospitalized,
            percentage: false
        },
        {
            label: 'Deaths',
            accessor: entry => entry.death,
            percentage: false
        },
        {
            label: 'Mortality rate',
            accessor: entry => Math.round(entry.death * 100 / entry.positive * 10) / 10,
            percentage: true,
        },
    ];
    for (const state in data) {
        const stateName = stateCodes[state];
        const {series} = data[state];
        const latest = series[series.length - 1];
        let percentPositive = 0;
        if (latest.totalTestResults > 0) {
            percentPositive = Math.round(latest.positive * 100 / latest.totalTestResults * 10) / 10;
        }
        const stats = entryStats.map(({label, accessor, percentage}, idx) => {
            return {label, percentage, val: accessor(latest)};
        });
        const maxPos = series.reduce((max, each) => each.positive > max ? each.positive : max, 0);
        const minPos = series.reduce((min, each) => each.positive < min ? each.positive : min, Infinity);
        const percentages = series.map(each => {
            // const neg = Math.round(each.negative * 100 / maxPos * 100) / 100;
            const pos = Math.round(each.positive * 100 / maxPos * 100) / 100;
            return [pos];
        });
        const amounts = series.map(each => {
            return [each.positive];
        });
        while (percentages.length < 50) {
            percentages.unshift([0]);
            amounts.unshift([0]);
        }
        const startDate = series[0].dateChecked; // TODO format
        const endDate = series[series.length - 1].dateChecked; // TODO format
        const timeSeries = {
            percentages,
            amounts,
            colors: [POS_COLOR],
            labels: ['Positive cases'],
            yMax: maxPos,
            yMin: minPos,
            xMin: startDate,
            xMax: endDate,
            yLabel: 'Test results',
            xLabel: 'Days',
        };
        const entry = {
            city: null,
            province: stateName,
            country: data[state].country || 'US',
            stats,
            timeSeries,
        };
        entries.push(entry);
    }
    const entryLabels = entryStats.map(({label}) => label);
    return {entries, entryLabels};
}
