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


export class VerticalBars extends Component<Props, State> {

    constructor(props) {
        super(props);
        this.state = {};
    }

    rowView(row, data) {
        const max = row.currentTotals.confirmed;
        const {confirmed, deaths, recovered} = row.currentTotals;
        // XXX Maybe precompute all this upfront rather than on render
        let deathsPercentage = '0%';
        let recoveredPercentage = '0%';
        if (confirmed > 0) {
            deathsPercentage = String(Math.round(deaths * 1000 / confirmed) / 10) + '%';
            recoveredPercentage = String(Math.round(recovered * 1000 / confirmed) / 10) + '%';
        }
        return (
            <div className='bb b--white-30 pb3 mb3'>
                <div className='w-100 flex mb2'>
                    <div className='f4 w-25'>
                        {row.province && row.province !== row.country ? row.province + ', ' : ''}
                        <span className='b'>{row.country}</span>
                    </div>
                    <div className='w-75 flex'>
                        <span className='w-50'><span className='white-80'>Average new cases per day:</span> 123</span>
                        <span className='w-50'><span className='white-80'>Average new cases last 7 days:</span> 123</span>
                    </div>
                </div>
                <div className='w-100 flex'>
                    <div className='w-25 pr3'>
                        <div className='flex items-center'>
                            <span style={{width: '37%'}} className='white-90'>Confirmed:</span>
                            <span className='dib' style={{width: '63%'}}>
                                <span className='dib nowrap bg-dark-blue pa1 b' style={{width: '100%'}}>
                                    {formatNumber(confirmed)}
                                </span>
                            </span>
                        </span>

                        <div className='flex items-center'>
                            <span style={{width: '37%'}} className='white-90'>Recovered:</span>
                            <span className='dib' style={{width: '63%'}}>
                                <span className='dib nowrap bg-dark-green pa1 b' style={{width: recoveredPercentage}}>
                                    {formatNumber(recovered)} <span className='f6 white-80'>({recoveredPercentage})</span>
                                </span>
                            </span>
                        </div>

                        <div className='flex items-center'>
                            <span style={{width: '37%'}} className='white-90'>Deaths:</span>
                            <span className='dib' style={{width: '63%'}}>
                                <span className='dib nowrap pa1 b' style={{width: deathsPercentage, background: "#e7040fad"}}>
                                    {formatNumber(deaths)} <span className='f6 white-80'>({deathsPercentage})</span>
                                </span>
                            </span>
                        </div>
                    </div>

                    <div className='w-75'>
                        <div>
                            <span className='dib mt4'>Bar chart time series goes here</span>
                        </div>
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

