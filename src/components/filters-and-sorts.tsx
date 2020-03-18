import {h, Component, Fragment} from 'preact';


interface Props {
    loading: boolean;
}

interface State {
}


export class FiltersAndSorts extends Component<Props, State> {

    constructor(props) {
        super(props);
        this.state = {};
    }

    render() {
        if (this.props.loading) {
            return '';
        }
        return (
            <Fragment>
                <div className='bg-near-black pv2 bb bw2 mb3 b--gray' style={{top: 0, position: 'sticky'}}>Filtering and sorting controls go here.</div>
            </Fragment>
        );
    }
}


