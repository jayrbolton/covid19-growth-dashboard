import {h, Component, Fragment} from 'preact';
import {SearchInput} from '../generic/inputs';
import {Filters} from './filters';
import {Sorts} from './sorts';

interface Props {
    onFilterCountry?: (string) => void;
    onFilterProvince?: (string) => void;
    onSort?: (string) => void;
}

interface State {}

export class FiltersAndSorts extends Component<Props, State> {

    constructor(props) {
        super(props);
        this.state = {};
    }

    handleFilterCountry(inp: string) {
        if (this.props.onFilterCountry) {
            this.props.onFilterCountry(inp);
        }
    }

    handleFilterProvince(inp: string) {
        if (this.props.onFilterProvince) {
            this.props.onFilterProvince(inp);
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
                    <Filters onFilterCountry={inp => this.handleFilterCountry(inp)} onFilterProvince={inp => this.handleFilterProvince(inp)}/>
                </div>
                <div>
                    <Sorts onSort={inp => this.handleSort(inp)} />
                </div>
            </div>
        );
    }
}
