/*
 * Details about a single time-series metric/stat for a region.
 */
import { h, Component } from "preact";
import { EntryStat } from "../../../types/dashboard";
import { TimeSeriesBars } from "../time-series";
import { formatNumber } from "../../../utils/formatting";
import { UI_SETTINGS } from "../../../constants/ui-settings";

interface Props {
  stat: EntryStat;
  statIdx: number;
}

interface State {}

const BAR_LEN = 50;

export class RegionStat extends Component<Props, State> {
  render() {
    const { label, id, isPercentage } = this.props.stat;
    const series = this.props.stat.longWindow;
    return (
      <div style={{ maxWidth: "54rem" }}>
        <div className="flex justify-between items-center">
          <h3 className="f3" id={id}>
            {label}
          </h3>
          <a href="#" className="link light-blue dim">
            Back to top
          </a>
        </div>
        <div
          className="flex justify-between"
          style={{ alignContent: "stretch" }}
        >
          <div className="mw6" style={{ minWidth: "32rem" }}>
            <TimeSeriesBars
              series={series}
              statIdx={this.props.statIdx}
              isPercentage={isPercentage}
              daysAgo={0}
            />
          </div>
          <div style={{ flexGrow: 1 }}>
            {renderGrowthStats(this.props.stat)}
          </div>
        </div>
      </div>
    );
  }
}

function renderGrowthStats(stat: EntryStat) {
  return (
    <div className="ph3">
      <h3 className="b f4 mt0 mb2">Average daily percent growth</h3>
      {UI_SETTINGS.detailsAverages.map((days, idx) => {
        return renderGrowthStat(
          days + " days",
          stat.longWindow.percentGrowths[idx],
          true
        );
      })}
      <h3 className="b f4 pr4 pt2 mv2 bt b--white-20">Average daily change</h3>
      {UI_SETTINGS.detailsAverages.map((days, idx) => {
        return renderGrowthStat(days + " days", stat.longWindow.change[idx]);
      })}
    </div>
  );
}

function renderGrowthStat(label, amount, isPercentage = false) {
  const num = formatNumber({
    num: amount,
    roundThousands: true,
    percentage: isPercentage,
    showSign: true,
  });
  return (
    <div className="flex items-center f4">
      <div className="w4 white-80">{label}</div>
      <div className="b">{num}</div>
    </div>
  );
}
