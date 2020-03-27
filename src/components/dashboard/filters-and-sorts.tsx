import {h, Component, Fragment} from 'preact';
import {SearchInput} from '../generic/inputs';
import {Filters} from './filters';
import {Sorts} from './sorts';
import {DashboardEntry} from '../../types/dashboard';

interface Props {
    onFilterLocation?: (string) => void;
    onSort?: (string) => void;
    rowExample: DashboardEntry;
}

interface State {}

export class FiltersAndSorts extends Component<Props, State> {

    constructor(props) {
        super(props);
        this.state = {};
    }

    handleFilterLocation(inp: string) {
        if (this.props.onFilterLocation) {
            this.props.onFilterLocation(inp);
        }
    }

    handleSort(inp: string) {
        if (this.props.onSort) {
            this.props.onSort(inp);
        }
    }

    render() {
        return (
            <div className='bg-near-black pv2 bb bw2 mb3 b--gray flex justify-between' style={{top: 0, position: 'sticky'}}>
                <div>
                    <Filters onFilterLocation={inp => this.handleFilterLocation(inp)}/>
                </div>
                <div>
                    <Sorts onSort={inp => this.handleSort(inp)} rowExample={this.props.rowExample} />
                </div>
            </div>
        );
    }
}
