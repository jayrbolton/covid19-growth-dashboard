import {h, Component, Fragment} from 'preact';
import {ShowIf} from '../generic/show-if';
import {formatNumber} from '../../utils/formatting';
import {TimeSeriesBars} from './time-series';
import {DashboardData} from './index';


interface Props {
    loading: boolean;
    data: DashboardData;
}

interface State {
}


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
                <div style={{width: '37%'}} className='white-90'>{stat.label}</div>
                <div className='nowrap' style={{width: '63%'}}>
                    <div className='dib b' style={{width: stat.percentage + '%', background: stat.barColor}}>
                        <div className='dib pa1'>
                            {formatNumber(stat.stat)}
                            <ShowIf bool={stat.percentage !== 100}>
                                <span className='f6 white-80'> ({stat.percentage + '%'})</span>
                            </ShowIf>
                        </div>
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
                <div className='w-100 flex flex-wrap'>
                    <div className='w-100 w-100-m w-50-ns'>
                        <div className='f4 mb2 b'>
                            {title}
                        </div>

                        <div className='flex flex-wrap'>
                            <div className='w-100 w-100-m w-50-ns pr2' style={{minWidth: '15rem'}}>
                                {row.col0.stats.map(stat => this.col0Stat(stat))}
                            </div>

                            <div className='w-100 w-100-m w-50-ns mt2 mt0-ns mt0-m pl0 pl0-m pl2-ns bn bn-m bl-ns b--white-50'>
                                <div className='pv1'>{row.col1.title}</div>
                                {row.col1.stats.map(stat => this.col1Stat(stat))}
                            </div>
                        </div>
                    </div>
                    <div className='w-100 w-100-m mt3 mt3-m mt0-ns w-50-ns flex'>
                        <TimeSeriesBars bars={row.bars} />
                    </div>
                </div>
            </div>
        );
    }

    showMoreButton() {
        const diff = this.props.data.count - this.props.data.entries.length;
        if (diff <= 0) {
            return '';
        }
        return (
            <p>
                <a onClick={() => this.handleClickShowMore()} className='pointer link b light-blue dim'>
                    Show more ({diff} remaining)
                </a>
            </p>
        );
    }

    render() {
        if (this.props.loading || !this.props.data) {
            return <p>Loading data..</p>
        }
        const rows = this.props.data.entries;
        if (!rows.length) {
            return (
                <p className='pv4'>
                    No results.
                </p>
            );
        }
        return (
            <div>
                {rows.map(row => this.rowView(row))}
                {this.showMoreButton()}
            </div>
        );
    }
}
