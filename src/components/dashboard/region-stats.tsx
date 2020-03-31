import {h, Component, Fragment} from 'preact';
import {ShowIf} from '../generic/show-if';
import {formatNumber} from '../../utils/formatting';
import {TimeSeriesBars} from './time-series';
import {DashboardData} from '../../types/dashboard';

interface Props {
    data: DashboardData;
};

interface State {};

export class RegionStats extends Component<Props, State> {

    constructor(props) {
        super(props);
        this.state = {};
    }

    renderStat(stat) {
        if (stat === null) {
            // Filler element for spacing
            return (<div style={{width: '12rem'}}></div>);
        }
        // For pushing the percentage growth stat left a little
        let percentLeft = '0';
        if (stat.percentGrowth > 0) {
            percentLeft = '-0.5rem';
        } else if (stat.percentGrowth < 0) {
            percentLeft = '-0.3rem';
        }
        return (
            <div className='mb3 ba b--white-20'>
                <div className='pa2'>
                    <div className='pb1 mb1'>
                        <div style={{width: '10rem'}} className='dib white-90 b'>{stat.label}</div>
                        <div style={{width: '4rem'}} className='dib b'>
                            {formatNumber(stat.val)}
                            <ShowIf bool={stat.isPercentage}>%</ShowIf>
                        </div>
                    </div>
                    <div className='mb1'>
                        <div style={{width: '10rem'}} className='dib white-70'>Average change</div>
                        <div
                            style={{width: '4rem', left: percentLeft}}
                            className='dib b white-70 relative'>
                            {stat.percentGrowth > 0 ? '+' : ''}
                            {formatNumber(stat.percentGrowth)}%
                        </div>
                    </div>
                </div>
                <TimeSeriesBars data={stat.timeSeries} />
            </div>
        );
    }

    renderRow(row) {
        const title = [row.city, row.province, row.country].filter(s => s).join(', ');
        let stats = row.stats;
        if (stats.length < 4) {
            stats.push(null);
            stats.push(null);
        }
        return (
            <div className='bb b--white-40 bw2 pb1 mb3'>
                <div className='f4 mb2 b'> {row.location} </div>
                <div className='w-100 flex flex-wrap justify-between'>
                    {row.stats.map(stat => this.renderStat(stat))}
                </div>
            </div>
        );
    }

    render() {
        const rows = this.props.data.entries;
        if (!rows.length) {
            return (
                <p className='pv4'>
                    No results.
                </p>
            );
        }
        return (
            <Fragment>
                {rows.map(row => this.renderRow(row))}
            </Fragment>
        );
    }
}
