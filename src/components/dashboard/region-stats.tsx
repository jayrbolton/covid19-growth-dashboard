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
                    <div className='mb2 b'>{stat.label}</div>
                    <div className='pb1 mb1'>
                        <div style={{width: '9.5rem'}} className='dib white-70'>Total</div>
                        <div style={{width: '4.5rem'}} className='dib b white-90'>
                            {formatNumber(stat.val)}
                            <ShowIf bool={stat.isPercentage}>%</ShowIf>
                        </div>
                    </div>
                    <div className='mb1'>
                        <div style={{width: '9.5rem'}} className='dib white-70'>Avg. daily growth</div>
                        <div
                            style={{width: '4.5rem', left: percentLeft}}
                            className='dib b white-90 relative'>
                            {stat.percentGrowth > 0 ? '+' : ''}
                            {formatNumber(stat.percentGrowth)}%
                        </div>
                    </div>
                </div>
                <TimeSeriesBars data={stat.timeSeries} isPercentage={stat.isPercentage} />
            </div>
        );
    }

    renderRow(row) {
        const title = [row.city, row.province, row.country].filter(s => s).join(', ');
        let stats = row.stats;
        return (
            <div className='bb b--white-40 bw2 pb1 mb3'>
                <div className='f4 mb2 b'> {row.location} </div>
                <div className='w-100' style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, 15.25rem)', gridColumnGap: '0.65rem'}}>
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
