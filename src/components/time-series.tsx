// Time series bar chart
import './styles/chartist-overrides';
import {h, Component, Fragment} from 'preact';
import {formatUTCDate, formatNumber} from '../utils/formatting';

interface Props {
    dates: Array<Array<number>>;
    totals: {
        confirmed: Array<number>,
        recovered: Array<number>,
        deaths: Array<number>
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

    vertBar(perc, idx, recoveredPerc, deathsPerc) {
        const recovered = recoveredPerc[idx];
        const deaths = deathsPerc[idx];
        return (
            <div class='flex flex-column h-100 justify-end' style={{width: '1.5%', margin: '0px 0.25%'}}>
                <div className='bg-gray' style={{height: deaths + '%'}}></div>
                <div className='bg-green' style={{height: recovered + '%'}}></div>
                <div className='bg-orange' style={{height: perc + '%'}}></div>
            </div>
        );
    }

    render() {
        const {confirmed, recovered, deaths} = this.props.totals;
        const totals = confirmed.map((n, idx) => n + recovered[idx] + deaths[idx]);
        const max = totals.reduce((max, n) => max > n ? max : n, 0);
        const confirmedPerc = confirmed.slice(-50).map(n => Math.round(n * 100 / max));
        const recoveredPerc = recovered.slice(-50).map(n => Math.round(n * 100 / max));
        const deathsPerc = deaths.slice(-50).map(n => Math.round(n * 100 / max));
        const dates = this.props.dates.slice(-50);
        const startDate = formatUTCDate(dates[0]);
        const endDate = formatUTCDate(dates[dates.length - 1]);
        return (
            <div className='w-100'>
                <div className='white-80 mb1'>
                    <div className='pr4 f6'>Y-axis: cases (<span className='orange b'>confirmed</span>, <span className='green b'>recovered</span>, and <span className='gray b'>deaths</span> from 0 to {formatNumber(max)})</div>
                </div>

                <div className='flex w-100 items-end bg-dark-gray' style={{height: '100px'}}>
                    {confirmedPerc.map((perc, idx) => this.vertBar(perc, idx, recoveredPerc, deathsPerc))}
                </div>

                <div className='white-80 mt1'>
                    <div className='f6'>X-axis: days (from {startDate} to {endDate})</div>
                </div>
            </div>
        );
    }
}
