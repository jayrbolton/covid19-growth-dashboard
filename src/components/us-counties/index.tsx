import {h, Component, Fragment} from 'preact';
import {fetchData} from '../../utils/nyt/fetch-data';
import {transformData} from '../../utils/nyt/transform-data';
import {Dashboard} from '../dashboard';

const DATA_SOURCE_URL = 'https://github.com/nytimes/covid-19-data';

interface Props {};

interface State {};

export class USCounties extends Component<Props, State> {

    render() {
        return (
            <Fragment>
                <div className='mw8 ph4'>
                    <h1 className='light-gray f4 f2-m f2-ns'>COVID-19 USA Growth by County</h1>
                    <p className='f6'>
                        Data is updated daily from{' '}
                        <a className='light-blue' href={DATA_SOURCE_URL} target='_blank'>The New York Times COVID-19 data repository</a>.
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
