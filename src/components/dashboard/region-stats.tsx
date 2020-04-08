import {h, Component, Fragment} from 'preact';
import {ShowIf} from '../generic/show-if';
import {formatNumber} from '../../utils/formatting';
import {TimeSeriesBars} from './time-series';
import {DashboardData} from '../../types/dashboard';
import './style.css';

interface Props {
    data: DashboardData;
    // Map of stat indexes of which ones to show for each region
    displayedStats: Map<number, boolean>;
    onSelectStat: ({location: string, statIdx: number}) => void;
    selectedStats: Map<string, {location: string, statIdx: number}>;
};

interface State {};

export class RegionStats extends Component<Props, State> {

    constructor(props) {
        super(props);
        this.state = {};
    }

    handleClickStat(stat, row, idx) {
        this.props.onSelectStat({location: row.location, statIdx: idx});
    }

    renderStat(stat, row, idx, selectedStats) {
        if (stat === null || stat === undefined) {
            return '';
        }
        // For pushing the percentage growth stat left a little
        let percentLeft = '0';
        if (stat.percentGrowth > 0) {
            percentLeft = '-0.5rem';
        } else if (stat.percentGrowth < 0) {
            percentLeft = '-0.3rem';
        }
        const selectedId = row.location + ':' + idx;
        const isSelected = selectedStats.has(selectedId);
        const borderColor = isSelected ? '#FFD700' : 'rgba(255, 255, 255, 0.2)';
        return (
            <div
                style={{borderColor}}
                onClick={() => this.handleClickStat(stat, row, idx)}
                className='mb3 ba b--white-20 relative pointer region-stats-row-stat grow'>
                <div className='pa2'>
                    <div className='b'>{stat.label}</div>
                </div>
                <TimeSeriesBars data={stat.timeSeries} isPercentage={stat.isPercentage} />
                <div className='pa2 flex justify-between items-center bt b--white-20' style={{background: 'rgb(40, 40, 40)'}}>
                    <div className='dib white-80 f6'>Average daily growth:</div>
                    <div>
                        <div className='dib b white-90 relative'>
                            {stat.percentGrowth > 0 ? '+' : ''}
                            {formatNumber(stat.percentGrowth)}%
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    renderRow(row, selectedStats) {
        let showStats = this.props.displayedStats;
        const title = [row.city, row.province, row.country].filter(s => s).join(', ');
        const stats = [];
        showStats.forEach((show, idx) => {
            if (!show) {
                return;
            }
            stats.push(this.renderStat(row.stats[idx], row, idx, selectedStats));
        });
        return (
            <div className='ph2 ph2-m ph4-ns pv2 pb1 region-stats-row bb b--white-10 bg-near-black'>
                <h2 className='f4 mv2 b'>{row.location}</h2>
                <div className='w-100' style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, 15.25rem)', gridColumnGap: '0.65rem'}}>
                    {stats}
                </div>
            </div>
        );
    }

    render() {
        const rows = this.props.data.entries;
        if (!rows.length) {
            return (
                <p className='pa4'>
                    No results.
                </p>
            );
        }
        return (
            <Fragment>
                {rows.map(row => this.renderRow(row, this.props.selectedStats))}
            </Fragment>
        );
    }
}
