import {h, Component} from 'preact';
import {Dashboard, DashboardData} from '../dashboard';
import {fetchData} from '../../utils/jhu/fetch-data';
import {transformData} from '../../utils/jhu/transform-data';
import {formatUTCDate} from '../../utils/formatting';
import * as dataSources from '../../constants/data-sources.json';

interface Props {
};

interface State {
    loading: boolean;
    sourceData?: DashboardData;
};

export class JHUWorldDashboard extends Component<Props, State> {
    sourceData: any = null;

    constructor(props: Props) {
        super(props);
        this.state = {
            loading: true
        };
        fetchData()
            .then(transformData)
            .then((sourceData) => {
                this.setState({sourceData});
            })
            .finally(() => this.setState({loading: false}));
    }

    render() {
        if (this.state.loading) {
            return <p className='white sans-serif pt5 tc'>Loading data...</p>
        }
        return (
            <div>
                <h1 className='light-gray tc f4 f2-m f2-ns'>COVID-19 Worldwide Growth</h1>
                <p className='f6'>
                    Data is updated daily from the{' '}
                    <a href={dataSources.sourceURL} target='_blank' className='light-blue'>
                        Johns Hopkins University CSSE COVID-10 Data Repository
                    </a>.
                    Last update was {formatUTCDate()} at 12am UTC.{' '}
                    <a href={dataSources.citationsURL} target='_blank' className='light-blue'>
                        Disclaimer and citations
                    </a>.
                </p>
                <Dashboard loading={this.state.loading} sourceData={this.state.sourceData} />
            </div>
        );
    }
}
