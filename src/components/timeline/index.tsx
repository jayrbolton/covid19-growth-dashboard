import { h, Component } from "preact";
import { graphAxisTicks } from "../../utils/math";
import { fetchData } from "../../utils/jhu/fetch-data";
import { transformDataTimeline } from "../../utils/jhu/transform-data-timeline";
import { sortByDaysAgo } from "../../utils/sort-data";
import { TimelineData, TimelineRegion } from "../../types/timeline-data";
import { Inputs } from "./inputs";
import { formatNumber } from "../../utils/formatting";
import { JHU_SOURCE } from "../../constants/data-sources";
import { constants } from "./constants";

interface Props {}
interface State {
  daysAgo: number;
  data?: TimelineData;
  loading: boolean;
  sortProp: string;
}

export class Timeline extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    const date = new Date();
    this.state = {
      daysAgo: 0,
      loading: true,
      sortProp: "confirmed",
    };
  }

  componentDidMount() {
    fetchData()
      .then(transformDataTimeline)
      .then((data) => {
        this.setState({
          loading: false,
          data,
        });
      });
  }

  handleInputTime(daysAgo: number) {
    sortByDaysAgo(this.state.data, daysAgo, this.state.sortProp);
    this.setState({ daysAgo });
  }

  handleChangeSort(sortProp: string) {
    sortByDaysAgo(this.state.data, this.state.daysAgo, sortProp);
    this.setState({ sortProp });
  }

  render() {
    if (this.state.loading || !this.state.data) {
      return <p className="ph4 mt4">Loading data...</p>;
    }
    const dataRows = this.state.data.regions.map((region, idx) => {
      return renderDataRow(region, idx, this.state.daysAgo);
    });
    const rowHeight =
      this.state.data.regions.length * constants.rowHeight + "rem";
    return (
      <div>
        <div className="ph3 pt3 bb b--white-20 pb3">
          <h1 className="light-gray f4 f2-m f2-ns">
            COVID-19 Animated Timeline by Country
          </h1>
          <p>
            Data is updated daily from the{" "}
            <a href={JHU_SOURCE.homeUrl} target="_blank" className="light-blue">
              Johns Hopkins University CSSE COVID-19 Data Repository
            </a>
            .
          </p>
        </div>
        <div className="bg-near-black pt4">
          <div
            className="flex justify-between mb3"
            style={{ width: constants.barWidth + "%" }}
          >
            <Inputs
              onInputDaysAgo={this.handleInputTime.bind(this)}
              onChangeSort={this.handleChangeSort.bind(this)}
            />
            {renderLegend()}
          </div>
          {renderXScale(this)}
          <div style={{ height: rowHeight, position: "relative" }}>
            {dataRows}
          </div>
        </div>
      </div>
    );
  }
}

function renderXScale(timeline: Timeline) {
  const max = timeline.state.data.maxConfirmed;
  const ticks = graphAxisTicks(max);
  const tickElems = ticks.map(([tick, perc], idx) => {
    return (
      <div
        className="bl b--white-40 absolute"
        style={{
          left: perc + "%",
          bottom: "0px",
          height: "1rem",
          width: "1px",
        }}
      ></div>
    );
  });
  const textElems = ticks.map(([tick, perc], idx) => {
    return (
      <div
        className="absolute white-80 f6"
        style={{ left: perc + "%", top: "0px" }}
      >
        {formatNumber({ num: tick })}
      </div>
    );
  });
  return (
    <div className="flex" style={{ width: constants.barWidth + "%" }}>
      <div style={{ width: constants.leftSpace + "rem" }}>
        <div className="tr f6 pr2 white-80">Total cases:</div>
      </div>
      <div
        className="bb b--white-40 mb2"
        style={{ flexGrow: 1, position: "relative", height: "2.25rem" }}
      >
        {textElems}
        {tickElems}
      </div>
    </div>
  );
}

// Each row representing each country in the timeline
function renderDataRow(region: TimelineRegion, idx: number, daysAgo: number) {
  const barHeight = "1.25rem";
  const top = region.order * constants.rowHeight + "rem";
  const percs = region.percentages;
  const totalWidth = idxDaysAgo(percs.confirmedGlobal, daysAgo);
  const activeWidth = idxDaysAgo(percs.active, daysAgo);
  const recoveredWidth = idxDaysAgo(percs.recovered, daysAgo);
  const { confirmed, active, recovered } = region.totals;
  const currentConfirmed = idxDaysAgo(confirmed, daysAgo);
  const currentActive = idxDaysAgo(active, daysAgo);
  const currentRecovered = idxDaysAgo(recovered, daysAgo);
  return (
    <div
      className="flex mb2 items-center"
      key={region.id}
      style={{
        position: "absolute",
        top,
        width: constants.barWidth + "%",
        transition: "top 0.75s",
      }}
    >
      <div
        className="tr pr2 truncate f4"
        style={{ width: constants.leftSpace + "rem" }}
      >
        {region.name}
      </div>
      <div style={{ flexGrow: 1, position: "relative" }}>
        <div
          className="flex hello"
          style={{
            width: totalWidth + "%",
            transition: "width 0.25s",
            overflow: "visible",
          }}
        >
          <div
            title={`${formatNumber({ num: currentActive })} active cases`}
            className="f6 b w-50"
            style={{
              height: barHeight,
              background: constants.activeColor,
              width: activeWidth + "%",
            }}
          ></div>
          <div
            title={`${formatNumber({ num: currentRecovered })} recovered`}
            className="f6 b w-50"
            style={{
              height: barHeight,
              background: constants.recoveredColor,
              width: recoveredWidth + "%",
            }}
          ></div>
        </div>
        <div
          className="dib ml1 absolute"
          style={{ left: totalWidth + "%", top: 0, transition: "left 0.25s" }}
        >
          {formatNumber({ num: currentConfirmed || 0 })}
        </div>
      </div>
    </div>
  );
}

// Render the bar graph color legend
function renderLegend() {
  return (
    <div>
      <div className="b" style={{ color: constants.activeColor }}>
        {renderSquare(constants.activeColor)}
        Active cases
      </div>
      <div className="b" style={{ color: constants.recoveredColor }}>
        {renderSquare(constants.recoveredColor)}
        Recovered
      </div>
    </div>
  );
}

// Render a small colored square (for bar color legend)
function renderSquare(background: string) {
  return (
    <span
      className="dib mr1"
      style={{ width: "10px", height: "10px", background }}
    ></span>
  );
}

// Access an index in a time series with a daysAgo offset, where the current day is the last elem
function idxDaysAgo(arr: Array<any>, daysAgo: number) {
  return arr[arr.length - (daysAgo + 1)] || 0;
}
