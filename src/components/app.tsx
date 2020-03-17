import {h, Component} from 'preact';
import {fetchData} from '../utils/fetch-data';
import {normalizeData} from '../utils/normalize-data';


interface Props {
}

interface State {
    loading: boolean;
    data?: any;
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
            .then((data) => {
                return normalizeData(data);
            })
            .then((data) => {
                console.log(data);
                this.setState({loading: false, data});
            });
    }

    render() {
        if (this.state.loading) {
            return <p>Loading data..</p>
        }
        return <p>Data is loaded</p>;
    }
}
