/**
 * Data types used throughout the generic dashboard UI
 *
 * If you can translate some data source into this structure, then the dashboard UI will work.
 */

export interface DashboardData {
    entries: Array<DashboardEntry>;
    // Master list of statistic label names for each entry (so we know what to sort on)
    // Indexes should correspond to the same indexes in DashboardEntry.stats
    entryLabels: Array<string>;
}

export interface DashboardEntry {
    location: string;
    stats: Array<EntryStat>;
}

export interface EntryStat {
    label: string;
    val: number | null;
    isPercentage: boolean;
    percentGrowth: number;
    growthRate: number;
    timeSeries: TimeSeriesData;
}

export interface TimeSeriesData {
    values: Array<number>; // Actual values in the time series
    color: string; // Color for the line or bar 
}
