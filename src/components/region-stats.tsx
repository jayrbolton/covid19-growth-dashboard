import {h, Component, Fragment} from 'preact';
import {fetchData} from '../utils/fetch-data';
import {formatNumber} from '../utils/formatting';
import {TimeSeriesBars} from './time-series';


interface Props {
    rows?: any;
    hiddenCount: number;
    loading: boolean;
    dates: Array<Array<number>>;
}

interface State {
    showAmount: number;
}

// Purposes of these sections:
// - show current state
//   - show total cases, deaths, recovered
//   - compare the above values (bars)
// - show growth rate
//    - average new cases all time
//    - average new cases this week
//    - horizontal bar chart over time of total cases


export class RegionStats extends Component<Props, State> {

    constructor(props) {
        super(props);
        this.state = {
            showAmount: 100
        };
    }

    handleClickShowMore() {
        this.setState({
            showAmount: this.state.showAmount + 100
        })
    }

    rowView(row) {
        if (row.hidden) {
            return '';
        }
        const {confirmed, recovered, deaths, active} = row.currentTotals;
        const {deathsPercentage, recoveredPercentage, activePercentage} = row.percentages;
        const {newCasesAllTime, newCases7d} = row.averages;
        return (
            <div className='bb b--white-30 pb3 mb3'>
                <div className='w-100 flex flex-wrap'>
                    <div className='w-100 w-100-m w-50-ns'>
                        <div className='f4 mb2'>
                            {row.province && row.province !== row.country ? row.province + ', ' : ''}
                            <span className='b'>{row.country}</span>
                        </div>

                        <div className='flex flex-wrap'>
                            <div className='w-100 w-100-m w-50-ns pr2' style={{minWidth: '15rem'}}>
                                <div className='flex items-center'>
                                    <div style={{width: '37%'}} className='white-90'>Confirmed:</div>
                                    <div className='nowrap black-90' style={{width: '63%'}}>
                                        <div className='dib pa1 b bg-white-90' style={{width: '100%'}}>
                                            {formatNumber(confirmed)}
                                        </div>
                                    </div>
                                </div>

                                <div className='flex items-center'>
                                    <div style={{width: '37%'}} className='white-90'>Active:</div>
                                    <div className='nowrap' style={{width: '63%'}}>
                                        <div className='dib b bg-orange' style={{width: activePercentage + '%'}}>
                                            <div className='dib pa1'>
                                                {formatNumber(active)} <span className='f6 white-80'>({activePercentage + '%'})</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className='flex items-center'>
                                    <div style={{width: '37%'}} className='white-90'>Recovered:</div>
                                    <div className='nowrap' style={{width: '63%'}}>
                                        <div className='dib b bg-dark-blue' style={{width: recoveredPercentage + '%'}}>
                                            <div className='dib pa1'>
                                                {formatNumber(recovered)} <span className='f6 white-80'>({recoveredPercentage + '%'})</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className='flex items-center'>
                                    <div style={{width: '37%'}} className='white-90'>Deaths:</div>
                                    <div className='nowrap' style={{width: '63%'}}>
                                        <div className='dib b bg-gray' style={{width: deathsPercentage + '%'}}>
                                            <div className='dib pa1'>
                                                {formatNumber(deaths)} <span className='f6 white-80'>({deathsPercentage + '%'})</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className='w-100 w-100-m w-50-ns mt2 mt0-ns mt0-m pl0 pl0-m pl2-ns bn bn-m bl-ns b--white-50'>
                                <div className='pv1'>Average new cases per day:</div>
                                <div className='flex items-center pv1'>
                                    <div className='white-80' style={{width: '45%'}}>Last {this.props.dates.length} days:</div>
                                    <div>{formatNumber(newCasesAllTime)}</div>
                                </div >
                                <div className='flex items-center pv1'>
                                    <div className='white-80' style={{width: '45%'}}>Last 7 days:</div>
                                    <div>{formatNumber(newCases7d)}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className='w-100 w-100-m mt3 mt3-m mt0-ns w-50-ns flex'>
                        <TimeSeriesBars dates={this.props.dates} totals={row.totals} maxes={row.maxes} />
                    </div>
                </div>
            </div>
        );
    }

    showMoreButton() {
        const len = this.props.rows.length - this.props.hiddenCount;
        const diff = len - this.state.showAmount;
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
        if (this.props.loading) {
            return <p>Loading data..</p>
        }
        const rows = this.props.rows.slice(0, this.state.showAmount);
        return (
            <div>
                {rows.map(row => this.rowView(row))}
                {this.showMoreButton()}
            </div>
        );
    }
}
