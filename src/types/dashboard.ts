/**
 * Data types used throughout the generic dashboard UI
 *
 * If you can translate some data source into this structure, then the dashboard UI will work.
 */

export interface DashboardData {
    entries: Array<DashboardEntry>;
    // Master list of metric label names for each entry (so we know what to sort on)
    // Indexes should correspond to the same order in DashboardEntry.stats
    entryLabels: Array<string>;
    // Number of days ago to offset timeSeriesWindow
    // This will probably always default to 0
    timeSeriesOffset: number;
}

export interface DashboardEntry {
    // Has this entry been filtered out by a search?
    hidden?: boolean;
    location: string;
    stats: Array<EntryStat>;
    percentages?: {
        // Percentage of totals of max total across all regions for every date
        totals: Array<number>;
        // Percentage of active cases of total cases for this region for every date
        active: Array<number>;
        // Percentage of recovered cases of total cases for this region for every date
        recovered: Array<number>;
    }
    // Does this entry aggregate other entries (eg. "Worldwide")
    aggregate?: boolean;
}

export interface EntryStat {
    label: string;
    isPercentage: boolean;
    // Full history from the data source
    timeSeries: Array<number>;
    // Eg. the last 14 days
    // Both the raw values and percentages for the window
    timeSeriesWindow: {
        values: Array<number>;
        percentages: Array<number>;
        // Percent growth calculated for the time series window
        percentGrowth: number;
    }
    // Is this stat marked for comparison/graphing
    isComparing?: boolean;
}
