import {h, Component, Fragment} from 'preact';
import {fetchData} from '../utils/fetch-data';
import {normalizeData} from '../utils/normalize-data';


interface Props {
    data?: any;
    loading: boolean;
}

interface State {
}


export class VerticalBars extends Component<Props, State> {

    constructor(props) {
        super(props);
        this.state = {};
    }

    rowView(row) {
        return (
            <div>
                <span>{row.province}</span>
                <span>{row.country}</span>
                <span>{row.currentTotals.confirmed}</span>
                <span>{row.currentTotals.deaths}</span>
                <span>{row.currentTotals.recovered}</span>
            </div>
        );
    }

    render() {
        if (this.props.loading || !this.props.data) {
            return <p>Loading data..</p>
        }
        return (
            <Fragment>
                {this.props.data.map(this.rowView)}
            </Fragment>
        );
    }
}

