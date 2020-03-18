import {h, Component, Fragment} from 'preact';
import {fetchData} from '../utils/fetch-data';
import {normalizeData} from '../utils/normalize-data';
import {VerticalBars} from './vertical-bars';
import {sortByTotalConfirmed} from '../utils/sort-data';


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
            <Fragment>
                <VerticalBars data={this.state.displayData} loading={this.state.loading} />
            </Fragment>
        );
    }
}
