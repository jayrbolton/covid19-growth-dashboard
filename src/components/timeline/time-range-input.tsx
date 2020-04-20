import {h, Component, Fragment} from 'preact';
import {constants} from './constants';

interface Props {
    onInputDaysAgo: (number) => void;
};
interface State {
    dateStr: string;
    daysAgo: number;
};

export class TimeRangeInput extends Component<Props, State> {

    // Input debounce timeout
    timeout: number | null = null;

    constructor(props: Props) {
        super(props);
        this.state = Object.assign(getDates(0), {
            loading: true,
        });
    }

    handleInputTime(ev) {
        const val = ev.currentTarget.value;
        const daysAgo = constants.range - val;
        this.setState(getDates(daysAgo));
        const callback = () => {
            this.props.onInputDaysAgo(daysAgo);
        }
        if (this.timeout) {
          clearTimeout(this.timeout);
          this.timeout = null;
        }
        this.timeout = window.setTimeout(callback, 10);
    }

    render() {
        return (
            <div className='mb3 b' style={{width: constants.barWidth + 'rem', marginLeft: constants.leftSpace + 'rem'}}>
                <label className='db mb2'>Date: {this.state.dateStr}</label>
                <input
                    className='db w-100'
                    type='range'
                    min='0'
                    max={constants.range}
                    onInput={ev => this.handleInputTime(ev)}
                    value={constants.range - this.state.daysAgo} />
            </div>
        );
    }
}

function getDates(daysAgo: number) {
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);
    return {
        daysAgo,
        timestamp: Number(date),
        dateStr: date.toLocaleDateString(),
    }
}
