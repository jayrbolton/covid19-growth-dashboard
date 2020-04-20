import {h, Component, Fragment} from 'preact';
import {constants} from './constants';

interface Props {
    onInputDaysAgo: (number) => void;
    onChangeSort: (string) => void;
};
interface State {
    dateStr: string;
    daysAgo: number;
    atEnd: boolean;
    atStart: boolean;
    paused: boolean;
};

export class Inputs extends Component<Props, State> {

    // Interval timer for playing animation
    playingInterval: number | null = null;

    constructor(props: Props) {
        super(props);
        this.state = Object.assign(getDates(0), {
            loading: true,
            atEnd: true,
            atStart: false,
            paused: true,
        });
    }

    setDaysAgo(daysAgo: number) {
        const update: any = getDates(daysAgo);
        update.atEnd = daysAgo === 0;
        update.atStart = daysAgo === constants.range;
        this.setState(update);
        this.props.onInputDaysAgo(daysAgo);
    }

    handleInputTime(ev) {
        const val = ev.currentTarget.value;
        const daysAgo = constants.range - val;
        this.setDaysAgo(daysAgo);
    }

    handleJumpStart() {
        const daysAgo = constants.range;
        this.setDaysAgo(daysAgo);
    }

    handleJumpBack() {
        const daysAgo = this.state.daysAgo + 1;
        this.setDaysAgo(daysAgo);
    }

    handlePlay() {
        if (this.playingInterval) {
            return;
        }
        this.setState({paused: false});
        this.playingInterval = setInterval(ts => {
            if (this.state.atEnd) {
                this.handlePause();
                return;
            }
            this.handleJumpForward();
        }, 500);
    }

    handlePause() {
        if (!this.playingInterval) {
            return;
        }
        this.setState({paused: true});
        clearInterval(this.playingInterval);
        this.playingInterval = null;
    }

    handleJumpForward() {
        const daysAgo = this.state.daysAgo - 1;
        this.setDaysAgo(daysAgo);
    }

    handleJumpEnd() {
        const daysAgo = 0;
        this.setDaysAgo(daysAgo);
    }

    handleChangeSort(ev) {
        const val = ev.currentTarget.value;
        this.props.onChangeSort(val);
    }

    render() {
        const {atStart, atEnd, paused} = this.state;
        return (
            <div className='b' style={{width: '48rem', marginLeft: constants.leftSpace + 'rem'}}>
                <div className='flex items-center justify-between mb2'>
                    <label style={{width: '10rem'}} className='db'>Date: {this.state.dateStr}</label>
                    <div>
                        {renderControlBtn('⏮', atStart, this.handleJumpStart.bind(this))}
                        {renderControlBtn('⏪', atStart, this.handleJumpBack.bind(this))}
                        {renderControlBtn('▶️', atEnd || !paused, this.handlePlay.bind(this))}
                        {renderControlBtn('⏸️', paused, this.handlePause.bind(this))}
                        {renderControlBtn('⏩', atEnd, this.handleJumpForward.bind(this))}
                        {renderControlBtn('⏭', atEnd, this.handleJumpEnd.bind(this))}
                    </div>
                    {renderSelectSort(this)}
                </div>
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

// Render a play/pause/etc time control button
function renderControlBtn(symb: string, disabled: boolean = false, onClick) {
    const style = {
        userSelect: 'none',
    };
    if (disabled) {
        return (
            <a style={style} className='ba b--white-20 ph2 pt1 pb2 br1 dib bg-near-black dark-gray mh2'>{symb}</a>
        );
    }
    return (
        <a
            style={style}
            onClick={onClick}
            className='ba b--blue ph2 pt1 pb2 br1 dib bg-dark-gray white mh2 pointer grow dim'>{symb}</a>
    );
}

function renderSelectSort(cmpnt: Inputs) {
    const optionData = [
        ['Total cases', 'confirmed'],
        ['Active cases', 'active'],
        ['Recovered', 'recovered'],
    ]
    const options = optionData.map(([label, val]) => {
        return (
            <option value={val}>{label}</option>
        );
    });
    return (
        <div>
            <span className='dib mr2'>Sort by:</span>
            <select className='bg-black white ba b--white-50 pa1 mw-100'onInput={cmpnt.handleChangeSort.bind(cmpnt)}>
                {options}
            </select>
        </div>
    );
}
