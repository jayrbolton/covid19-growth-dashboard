import * as colors from "../constants/graph-colors.json";
import { DashboardData, EntryStat } from "../types/dashboard";

interface SelectedMetric {
  location: string;
  stat: EntryStat;
}

// Compute the labels and x/y axis data to render multiple metrics onto a single chart
// `chart` is a Chart.js instance
// Mutates the chart object and updates the chart
export function computeLineChartData(sourceData: DashboardData, chart) {
  // Find all the selected stats objects within the dashboard entries
  const metrics: Array<SelectedMetric> = [];
  sourceData.entries.forEach((entry) => {
    entry.stats.forEach((stat) => {
      if (stat.isComparing) {
        metrics.push({ location: entry.location, stat: stat });
      }
    });
  });
  // Find the maximum stats time series length so we know how many x axis ticks to make
  const maxMetricsLen = metrics.reduce((max, metric) => {
    const len = metric.stat.timeSeries.length;
    return len > max ? len : max;
  }, 0);
  // Create an array of labels for the x axis
  const labels = [];
  for (let idx = 0; idx < maxMetricsLen; idx++) {
    const daysAgo = maxMetricsLen - idx;
    const date = new Date();
    date.setDate(date.getUTCDate() - daysAgo);
    labels.push(date.toLocaleDateString());
  }
  chart.data.labels = labels;
  // Create the datasets for each line
  // See the chart.js documentation for line charts
  const datasets = metrics.map((m, idx) => {
    const data = m.stat.timeSeries.map((yVal, idx) => {
      if (isNaN(yVal) || yVal === null || yVal === undefined) {
        yVal = 0;
      }
      return yVal;
    });
    // Zero pad the beginning of the time series in case it is shorter than the max
    while (data.length < maxMetricsLen) {
      data.unshift(0);
    }
    return {
      label: m.location + " - " + m.stat.label,
      data,
      borderColor: colors[idx],
      backgroundColor: colors[idx],
      fill: false,
    };
  });
  chart.data.datasets = datasets;
  chart.update();
}
