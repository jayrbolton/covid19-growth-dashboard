import * as colors from '../../constants/graph-colors.json';
import {DashboardData} from '../../types/dashboard';
import {rowToArray} from '../csv-parse';
import {percent, getPercentGrowth, getGrowthRate} from '../../utils/math';


export function transformData(resp: string): DashboardData {
    const textRows = resp.split('\n');
    const headers = rowToArray(textRows[0]);
    const rows = textRows.slice(1).map(rowToArray);
    // First we need to aggregate all the rows by location
    const agg = {};
    for (const row of rows) {
        const fips = row[3];
        if (!(fips in agg)) {
            agg[fips] = [];
        }
        agg[fips].push(row);
    }
    const ret = {
        entries: [],
        entryLabels: ['Cases', 'Deaths', 'Mortality rate'],
    };
    for (const fips in agg) {
        const series = agg[fips];
        const cases = series.map(row => row[4]);
        const deaths = series.map(row => row[5]);
        const mortality = series.map(row => percent(row[5], row[4]));
        const location = [series[0][1], series[0][2]].join(', ');
        const stats = [
            {
                label: 'Cases',
                val: cases[cases.length - 1],
                isPercentage: false,
                percentGrowth: getPercentGrowth(cases),
                growthRate: getGrowthRate(cases),
                timeSeries: {
                    values: cases,
                    color: colors[6],
                }
            },
            {
                label: 'Deaths',
                val: deaths[deaths.length - 1],
                isPercentage: false,
                percentGrowth: getPercentGrowth(deaths),
                growthRate: getGrowthRate(deaths),
                timeSeries: {
                    values: deaths,
                    color: colors[5],
                }
            },
            {
                label: 'Mortality rate',
                val: mortality[mortality.length - 1],
                isPercentage: true,
                percentGrowth: getPercentGrowth(mortality),
                growthRate: getGrowthRate(mortality),
                timeSeries: {
                    values: mortality,
                    color: colors[4],
                }
            }
        ];
        const entry = {
            location,
            stats,
        }
        ret.entries.push(entry);
    }
    return ret;
}
