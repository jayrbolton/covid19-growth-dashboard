import { h, Component } from "preact";
// Components
import { RegionStats } from "./region-stats";
import { MetricsSelector } from "./metrics-selector";
import { MetricsComparison } from "./metrics-comparison";
import { Filters } from "./filters";
import { Sorts } from "./sorts";
import { Button } from "../generic/button";
import { ShowIf } from "../generic/show-if";
// Utils
import { filterLocation } from "../../utils/filter-data";
import { sortByStat } from "../../utils/sort-data";
import { pluralize } from "../../utils/formatting";
import { setTimeSeriesWindow } from "../../utils/transform-data";
// Types
import { DashboardData } from "../../types/dashboard";
// Constants
import { UI_SETTINGS } from "../../constants/ui-settings";

interface Props {
  fetchSourceData: () => Promise<DashboardData>;
}

interface State {
  data?: DashboardData;
  loading: boolean;
  displayedStats: Map<number, boolean>;
  // Stats selected for graphing and comparing
  showingGraph: boolean;
  selectedCount: number;
  // Number of results that match the search query
  resultsCount: number;
  // Pagination count
  displayCount: number;
  // What time range did we last sort on?
  sortedDaysAgo: number;
}

// How the source data gets transformed by user filtering:
// (all updates are in-place mutations on the source data)
// When users select a new sort value
//   - re-sort the source data
// When users filter by location
//   - update the `hidden` flag for all source data entries in-place
// When users change the time range (ie. 'days ago')
//   - update the time series for each entry
//   - re-sort the data

export class Dashboard extends Component<Props, State> {
  sortingByGrowth: boolean = false;
  sortingStatIdx: number = 0;
  timeRangeTimeout: null | number = null;
  // Boolean to track if the user just clicked a stat for highlighting purposes
  justSelectedStat = false;

  constructor(props: Props) {
    super(props);
    // Show a different number of stats/metrics depending on their window width
    const width = window.outerWidth;
    let displayedStats;
    if (width >= 1023) {
      displayedStats = new Map([
        [0, true],
        [1, true],
        [2, true],
        [3, true],
      ]);
    } else if (width >= 769) {
      displayedStats = new Map([
        [0, true],
        [1, true],
        [2, true],
      ]);
    } else {
      displayedStats = new Map([
        [0, true],
        [1, true],
      ]);
    }
    this.state = {
      loading: true,
      displayedStats,
      showingGraph: false,
      selectedCount: 0,
      resultsCount: 0,
      displayCount: UI_SETTINGS.pageLen,
      sortedDaysAgo: 0,
    };
  }

  componentDidMount() {
    this.props.fetchSourceData().then((data) => {
      this.setState({
        data,
        loading: false,
        resultsCount: data.entries.length,
      });
    });
  }

  handleFilterLocation(inp: string) {
    const resultsCount = filterLocation(this.state.data.entries, inp);
    this.setState({ resultsCount });
  }

  // statIdx is the index of the region's stat/metric to sort on (eg. 0 -> Confirmed cases)
  // byGrowth is a flag of whether to sort by total count or by average daily percent growth
  handleSort(statIdx: number | null, byGrowth: boolean | null) {
    if (statIdx !== null) {
      this.sortingByGrowth = byGrowth;
    }
    if (byGrowth !== null) {
      this.sortingStatIdx = statIdx;
    }
    sortByStat(
      this.state.data.entries,
      this.sortingStatIdx,
      this.sortingByGrowth
    );
    this.setState({ sortedDaysAgo: this.state.data.timeSeriesOffset });
  }

  // Show more regions for pagination
  handleShowMore() {
    let displayCount = this.state.displayCount;
    displayCount += UI_SETTINGS.pageLen;
    if (displayCount > this.state.resultsCount) {
      displayCount = this.state.resultsCount;
    }
    this.setState({ displayCount });
  }

  // Change which stats/metrics are displayed for each region
  // A map of the metric/stat index to a boolean of whether it is shown
  handleChangeStatsDisplayed(displayedStats: Map<number, boolean>) {
    this.setState({ displayedStats });
  }

  // Change which stats to graph & compare
  handleSelectStat(entry, statIdx) {
    let count = this.state.selectedCount;
    if (entry.stats[statIdx].isComparing) {
      count -= 1;
    } else {
      count += 1;
      this.justSelectedStat = true;
    }
    entry.stats[statIdx].isComparing = !entry.stats[statIdx].isComparing;
    this.setState({ selectedCount: count });
  }

  handleClearSelectedStats() {
    // Mutate the source data and update all stats to have isComparing=false
    this.state.data.entries.forEach((entry) => {
      entry.stats.forEach((stat) => {
        stat.isComparing = false;
      });
    });
    this.setState({ selectedCount: 0 });
  }

