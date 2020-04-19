import {h, Component, Fragment} from 'preact';
import {formatNumber} from '../../utils/formatting';
import {TimeSeriesBars} from './time-series';
import {DashboardData, DashboardEntry} from '../../types/dashboard';
import './style.css';

// Number of days of stats to show
const TIME_RANGE = 14;

interface Props {
    data: DashboardData;
    displayCount: number;
    // Map of stat indexes of which ones to show for each region
    displayedStats: Map<number, boolean>;
    onSelectStat: (entry: DashboardEntry, statIdx: number) => void;
};

interface State {};

export class RegionStats extends Component<Props, State> {

    constructor(props) {
        super(props);
        this.state = {};
    }

    handleClickStat(entry, statIdx) {
        this.props.onSelectStat(entry, statIdx);
    }

    renderStat(stat, entry, idx) {
        if (stat === null || stat === undefined) {
            return '';
        }
        const daysAgo = this.props.data.timeSeriesOffset;
        const start = -daysAgo - TIME_RANGE;
        let end = -daysAgo;
        if (daysAgo === 0) {
            end = stat.timeSeries.length;
        }
        const vals = stat.timeSeries.slice(start, end);
        const selectedId = entry.location + ':' + idx;
        const isSelected = stat.isComparing;
        return (
            <div
                key={stat.label}
                data-selected={isSelected}
                onClick={() => this.handleClickStat(entry, idx)}
                className='mb3 ba b--white-20 relative pointer region-stats-row-stat'>
                <div className='pa2 nowrap overflow-hidden'>
                    <div className='b'>{stat.label}</div>
                </div>
                <TimeSeriesBars
                    daysAgo={daysAgo}
                    timeRange={TIME_RANGE}
                    statIdx={idx}
                    series={stat.timeSeriesWindow}
                    isPercentage={stat.isPercentage} />
                <div className='pa2 flex justify-between items-center bt b--white-20' style={{background: 'rgb(40, 40, 40)'}}>
                    <div className='dib white-80 f6'>Average daily growth:</div>
                    <div>
                        <div className='dib b white-90 relative'>
                            {stat.timeSeriesWindow.percentGrowth > 0 ? '+' : ''}
                            {formatNumber(stat.timeSeriesWindow.percentGrowth)}%
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    renderEntry(entry) {
        let showStats = this.props.displayedStats;
        const stats = [];
        showStats.forEach((show, idx) => {
            if (!show) {
                return;
            }
            stats.push(this.renderStat(entry.stats[idx], entry, idx));
        });
        return (
            <div
                key={entry.location}
                className='ph3 pv2 pb1 region-stats-row bb b--white-20 bg-near-black'>
                <h2 className='f4 mv2 b'>{entry.location}</h2>
                <div className='w-100' style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, 15.25rem)', gridColumnGap: '0.65rem'}}>
                    {stats}
                </div>
            </div>
        );
    }

    render() {
        const entries = this.props.data.entries;
        if (!entries.length) {
            return (
                <p className='pa4'>
                    No results.
                </p>
            );
        }
        // Let's get imperative. I want this to be really performant.
        let count = 0;
        let idx = 0;
        const rows = [];
        while (idx < entries.length && count < this.props.displayCount) {
            const entry = entries[idx];
            idx += 1;
            if (entry.hidden) {
                continue;
            }
            rows.push(this.renderEntry(entry));
            count += 1;
        }
        entries.forEach(entry => {
            if (entry.hidden) {
                return;
            }
            count += 1;
        });
        return (
            <Fragment>
                {rows}
            </Fragment>
        );
    }
}
