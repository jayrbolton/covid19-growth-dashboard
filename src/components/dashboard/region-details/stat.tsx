/*
 * Details about a single time-series metric/stat for a region.
 */
import { h, Component } from "preact";
import { EntryStat } from "../../../types/dashboard";
import { TimeSeriesBars } from "../time-series";
import { formatNumber } from "../../../utils/formatting";

interface Props {
  stat: EntryStat;
  statIdx: number;
}

interface State {}

const BAR_LEN = 50;

export class RegionStat extends Component<Props, State> {

  render() {
    const {label, id, isPercentage} = this.props.stat;
    const series = this.props.stat.longWindow;
    return (
      <div className='mw8'>
        <div className='flex justify-between items-center'>
          <h3 className='f3' id={id}>{label}</h3>
          <a href='#' className='link light-blue dim'>Back to top</a>
        </div>
        <div className='flex justify-between' style={{alignContent: 'stretch'}}>
          <div className='mw6' style={{minWidth: '32rem'}}>
            <TimeSeriesBars series={series} statIdx={this.props.statIdx} isPercentage={isPercentage} daysAgo={0} />
          </div>
          <div style={{flexGrow: 1}}>
            {renderGrowthStats(this.props.stat)}
          </div>
        </div>
      </div>
    );
  }
}

function renderGrowthStats(stat: EntryStat) {
  return (
    <table className='ph3'>
      <tbody>
      <tr>
        <td className='b f4 tr pr4'>Average daily percent growth</td>
        <td>&nbsp;</td>
      </tr>
      {renderGrowthStat('50 days', stat.longWindow.percentGrowth, true)}
      {renderGrowthStat('21 days', stat.longWindow.percentGrowth, true)}
      {renderGrowthStat('7 days', stat.longWindow.percentGrowth, true)}
      {renderGrowthStat('3 days', stat.longWindow.percentGrowth, true)}
      <tr>
        <td className='b f4 pr4 pt2 mt2 bt b--white-20'>Average daily change</td>
        <td>&nbsp;</td>
      </tr>
      {renderGrowthStat('50 days', stat.longWindow.percentGrowth, true)}
      {renderGrowthStat('21 days', stat.longWindow.percentGrowth, true)}
      {renderGrowthStat('7 days', stat.longWindow.percentGrowth, true)}
      {renderGrowthStat('3 days', stat.longWindow.percentGrowth, true)}
      </tbody>
    </table>
  );
}

function renderGrowthStat(label, amount, isPercentage) {
  return (
    <tr class='mb3'>
      <td className='f4 pr4 white-80 tr'>{label}</td>
      <td className='f4 b'>{formatNumber(amount, true, isPercentage)}</td>
    </tr>
  );
}
