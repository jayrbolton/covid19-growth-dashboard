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

    handleClickShowMore() {
        /* TODO
        this.setState({
            showAmount: this.state.showAmount + 100
        })
        */
    }

    col0Stat(stat) {
        return (
            <div className='flex items-center'>
                <div style={{width: '50%'}} className='white-90'>{stat.label}</div>
                <div className='nowrap' style={{width: '50%'}}>
                    <div className='dib pa1'>
                        <span className='dib b'>
                            {formatNumber(stat.stat)}
                            <ShowIf bool={stat.percentage}>%</ShowIf>
                        </span>
                    </div>
                </div>
            </div>
        );
    }

    // Has the type found in DashboardData.entries.col1.stats
    col1Stat(stat) {
        return (
            <div className='flex items-center pv1'>
                <div className='white-80' style={{width: '45%'}}>{stat.label}</div>
                <div>{formatNumber(stat.stat)}</div>
            </div >
        );
    }

    rowView(row) {
        const title = [row.city, row.province, row.country].filter(s => s).join(', ');
        return (
            <div className='bb b--white-30 pb3 mb3'>
                <div className='f4 mb2 b'> {title} </div>
                <div className='w-100 flex flex-wrap justify-between'>
                    <div className='w-100 w-100-m w-25-ns' style={{minWidth: '15rem'}}>
                        {row.col0.stats.map(stat => this.col0Stat(stat))}
                    </div>
                    <div className='w-100 w-100-m w-25-ns mt2 mt0-ns mt0-m pl0 pl0-m pl3-ns'>
                        <div className='pv1'>{row.col1.title}</div>
                        {row.col1.stats.map(stat => this.col1Stat(stat))}
                    </div>
                    <div className='w-100 w-100-m mt3 mt3-m mt0-ns w-50-ns flex pt1'>
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
