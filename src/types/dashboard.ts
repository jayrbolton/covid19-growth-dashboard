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
  id: string;
  stats: Array<EntryStat>;
}

export interface EntryStat {
  label: string;
  id: string;
  isPercentage: boolean;
  timeSeries: Array<number>;
  // Eg. the last 14 days
  // Both the raw values and percentages for the window
  timeSeriesWindow?: {
    values: Array<number>;
    percentages: Array<number>;
    // Percent growth calculated for the time series window
    percentGrowth: number;
  };
  // A longer time series window for the region details pages
  longWindow?: {
    values: Array<number>;
    percentages: Array<number>;
    percentGrowth: number;
  }
  // Is this stat marked for comparison/graphing
  isComparing?: boolean;
}
