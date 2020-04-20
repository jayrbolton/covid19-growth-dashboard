import {TimelineData, TimelineRegion} from '../../types/timeline-data';
import {parseData} from './transform-data';
import {percent} from '../math';
import {sortByDaysAgo} from '../sort-data';


// Convert the CSV blobs from JHU into a TimelineData type
export function transformDataTimeline(sourceData): TimelineData {
    const agg = parseData(sourceData);
    const regions = [];
    let idx = 0;
    for (const key in agg) {
        const entry = agg[key];
        const {confirmed, recovered} = entry.cases;
        const active = confirmed.map((n, idx) => n - recovered[idx]);
        const region: TimelineRegion = {
            name: entry.location,
            id: entry.location,
            order: idx,
            totals: {
                confirmed,
                active,
                recovered: entry.cases.recovered,
            },
            percentages: {
                confirmedGlobal: [],
                active: [],
                recovered: [],
            },
        };
        regions.push(region);
        idx += 1;
    }
    const data: TimelineData = {
        regions,
        maxConfirmed: 0,
    };
    calculatePercentages(data);
    sortByDaysAgo(data, 0, 'confirmed');
    return data;
}

// Calculate percent active of total cases, percent recovered, and percent
// confirmed of max confirmed across all regions/dates
function calculatePercentages(data) {
    const regions = data.regions;
    // Find max of all total cases for a date and a region
    let max = 0;
    regions.forEach(region => {
        const confirmed = region.totals.confirmed;
        confirmed.forEach(n => {
            if (n > max) {
                max = n;
            }
        });
    });
    data.maxConfirmed = max;
    regions.forEach(region => {
        const {confirmed, active, recovered} = region.totals;
        const confirmedPerc = confirmed.map((n, idx) => {
            return percent(n, max);
        });
        const activePerc = active.map((n, idx) => percent(n, confirmed[idx]));
        const recoveredPerc = recovered.map((n, idx) => percent(n, confirmed[idx]));
        region.percentages = {
            confirmedGlobal: confirmedPerc,
            active: activePerc,
            recovered: recoveredPerc,
        };
    });
}
