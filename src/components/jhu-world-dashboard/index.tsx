import {h, Component, Fragment} from 'preact';
import {Dashboard} from '../dashboard';
import {DashboardData} from '../../types/dashboard';
import {fetchData} from '../../utils/jhu/fetch-data';
import {transformData} from '../../utils/jhu/transform-data';
import * as dataSources from '../../constants/data-sources.json';

interface Props {
    hide: boolean;
};

interface State {};

export class JHUWorldDashboard extends Component<Props, State> {

    constructor(props: Props) {
        super(props);
        this.state = {};
    }

    render() {
        if (this.props.hide) {
          return '';
        }
        return (
            <Fragment>
                <div className='mw8 ph4'>
                    <h1 className='light-gray f4 f2-m f2-ns'>COVID-19 Worldwide Growth by Country</h1>
                    <p className='f6'>
                        Data is updated daily from the{' '}
                        <a href={dataSources.sourceURL} target='_blank' className='light-blue'>
                            Johns Hopkins University CSSE COVID-19 Data Repository
                        </a>.
                    </p>
                </div>
                <Dashboard fetchSourceData={fetchSourceData} />
            </Fragment>
        );
    }
}

function fetchSourceData() {
    return fetchData().then(transformData);
}
