import {h, Component, Fragment} from 'preact';
import {percent} from '../../utils/math';
import {fetchData} from '../../utils/jhu/fetch-data';
import {transformDataTimeline} from '../../utils/jhu/transform-data-timeline';
import {sortByDaysAgo} from '../../utils/sort-data';
import {TimelineData, TimelineRegion} from '../../types/timeline-data';
import {formatNumber} from '../../utils/formatting';
import './index.css';
import * as colors from '../../constants/graph-colors.json';
import * as dataSources from '../../constants/data-sources.json';

interface Props {};
interface State {
    dateStr: string;
    timestamp: number;
    daysAgo: number;
    data?: TimelineData;
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
            .then(transformDataTimeline)
            .then(data => {
                this.setState({
                    loading: false,
                    data,
                });
            });
    }

    handleInputTime(ev) {
        const val = ev.currentTarget.value;
        const daysAgo = RANGE - val;
        sortByDaysAgo(this.state.data, daysAgo, 'confirmed'); // index 0 is confirmed cases
        this.setState(getDates(daysAgo));
    }

    render() {
        if (this.state.loading || !this.state.data) {
            return (
                <p className='ph4 mt4'>Loading data...</p>
            );
        }
        const dataRows = this.state.data.regions.map((region, idx) => {
            return renderDataRow(region, idx, this.state.daysAgo);
        });
        const rowHeight = this.state.data.regions.length * 1.25 + 'rem';
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
                    <div className='flex items-end w-100'>
                        <span className='b' style={{color: ACTIVE_COLOR}}>Active cases</span>
                        <span className='b' style={{color: RECOVERED_COLOR}}>Recovered</span>
                    </div>
                </div>
                <div className='mt3 bg-near-black pt3'>
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

function renderDataRow(region: TimelineRegion, idx: number, daysAgo: number) {
    const top = region.order * 1.5 + 'rem';
    const percs = region.percentages;
    const totalWidth = idxDaysAgo(percs.confirmedGlobal, daysAgo);
    const activeWidth = idxDaysAgo(percs.active, daysAgo);
    const recoveredWidth = idxDaysAgo(percs.recovered, daysAgo);
    const {confirmed, active, recovered} = region.totals;
    const currentConfirmed = idxDaysAgo(confirmed, daysAgo);
    const currentActive = idxDaysAgo(active, daysAgo);
    const currentRecovered = idxDaysAgo(recovered, daysAgo);
    return (
        <div
            className='flex mb2 items-center'
            key={region.id}
            style={{position: 'absolute', top, width: '90%', left: LEFT_MARGIN, transition: 'top 0.75s'}}>
            <div className='tr mr2 br b--white-20 pr2 truncate f4' style={{width: LEFT_SPACE + 'rem'}}>
                {region.name}
            </div>
            <div style={{flexGrow: 1}}>
                <div
                    className='flex hello'
                    style={{width: totalWidth + '%', transition: 'width 0.25s', overflow: 'visible'}}>
                    <div
                        title={`${formatNumber(currentActive)} active cases`}
                        className='f6 b w-50 data-bar data-bar-active'
                        style={{background: ACTIVE_COLOR, width: activeWidth + '%'}}>
                    </div>
                    <div
                        title={`${formatNumber(currentRecovered)} recovered`}
                        className='f6 b w-50 data-bar data-bar-recovered'
                        style={{background: RECOVERED_COLOR, width: recoveredWidth + '%'}}>
                    </div>
                    <span className='dib ml1'>{formatNumber(currentConfirmed || 0)}</span>
                </div>
            </div>
        </div>
    );
}

// Access an index in a time series with a daysAgo offset, where the current day is the last elem
function idxDaysAgo(arr: Array<any>, daysAgo: number) {
    return arr[arr.length - (daysAgo + 1)]
}
