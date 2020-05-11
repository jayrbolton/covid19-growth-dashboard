/*
 * Listing of rows for each region which metrics/stats underneath each.
 * This renders the rows and pagination without filter controls.
 */
import { h, Component, Fragment } from "preact";
import { formatNumber } from "../../utils/formatting";
import { TimeSeriesBars } from "./time-series";
import { DashboardData, DashboardEntry } from "../../types/dashboard";
import { queryToObj, updateURLQuery } from "../../utils/url";
import "./style.css";

// Number of days of stats to show
const TIME_RANGE = 14;

interface Props {
  data: DashboardData;
  displayCount: number;
  // Map of stat indexes of which ones to show for each region
  displayedStats: Map<number, boolean>;
  onSelectStat: (entry: DashboardEntry, statIdx: number) => void;
}

interface State {}

export class RegionStats extends Component<Props, State> {
  constructor(props) {
    super(props);
    this.state = {};
  }

  handleClickStat(entry, statIdx) {
    this.props.onSelectStat(entry, statIdx);
  }

  handleClickRegion(region) {
    const query = updateURLQuery({ r: region.id });
    window._history.push({ search: query });
    window.scrollTo(0, 0);
  }

  render() {
    const entries = this.props.data.entries;
    // Let's get imperative. I want this to be really performant.
    let count = 0;
    let idx = 0;
    const rows = [];
    while (idx < entries.length && count < this.props.displayCount) {
      const entry = entries[idx];
      idx += 1;
      if (entry.hidden) {
        continue;
      }
      rows.push(renderEntry(this, entry));
      count += 1;
    }
    entries.forEach((entry) => {
      if (entry.hidden) {
        return;
      }
      count += 1;
    });
    if (!rows.length) {
      return <p className="pa4">No results.</p>;
    }
    return <Fragment>{rows}</Fragment>;
  }
}

// Render a row for an entire region, with many stats/metrics underneath
function renderEntry(regionStats, entry) {
  let showStats = regionStats.props.displayedStats;
  const stats = [];
  showStats.forEach((show, idx) => {
    if (!show) {
      return;
    }
    stats.push(renderStat(regionStats, entry.stats[idx], entry, idx));
  });
  return (
    <div
      key={entry.location}
      className="ph3 pv2 pb1 region-stats-row bb b--white-20 bg-near-black"
    >
      <h2 className="f4 b ma0 mv2">
        <a onClick={() => regionStats.handleClickRegion(entry)} className="light-blue pointer dim">{entry.location}</a>
      </h2>
      <div
        className="w-100"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, 16rem)",
          gridColumnGap: "0.65rem",
        }}
      >
        {stats}
      </div>
    </div>
  );
}

// Render the box for a single metric/stat for a region, such as total confirmed cases
function renderStat(regionStats, stat, entry, idx) {
  if (stat === null || stat === undefined) {
    return "";
  }
  const daysAgo = regionStats.props.data.timeSeriesOffset;
  const start = -daysAgo - TIME_RANGE;
  let end = -daysAgo;
  if (daysAgo === 0) {
    end = stat.timeSeries.length;
  }
  const vals = stat.timeSeries.slice(start, end);
  const selectedId = entry.location + ":" + idx;
  const isSelected = stat.isComparing;
  return (
    <div
      key={stat.label}
      data-selected={isSelected}
      onClick={() => regionStats.handleClickStat(entry, idx)}
      className="mb3 ba b--white-20 relative pointer region-stats-row-stat"
    >
      <div className="pa2 nowrap overflow-hidden">
        <div className="b">{stat.label}</div>
      </div>
      <TimeSeriesBars
        daysAgo={daysAgo}
        statIdx={idx}
        series={stat.timeSeriesWindow}
        isPercentage={stat.isPercentage}
      />
      <div
        className="pa2 flex justify-between items-center bt b--white-20"
        style={{ background: "rgb(40, 40, 40)" }}
      >
        <div className="dib white-80 f6">Average daily growth:</div>
        <div>
          <div className="dib b white-90 relative">
            {stat.timeSeriesWindow.percentGrowth > 0 ? "+" : ""}
            {formatNumber(stat.timeSeriesWindow.percentGrowth)}%
          </div>
        </div>
      </div>
    </div>
  );
}
