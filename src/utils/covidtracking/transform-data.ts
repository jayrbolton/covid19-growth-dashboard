/**
 * Transform the covidtracking.com data:
 * Take the raw JSON response and transform it into a DashboardData type
 */
import * as stateCodes from '../../constants/state-codes.json';
import {DashboardData} from '../../types/dashboard';

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
    // Convert the data into DashboardData
    let entries = [];
    for (const state in data) {
        const stateName = stateCodes[state];
        const {series} = data[state];
        const latest = series[series.length - 1];
        let percentPositive = 0;
        if (latest.totalTestResults > 0) {
            percentPositive = Math.round(latest.positive * 100 / latest.totalTestResults * 10) / 10;
        }
        const col0 = {
            stats: [
                {
                    label: 'Positive cases',
                    stat: latest.positive,
                    barColor: POS_COLOR,
                },
                {
                    label: 'Total tests',
                    stat: latest.totalTestResults,
                    barColor: TESTS_TOTAL_COLOR
                },
                {
                    label: 'Percent positive',
                    stat: percentPositive,
                    barColor: TESTS_TOTAL_COLOR,
                    percentage: true
                },
                {
                    label: 'Hospitalized',
                    stat: latest.hospitalized || 0,
                },
                {
                    label: 'Deaths',
                    stat: latest.death || 0,
                },
            ]
        };
        const newPositives = series.map(each => each.positiveIncrease);
        const averageAll = newPositives.reduce((sum, n) => sum + n, 0) / newPositives.length;
        const average7d = newPositives.slice(-7).reduce((sum, n) => sum + n, 0) / 7;
        const average3d = newPositives.slice(-3).reduce((sum, n) => sum + n, 0) / 3;
        const col1 = {
            title: 'Average new positive tests:',
            stats: [
                {
                    label: `Over ${series.length} days`,
                    stat: Math.round(averageAll * 100) / 100,
                },
                {
                    label: `Over 7 days`,
                    stat: Math.round(average7d * 100) / 100,
                },
                {
                    label: `Over 3 days`,
                    stat: Math.round(average3d * 100) / 100,
                }
            ]
        };
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
            country: 'US',
            col0,
            col1,
            timeSeries,
        };
        entries.push(entry);
    }
    return {entries};
}
