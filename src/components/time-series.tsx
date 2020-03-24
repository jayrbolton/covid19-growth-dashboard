// Time series bar chart
import './styles/chartist-overrides';
import {h, Component, Fragment} from 'preact';
import {formatUTCDate, formatNumber} from '../utils/formatting';

interface Props {
    dates: Array<Array<number>>;
    cases: {
        confirmed: Array<number>,
        deaths: Array<number>,
    },
    maxes: {
        confirmed: number,
        deaths: number
    }
}

interface State {
}

// Purposes of these sections:
// - show current state
//   - show total cases, deaths
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

    vertBar(confirmed, idx, max) {
        const perc = Math.round(confirmed * 100 / max);
        return (
            <div class='flex flex-column h-100 justify-end' style={{width: '1.5%', margin: '0px 0.25%'}}>
                <div title={'Confirmed: ' + perc + '%'} className='bg-blue' style={{height: perc + '%'}}></div>
            </div>
        );
    }

    render() {
        const {confirmed, deaths} = this.props.cases;
        const max = this.props.maxes.confirmed;
        const dates = this.props.dates.slice(-50);
        const startDate = formatUTCDate(dates[0]);
        const endDate = formatUTCDate(dates[dates.length - 1]);
        return (
            <div className='w-100'>
                <div className='white-80 mb1'>
                    <div className='pr4 f6'>Y-axis: <span className='b blue'>confirmed</span> cases up to <span className='b'>{formatNumber(max)</span> total)</div>
                </div>

                <div className='flex w-100 items-end bg-dark-gray' style={{height: '100px'}}>
                    {confirmed.map((n, idx) => this.vertBar(n, idx, max))}
                </div>

                <div className='white-80 mt1'>
                    <div className='f6'>X-axis: days (from {startDate} to {endDate})</div>
                </div>
            </div>
        );
    }
}
