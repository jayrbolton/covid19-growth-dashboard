import {h, Component} from 'preact';
import {Dashboard, DashboardData} from '../dashboard';
import {fetchData} from '../../utils/jhu/fetch-data';
import {transformData} from '../../utils/jhu/transform-data';
import {formatUTCDate} from '../../utils/formatting';
import * as dataSources from '../../constants/data-sources.json';

interface Props {
};

interface State {
};

export class JHUWorldDashboard extends Component<Props, State> {

    constructor(props: Props) {
        super(props);
        this.state = {};
    }

    render() {
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
                <Dashboard fetchSourceData={fetchSourceData} />
            </div>
        );
    }
}

function fetchSourceData() {
    return fetchData().then(transformData)
}
