/**
 * Data types used in the generic consumed by the generic dashboard UI
 */

export interface DashboardData {
    entries: Array<DashboardEntry>;
}

export interface DashboardEntry {
    city?: string,
    province?: string,
    country: string,
    // First column which can show some stats, colored bars, percentages
    col0: {
        stats: Array<PercentageStat>;
    };
    // Second column which shows averages with a title
    col1: {
        title: string;
        stats: Array<AverageStat>;
    };
    // Vertical bar graph
    timeSeries: TimeSeriesData;
}

export interface PercentageStat {
    label: string; // Eg. "Confirmed"
    stat: number;  // Eg. 1234
    percentage: number; // Eg. "100%"
    barColor: string;   // Eg. "#222"
}

export interface AverageStat {
    label: string; // Eg. "Last 7 days"
    stat: number;  // Eg. 12.23
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
