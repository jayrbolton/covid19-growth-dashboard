import {h, Component, Fragment} from 'preact';
import {SearchInput} from './generic/inputs';
import {Filters} from './filters';


interface Props {
    loading: boolean;
    onFilter: (string) => void;
}

interface State {
}


export class FiltersAndSorts extends Component<Props, State> {

    constructor(props) {
        super(props);
        this.state = {};
    }

    handleFilter(inp: string) {
        if (this.props.onFilter) {
            this.props.onFilter(inp);
        }
    }

    render() {
        if (this.props.loading) {
            return '';
        }
        return (
            <Fragment>
                <div className='bg-near-black pv2 bb bw2 mb3 b--gray flex' style={{top: 0, position: 'sticky'}}>
                    <div>
                        <Filters onFilter={inp => this.handleFilter(inp)} />
                    </div>
                </div>
            </Fragment>
        );
    }
}