  handleShowGraph() {
    this.setState({ showingGraph: true });
  }

  handleHideGraph() {
    this.setState({ showingGraph: false });
  }

  // Change the time period for all metrics
  handleInputTimeRange(daysAgo: number) {
    daysAgo = Number(daysAgo);
    if (this.timeRangeTimeout) {
      clearTimeout(this.timeRangeTimeout);
    }
    const update = () => {
      this.state.data.timeSeriesOffset = daysAgo;
      setTimeSeriesWindow(this.state.data.entries, daysAgo);
      this.setState({});
    };
    this.timeRangeTimeout = setTimeout(update, 25);
  }

  render() {
    if (this.state.loading || !this.state.data) {
      return <p className="white sans-serif ph3 pv4">Loading data...</p>;
    }
    const selectedCount = this.state.selectedCount;
    let selectedText = "Select some metrics to graph and compare";
    if (selectedCount > 0) {
      selectedText = `You've selected ${selectedCount} ${pluralize(
        "metric",
        selectedCount
      )}:`;
    }
    return (
      <div className="flex mt4 bt b--white-20">
        <div className="ph3 z-1 sidebar bg-near-black">
          <div>
            <Filters
              onFilterLocation={(inp) => this.handleFilterLocation(inp)}
            />
            <MetricsSelector
              onSelect={(selected) => this.handleChangeStatsDisplayed(selected)}
              entryLabels={this.state.data.entryLabels}
              defaultDisplayedStats={this.state.displayedStats}
            />
            <Sorts
              onSort={(idx, prop) => this.handleSort(idx, prop)}
              displayedStats={this.state.displayedStats}
              entryLabels={this.state.data.entryLabels}
            />
            {renderGraphButton(this, selectedCount, () =>
              this.handleClearSelectedStats()
            )}
            {renderTimeRangeSlider(this)}
          </div>
        </div>
        <div class="w-100 bl b--white-40">
          {this.props.children}
          <RegionStats
            displayCount={this.state.displayCount}
            data={this.state.data}
            onSelectStat={(entry, statIdx) =>
              this.handleSelectStat(entry, statIdx)
            }
            displayedStats={this.state.displayedStats}
          />
          {renderShowMoreButton(this)}
        </div>
        <MetricsComparison
          hidden={!this.state.showingGraph}
          data={this.state.data}
          onClose={() => this.handleHideGraph()}
        />
      </div>
    );
  }
}

function renderShowMoreButton(dashboard) {
  const diff = dashboard.state.resultsCount - dashboard.state.displayCount;
  if (diff <= 0) {
    return "";
  }
  return (
    <p className="ph2 ph2-m ph4-ns pb4">
      <a
        onClick={() => dashboard.handleShowMore()}
        className="pointer link b light-blue dim"
      >
        Show more ({diff} remaining)
      </a>
    </p>
  );
}

function renderGraphButton(dashboard, selectedCount, onClear) {
  const justSelected = dashboard.justSelectedStat;
  if (justSelected) {
    dashboard.justSelectedStat = false;
  }
  // Anchor to clear all current selections
  function renderClearSelection() {
    return (
      <a onClick={onClear} class="light-blue pointer">
        Clear selections
      </a>
    );
  }
  return (
    <div class="mt3 pt3 bt b--white-20">
      <div class="flex justify-between items-center">
        <span>{selectedCount} metrics selected:</span>
        {Button({
          text: "Graph & compare", // `Graph ${selectedCount} selected`,
          background: UI_SETTINGS.graphButtonBg,
          className: justSelected ? "yellow-fade" : "",
          disabled: selectedCount === 0,
          onClick: () => dashboard.handleShowGraph(),
        })}
      </div>
      <div class="right">{selectedCount > 0 ? renderClearSelection() : ""}</div>
    </div>
  );
}

function renderTimeRangeSlider(dashboard) {
  const daysAgo = dashboard.state.data.timeSeriesOffset;
  return (
    <div className="mt3 pt3 bt b--white-20">
      <div className="flex justify-between">
        <span>
          Going back in time {daysAgo} {pluralize("day", daysAgo)}
        </span>
        <ShowIf bool={dashboard.state.sortedDaysAgo !== daysAgo}>
          <a
            className="dib light-blue pointer"
            onClick={() => dashboard.handleSort(null, null)}
          >
            Re-sort
          </a>
        </ShowIf>
      </div>
      <input
        className="db w-100"
        style={{ direction: "rtl" }}
        type="range"
        min={0}
        max={UI_SETTINGS.timeTravelMaxRange}
        step={1}
        onInput={(ev) => dashboard.handleInputTimeRange(ev.currentTarget.value)}
        value={daysAgo}
      />
    </div>
  );
}
