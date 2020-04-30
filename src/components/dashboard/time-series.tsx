// Time series bar chart
import { h, Component, Fragment } from "preact";
import { formatNumber } from "../../utils/formatting";
import * as colors from "../../constants/graph-colors.json";

interface Props {
  statIdx: number;
  series: {
    values: Array<number>;
    percentages: Array<number>;
  };
  isPercentage: boolean;
  // How many days to show
  timeRange: number;
  // How many days ago for the end date
  daysAgo: number;
}

interface State {}

const ROW_HEIGHT = "1rem";
const ROW_HEIGHT_FIRST = "1.25rem";
const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];
// last hundred days in readable date strings
const DATES = Array(100)
  .fill(null)
  .map((_, idx) => {
    const daysAgo = 100 - idx;
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);
    return `${MONTHS[date.getUTCMonth()]} ${date.getUTCDate()}`;
  });

export class TimeSeriesBars extends Component<Props, State> {
  constructor(props) {
    super(props);
    this.state = {};
  }

  barText(val, idx, isPercentage, len) {
    const isLast = idx === len - 1;
    const height = isLast ? ROW_HEIGHT_FIRST : ROW_HEIGHT;
    const fontSize = isLast ? "1rem" : "inherit";
    const fontWeight = isLast ? "bold" : "normal";
    const color = isLast ? "white" : "#d8d8d8";
    const date = DATES[DATES.length - len - this.props.daysAgo + idx];
    return (
      <div
        className="flex justify-between"
        style={{ height, fontSize, fontWeight, color }}
      >
        <div>{date}</div>
        <div>
          {formatNumber(val)}
          <span className="white-80">{isPercentage ? "%" : ""}</span>
        </div>
      </div>
    );
  }

  vertBar(val, percentage, idx, len) {
    const border = "2px solid #333";
    const width =
      percentage === "?" || percentage === null || isNaN(percentage)
        ? "0%"
        : percentage + "%";
    const height = idx === len - 1 ? ROW_HEIGHT_FIRST : ROW_HEIGHT;
    const color = colors[this.props.statIdx];
    return (
      <div
        title={formatNumber(val)}
        style={{
          width,
          background: color,
          height,
          borderTop: border,
          borderBottom: border,
        }}
      ></div>
    );
  }

  render() {
    const { values, percentages } = this.props.series;
    return (
      <div className="pa2" style={{ background: "rgb(40, 40, 40)" }}>
        <div className="flex justify-between">
          <div
            className="flex flex-column-reverse justify-between f6 pr2"
            style={{ width: "60%" }}
          >
            {values.map((val, idx) =>
              this.barText(val, idx, this.props.isPercentage, values.length)
            )}
          </div>
          <div
            className="flex flex-column-reverse justify-between"
            style={{ width: "40%" }}
          >
            {values.map((val, idx) =>
              this.vertBar(val, percentages[idx], idx, values.length)
            )}
          </div>
        </div>
      </div>
    );
  }
}

function percent(val, max) {
  return Math.round(((val * 100) / max) * 10) / 10;
}
