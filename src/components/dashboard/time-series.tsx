// Time series bar chart
import {h, Component, Fragment} from 'preact';
import {formatNumber} from '../../utils/formatting';
import {TimeSeriesData} from '../../types/dashboard';

interface Props {
    data: TimeSeriesData;
}

interface State {
}

const ROW_HEIGHT = '1rem';
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export class TimeSeriesBars extends Component<Props, State> {

    constructor(props) {
        super(props);
        this.state = {}
    }

    barText(perc, idx, val, date) {
        return (
            <div className='flex justify-between' style={{height: ROW_HEIGHT}}>
                <div>{date}</div>
                <div>{formatNumber(val)}</div>
            </div>
        );
    }

    vertBar(perc, idx, val, color, len) {
        const border = '2px solid #333';
        const width = perc === '?' ? '0%' : perc + '%';
        return (
            <div
                title={formatNumber(val)}
                style={{width, background: color, height: ROW_HEIGHT, borderTop: border, borderBottom: border}}>
            </div>
        );
    }

    render() {
        const {color, values} = this.props.data
        const vals = values.slice(-14);
        const nonulls = vals.filter(n => n !== null);
        let max = 0;
        if (nonulls.length) {
            max = vals.reduce((max, n) => n > max ? n : max, 0);
        }
        const percentages = vals.map(v => v === null ? '?' : percent(v, max));
        const dates = vals.map((_, idx) => {
            const daysAgo = vals.length - idx;
            const date = new Date();
            date.setDate(date.getDate() - daysAgo);
            return `${MONTHS[date.getUTCMonth()]} ${date.getUTCDate()}`;
        });
        return (
            <div className='pa2' style={{background: 'rgb(40, 40, 40)'}}>
                <div className='bb b--white-20 pb1 mb1 f6'>
                    <div className='flex justify-between pr2 b white-80' style={{width: '55%'}}>
                        <div>Date</div>
                        <div>Amount</div>
                    </div>
                </div>
                <div className='flex justify-between'>
                    <div className='flex flex-column-reverse justify-between f6 pr2' style={{width: '55%'}}>
                        {percentages.map((perc, idx) => this.barText(perc, idx, vals[idx], dates[idx]))}
                    </div>
                    <div className='flex flex-column-reverse justify-between' style={{width: '45%'}}>
                        {percentages.map((perc, idx) => this.vertBar(perc, idx, vals[idx], color, vals.length))}
                    </div>
                </div>
            </div>
        );
    }
}

function percent(val, max) {
    return Math.round(val * 100 / max * 10) / 10;
}
