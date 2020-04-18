import {h, Component, Fragment} from 'preact';
import {percent} from '../../utils/math';
import {fetchData} from '../../utils/jhu/fetch-data';
import {transformData} from '../../utils/jhu/transform-data';
import {sortByDaysAgo} from '../../utils/sort-data';
import {DashboardData, DashboardEntry} from '../../types/dashboard';
import './index.css';
import * as colors from '../../constants/graph-colors.json';
import * as dataSources from '../../constants/data-sources.json';

interface Props {};
interface State {
    dateStr: string;
    timestamp: number;
    daysAgo: number;
    data?: DashboardData;
    loading: boolean;
};

const RANGE = 100;
const ACTIVE_COLOR = colors[8];
const RECOVERED_COLOR = colors[1];
const ACTIVE_COLOR_LIGHT = 'rgb(220, 150, 150)';
const RECOVERED_COLOR_LIGHT = 'rgb(99, 203, 116)';
const BAR_WIDTH = 48; // rem
const LEFT_SPACE = 15; // rem
const LEFT_MARGIN = 1; // rem

export class Timeline extends Component<Props, State> {

    constructor(props: Props) {
        super(props);
        const date = new Date();
        this.state = Object.assign(getDates(0), {
            loading: true,
        });
    }

    componentDidMount() {
        fetchData()
            .then(transformData)
            .then(data => {
                calculatePercentages(data);
                this.setState({
                    loading: false,
                    data,
                });
            });
    }

    handleInputTime(ev) {
        const val = ev.currentTarget.value;
        const daysAgo = RANGE - val;
        sortByDaysAgo(this.state.data.entries, daysAgo, 0); // index 0 is confirmed cases
        console.log('indexes', this.state.data.entries.map(e => e.order));
        this.setState(getDates(daysAgo));
    }

    render() {
        if (this.state.loading || !this.state.data) {
            return (
                <p className='ph4 mt4'>Loading data...</p>
            );
        }
        const dataRows = [];
        for (let idx = 0; idx < this.state.data.entries.length; idx++) {
            const entry = this.state.data.entries[idx];
            dataRows.push(renderDataRow(entry, idx, this.state.daysAgo));
        }
        const rowHeight = this.state.data.entries.length * 1.25 + 'rem';
        return (
            <div>
                <div className='ph3 pt3 bb b--white-20 mb3'>
                    <h1 className='light-gray f4 f2-m f2-ns'>COVID-19 Animated Timeline by Country</h1>
                    <p>
                        Data is updated daily from the{' '}
                        <a href={dataSources.sourceURL} target='_blank' className='light-blue'>
                            Johns Hopkins University CSSE COVID-19 Data Repository
                        </a>.
                    </p>
                </div>
                <div className='mb3 mw7 ph3' style={{width: BAR_WIDTH + 'rem'}}>
                    <label className='db mb2 f4'>Date: {this.state.dateStr}</label>
                    <input
                        className='db w-100'
                        type='range'
                        min='0'
                        max={RANGE}
                        onInput={ev => this.handleInputTime(ev)}
                        value={RANGE - this.state.daysAgo} />
                </div>
                <div className='pt3'>
                    <div className='f4 flex mb3 mw5 justify-between' style={{marginLeft: LEFT_SPACE + LEFT_MARGIN + 'rem'}}>
                        <span className='b' style={{color: ACTIVE_COLOR}}>Active cases</span>
                        <span className='b' style={{color: RECOVERED_COLOR}}>Recovered</span>
                    </div>
                    <div style={{height: rowHeight, position: 'relative'}}>
                        {dataRows}
                    </div>
                </div>
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

function renderDataRow(entry: DashboardEntry, idx: number, daysAgo: number) {
    if (entry.aggregate) {
        return '';
    }
    const top = (entry.order === undefined ? idx : entry.order) * 1.5 + 'rem';
    const totalWidth = entry.percentages.totals[entry.percentages.totals.length - (daysAgo + 1)];
    const activeWidth = entry.percentages.active[entry.percentages.active.length - (daysAgo + 1)];
    const recoveredWidth = entry.percentages.recovered[entry.percentages.recovered.length - (daysAgo + 1)];
    const confirmed = entry.stats[0].timeSeries;
    const currentConfirmed = confirmed[confirmed.length - (daysAgo + 1)];
    return (
        <div
            className='flex mb2 items-center'
            key={entry.location}
            id={entry.location.replace(' ', '-')}
            style={{position: 'absolute', top, width: '90%', left: LEFT_MARGIN, transition: 'top 0.75s'}}>
            <div className='tr mr2 br b--white-20 pr2 truncate f4' style={{width: LEFT_SPACE + 'rem'}}>
                {entry.location}
            </div>
            <div style={{flexGrow: 1}}>
                <div
                    className='flex hello'
                    style={{width: totalWidth + '%', transition: 'width 0.25s', overflow: 'visible'}}>
                    <div
                        className='f6 b w-50 data-bar data-bar-active'
                        style={{background: ACTIVE_COLOR, width: activeWidth + '%'}}>
                    </div>
                    <div
                        className='f6 b w-50 data-bar data-bar-recovered'
                        style={{background: RECOVERED_COLOR, width: recoveredWidth + '%'}}>
                    </div>
                    <span className='dib ml1'>{currentConfirmed || 0}</span>
                </div>
            </div>
        </div>
    );
}

function calculatePercentages(data) {
    // Find max of all total cases for a date and a region
    let max = 0;
    data.entries.forEach(entry => {
        if (entry.aggregate) {
            return;
        }
        const confirmed = entry.stats[0].timeSeries;
        confirmed.forEach(n => {
            if (n > max) {
                max = n;
            }
        });
    });
    data.entries.forEach(entry => {
        if (entry.aggregate) {
            return;
        }
        const confirmed = entry.stats[0].timeSeries;
        const active = entry.stats[2].timeSeries;
        const recovered = entry.stats[1].timeSeries;
        const totals = confirmed.map((n, idx) => {
            return percent(n, max);
        });
        const activePerc = active.map((n, idx) => percent(n, confirmed[idx]));
        const recoveredPerc = recovered.map((n, idx) => percent(n, confirmed[idx]));
        entry.percentages = {
            totals,
            active: activePerc,
            recovered: recoveredPerc,
        };
    });
}

// Get the maximum confirmed cases value over all entries by day index
function getMaxConfirmed(data: DashboardData, dayIdx: number) {
    let max = 0;
    data.entries.forEach(entry => {
        if (entry.aggregate) {
            return;
        }
        const confirmed = entry.stats[0].timeSeries;
        const val = confirmed[dayIdx];
        if (val > max) {
            max = val;
        }
    });
    return max;
}
