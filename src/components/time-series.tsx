// Time series bar chart
import './styles/chartist-overrides';
import {h, Component, Fragment} from 'preact';
import {formatUTCDate, formatNumber} from '../utils/formatting';

interface Props {
    dates: Array<Array<number>>;
    totals: {
        confirmed: Array<number>,
        recovered: Array<number>,
        deaths: Array<number>,
        active: Array<number>
    },
    maxes: {
        confirmed: number,
        recovered: number,
        deaths: number
    }
}

interface State {
}

// Purposes of these sections:
// - show current state
//   - show total cases, deaths, recovered
//   - compare the above values (bars)
// - show growth rate
//    - average new cases all time
//    - average new cases this week
//    - horizontal bar chart over time of total cases


export class TimeSeriesBars extends Component<Props, State> {

    constructor(props) {
        super(props);
        this.state = {
        }
    }

    vertBar(confirmed, idx, recoveredPercentages, deathsPercentages) {
        const recovered = recoveredPercentages[idx];
        const deaths = deathsPercentages[idx];
        return (
            <div class='flex flex-column h-100 justify-end' style={{width: '1.5%', margin: '0px 0.25%'}}>
                <div title={deaths + '%'} className='bg-gray' style={{height: deaths + '%'}}></div>
                <div title={recovered + '%'} className='bg-dark-blue' style={{height: recovered + '%'}}></div>
                <div title={confirmed + '%'} className='bg-orange' style={{height: confirmed + '%'}}></div>
            </div>
        );
    }

    render() {
        const {active, confirmed, recovered, deaths} = this.props.totals;
        const totals = confirmed.map((n, idx) => n + recovered[idx] + deaths[idx]);
        const max = this.props.maxes.confirmed;
        const activePerc = active.slice(-50).map(n => Math.round(n * 100 / max));
        const confirmedPerc = confirmed.slice(-50).map(n => Math.round(n * 100 / max));
        const recoveredPerc = recovered.slice(-50).map(n => Math.round(n * 100 / max));
        const deathsPerc = deaths.slice(-50).map(n => Math.round(n * 100 / max));
        const dates = this.props.dates.slice(-50);
        const startDate = formatUTCDate(dates[0]);
        const endDate = formatUTCDate(dates[dates.length - 1]);
        return (
            <div className='w-100'>
                <div className='white-80 mb1'>
                    <div className='pr4 f6'>Y-axis: cases (<span className='orange b'>active</span>, <span className='dark-blue b'>recovered</span>, and <span className='gray b'>deaths</span> from 0 to {formatNumber(max)})</div>
                </div>

                <div className='flex w-100 items-end bg-dark-gray' style={{height: '100px'}}>
                    {activePerc.map((perc, idx) => this.vertBar(perc, idx, recoveredPerc, deathsPerc))}
                </div>

                <div className='white-80 mt1'>
                    <div className='f6'>X-axis: days (from {startDate} to {endDate})</div>
                </div>
            </div>
        );
    }
}
