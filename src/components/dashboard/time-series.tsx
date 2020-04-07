// Time series bar chart
import {h, Component, Fragment} from 'preact';
import {formatNumber} from '../../utils/formatting';
import {TimeSeriesData} from '../../types/dashboard';

interface Props {
    data: TimeSeriesData;
    isPercentage: boolean;
}

interface State {
}

const ROW_HEIGHT = '1rem';
const ROW_HEIGHT_FIRST = '1.25rem';
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export class TimeSeriesBars extends Component<Props, State> {

    constructor(props) {
        super(props);
        this.state = {}
    }

    barText(perc, idx, val, date, isPercentage, len) {
        const isLast = idx === (len - 1);
        const height = isLast ? ROW_HEIGHT_FIRST : ROW_HEIGHT;
        const fontSize = isLast ? '1rem': 'inherit';
        const fontWeight = isLast ? 'bold': 'normal';
        const color = isLast ? 'white': '#d8d8d8';
        return (
            <div className='flex justify-between' style={{height, fontSize, fontWeight, color}}>
                <div>{date}</div>
                <div>
                    {formatNumber(val)}
                    <span className='white-80'>{isPercentage ? '%' : ''}</span>
                </div>
            </div>
        );
    }

    vertBar(perc, idx, val, color, len) {
        const border = '2px solid #333';
        const width = perc === '?'  || perc === null || isNaN(perc)? '0%' : perc + '%';
        const height = idx === (len - 1) ? ROW_HEIGHT_FIRST : ROW_HEIGHT;
        return (
            <div
                title={formatNumber(val)}
                style={{width, background: color, height, borderTop: border, borderBottom: border}}>
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
                <div className='flex justify-between'>
                    <div className='flex flex-column-reverse justify-between f6 pr2' style={{width: '60%'}}>
                        {percentages.map((perc, idx) => this.barText(perc, idx, vals[idx], dates[idx], this.props.isPercentage, vals.length))}
                    </div>
                    <div className='flex flex-column-reverse justify-between' style={{width: '40%'}}>
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
