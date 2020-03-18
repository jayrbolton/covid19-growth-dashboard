import {h, Component, Fragment} from 'preact';
import {fetchData} from '../utils/fetch-data';
import {normalizeData} from '../utils/normalize-data';
import {sortByTotalConfirmed} from '../utils/sort-data';

import {VerticalBars} from './vertical-bars';
import {FiltersAndSorts} from './filters-and-sorts';


interface Props {
}

interface State {
    loading: boolean;
    sourceData?: any;
    displayData?: any;
}


export class App extends Component<Props, State> {

    constructor(props) {
        super(props);
        this.state = {
            loading: true
        };
    }

    componentDidMount() {
        fetchData()
            .then(normalizeData)
            .then((sourceData) => {
                const displayData = sortByTotalConfirmed(sourceData);
                console.log(displayData);
                this.setState({loading: false, sourceData, displayData});
            });
    }

    render() {
        if (this.state.loading) {
            return <p>Loading data..</p>
        }
        return (
            <div className='bg-near-black'>
                <div className='mw8 center pa2 sans-serif white'>
                    <h1 className='light-gray tc'>COVID-19 Worldwide Growth Dashboard</h1>
                    <FiltersAndSorts loading={this.state.loading} />
                    <VerticalBars data={this.state.displayData} loading={this.state.loading} />
                </div>
            </div>
        );
    }
}
