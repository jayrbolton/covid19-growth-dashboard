/*
 * Time series bar chart for each metric component (child of region-stats)
 */
import { h, Component, Fragment } from "preact";
import { formatNumber } from "../../utils/formatting";
import { VIZ_COLORS } from "../../constants/colors";
import { vals } from "../../utils/obj";

interface Props {
  statIdx: number;
  series: {
    values: Array<number>;
    percentages: Array<number>;
  };
  isPercentage: boolean;
  // How many days ago for the end date
  daysAgo: number;
}

interface State {}

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

  renderBar(val, percentage, isPercentage, idx, len) {
    const border = "2px solid #333";
    const width =
      percentage === null || isNaN(percentage) ? "0%" : percentage + "%";
    const color = vals(VIZ_COLORS)[this.props.statIdx];
    // Text styling
    const isLast = idx === len - 1;
    const fontSize = "1rem";
    const fontWeight = "bold";
    const textColor = "white";
    const margin = "0.1rem 0.35rem 0.2rem 0.35rem";
    // Data
    const date = DATES[DATES.length - len - this.props.daysAgo + idx];
    return (
      <div className="flex justify-between items-center">
        <div style={{ width: "4.7rem" }}>{date}</div>
        <div style={{ flexGrow: "1" }}>
          <div
            title={formatNumber({ num: val })}
            style={{
              width,
              background: color,
              borderTop: border,
              borderBottom: border,
            }}
          >
            <span
              className="dib"
              style={{
                fontSize,
                fontWeight,
                color: textColor,
                textShadow: "black 0px 0px 2px",
                lineHeight: "1rem",
                margin,
              }}
            >
              {formatNumber({ num: val })}
              <span className="white-80">{isPercentage ? "%" : ""}</span>
            </span>
          </div>
        </div>
      </div>
    );
  }

  render() {
    const { values, percentages } = this.props.series;
    return (
      <div className="pa2" style={{ background: "rgb(40, 40, 40)" }}>
        <div
          className="flex flex-column-reverse justify-between f6 pr2"
          style={{ minWidth: "4.7rem" }}
        >
          {values.map((val, idx) =>
            this.renderBar(
              val,
              percentages[idx],
              this.props.isPercentage,
              idx,
              values.length
            )
          )}
        </div>
      </div>
    );
  }
}
