// Time series bar chart
import {h, Component, Fragment} from 'preact';
import {formatUTCDate, formatNumber} from '../../utils/formatting';
import {TimeSeriesData} from '../../types/dashboard';

interface Props {
    data: TimeSeriesData;
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
        this.state = {}
    }

    vertBar(perc, idx, val, color, len) {
        const width = 100 / len;
        return (
            <div
                title={formatNumber(val)}
                style={{height: perc + '%', background: color, width: width + '%', border: '1px solid #333'}}>
            </div>
        );
    }

    render() {
        const {color, values} = this.props.data
        const days = values.length;
        const max = values.reduce((max, n) => n > max ? n : max, 0);
        const percentages = values.map(v => percent(v, max));
        return (
            <Fragment>
                <div className='flex justify-between items-end w-100 bg-dark-gray' style={{height: '80px'}}>
                    {percentages.map((perc, idx) => this.vertBar(perc, idx, values[idx], color, values.length))}
                </div>
            </Fragment>
        );
    }
}

function percent(val, max) {
    return Math.round(val * 100 / max * 10) / 10;
}
