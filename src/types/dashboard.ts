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
    city?: string,
    province?: string,
    country: string,
    stats: Array<EntryStat>;
    // Vertical bar graph
    timeSeries: TimeSeriesData;
}

export interface EntryStat {
    label: string;
    val: number;
    percentage: boolean; // Is this a percentage value?
}

export interface TimeSeriesData {
    percentages: Array<Array<number>>; // Array of percentages for stacked bars
    amounts: Array<Array<number>>; // Raw amounts for each entry
    colors: Array<string>; // Array of background colors for the bars, bottom to top
    labels: Array<string>; // Array of bar labels corresponding to above colors, bottom to top
    yMax: number; // Maximum y-axis value
    yMin: number; // Minimum y-axis value
    xMin: string; // Minimum x-axis value (probably the start date)
    xMax: string; // Maximum x-axis value (probably the end date)
    yLabel: string; // Y-axis label
    xLabel: string; // X-axis label
}
