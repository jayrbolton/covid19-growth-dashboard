/*
 * Quick overview of current metrics for a region.
 */
import { h, Component } from "preact";
import { DashboardEntry, EntryStat } from "../../../types/dashboard";
import { formatNumber } from "../../../utils/formatting";

interface Props {
  entry: DashboardEntry;
}

interface State {}

export class QuickView extends Component<Props, State> {
  render() {
    return (
      <table>
        <tbody>{this.props.entry.stats.map((stat) => renderStat(stat))}</tbody>
      </table>
    );
  }
}

function renderStat(stat: EntryStat) {
  const current = stat.timeSeries[stat.timeSeries.length - 1];
  const href = "#" + stat.id;
  const num = formatNumber({
    num: current,
    roundThousands: true,
    percentage: stat.isPercentage,
  });
  return (
    <tr>
      <td className="pr3 f4">
        <a className="link light-blue dim" href={href}>
          {stat.label}
        </a>
      </td>
      <td className="b f4 white-80">{num}</td>
    </tr>
  );
}
