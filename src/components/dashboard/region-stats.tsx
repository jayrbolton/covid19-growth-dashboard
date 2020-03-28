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

    stat(stat) {
        return (
            <div className='mr3 pb2 mb2 bb b--white-20 dib' style={{width: '14rem'}}>
                <div style={{width: '9rem'}} className='dib white-90'>{stat.label}</div>
                <div style={{width: '4rem'}} className='dib b'>
                    {formatNumber(stat.val)}
                    <ShowIf bool={stat.percentage}>%</ShowIf>
                </div>
            </div>
        );
    }

    rowView(row) {
        const title = [row.city, row.province, row.country].filter(s => s).join(', ');
        return (
            <div className='bb b--white-40 pb3 mb3'>
                <div className='f4 mb2 b'> {title} </div>
                <div className='w-100 flex flex-wrap justify-between'>
                    <div className='w-100 w-100-m w-50-ns flex flex-column flex-wrap' style={{minWidth: '15rem', height: '7rem'}}>
                        {row.stats.map(stat => this.stat(stat))}
                    </div>
                    <div className='w-100 w-100-m mt3 mt3-m mt0-ns w-50-ns'>
                        <TimeSeriesBars data={row.timeSeries} />
                    </div>
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
                {rows.map(row => this.rowView(row))}
            </Fragment>
        );
    }
}
