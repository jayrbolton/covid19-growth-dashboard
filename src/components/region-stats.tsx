import {h, Component, Fragment} from 'preact';
import {fetchData} from '../utils/fetch-data';
import {normalizeData} from '../utils/normalize-data';
import {formatNumber} from '../utils/formatting';


interface Props {
    data?: any;
    loading: boolean;
}

interface State {
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
        this.state = {};
    }

    rowView(row, data) {
        const {confirmed, recovered, deaths} = row.currentTotals;
        const {deathsPercentage, recoveredPercentage} = row.percentages;
        const {newCasesAllTime, newCases7d} = row.averages;
        return (
            <div className='bb b--white-30 pb3 mb3'>
                <div className='w-100 flex flex-wrap mb2'>
                    <div className='w-100 w-100-m w-50-ns'>
                        <div className='f4 mb2'>
                            {row.province && row.province !== row.country ? row.province + ', ' : ''}
                            <span className='b'>{row.country}</span>
                        </div>

                        <div className='flex flex-wrap'>
                            <div className='w-100 w-100-m w-50-ns pr2' style={{minWidth: '15rem'}}>
                                <div className='flex items-center'>
                                    <div style={{width: '37%'}} className='white-90'>Confirmed:</div>
                                    <div className='nowrap' style={{width: '63%'}}>
                                        <div className='dib pa1 b bg-dark-blue' style={{width: '100%'}}>
                                            {formatNumber(confirmed)}
                                        </div>
                                    </div>
                                </div>

                                <div className='flex items-center'>
                                    <div style={{width: '37%'}} className='white-90'>Recovered:</div>
                                    <div className='nowrap' style={{width: '63%'}}>
                                        <div className='dib pa1 b bg-dark-green' style={{width: recoveredPercentage + '%'}}>
                                            {formatNumber(recovered)} <span className='f6 white-80'>({recoveredPercentage + '%'})</span>
                                        </div>
                                    </div>
                                </div>

                                <div className='flex items-center'>
                                    <div style={{width: '37%'}} className='white-90'>Deaths:</div>
                                    <div className='nowrap' style={{width: '63%'}}>
                                        <div className='dib pa1 b bg-gray' style={{width: deathsPercentage + '%'}}>
                                            {formatNumber(deaths)} <span className='f6 white-80'>({deathsPercentage + '%'})</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className='w-100 w-100-m w-50-ns'>
                                <div className='pv1'>Average new cases per day:</div>
                                <div className='flex items-center pv1'>
                                    <div className='white-80' style={{width: '37%'}}>All time:</div>
                                    <div>{formatNumber(newCasesAllTime)}</div>
                                </div >
                                <div className='flex items-center pv1'>
                                    <div className='white-80' style={{width: '37%'}}>Last 7 days:</div>
                                    <div>{formatNumber(newCases7d)}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className='w-100 w-100-m mt3 mt3-m mt0-ns w-50-ns flex'>
                        <div className='bg-dark-gray pa2 w-100'>Bar chart time series goes here</div>
                    </div>
                </div>
            </div>
        );
    }

    render() {
        if (this.props.loading || !this.props.data) {
            return <p>Loading data..</p>
        }
        return (
            <Fragment>
                {this.props.data.rows.map(row => this.rowView(row, this.props.data))}
            </Fragment>
        );
    }
}

