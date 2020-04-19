/**
 * Data types used for the animated timeline page
 * Right now, only compatible with the JHU data source.
 */

export interface TimelineData {
    regions: Array<TimelineRegion>;
}

export interface TimelineRegion {
    // Unique ID across all regions
    id: string;
    name: string;
    // Sorting order
    order: number;
    // Total counts for each stat
    totals: {
        // Total confirmed cases (active + recovered)
        confirmed: Array<number>;
        // Total active cases (confirmed - recovered)
        active: Array<number>;
        // Total recovered (confirmed - active)
        recovered: Array<number>;
    };
    // Percentage values for the above stats
    percentages: {
        // Confirmed percentage for each date against the global max confirmed count across all regions and dates
        confirmedGlobal: Array<number>;
        // Active percentage for each date against that date's confirmed total
        active: Array<number>;
        // Recovered percentage for each date against that date's confirmed total
        recovered: Array<number>;
    };
}
