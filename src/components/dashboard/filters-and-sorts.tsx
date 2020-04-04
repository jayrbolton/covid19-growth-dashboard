import {h, Component, Fragment} from 'preact';
import {SearchInput} from '../generic/inputs';
import {Filters} from './filters';
import {Sorts} from './sorts';
import {DashboardEntry} from '../../types/dashboard';
import {MetricsSelector} from './metrics-selector';

interface Props {
    onFilterLocation?: (string) => void;
    onSort: (number, string) => void;
    entryLabels: Array<string>;
    defaultDisplayedStats: Array<number>;
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

    handleSort(idx: number, prop: string) {
        this.props.onSort(idx, prop);
    }

    render() {
        return (
            <div className='bg-near-black pv2 bb bw2 mb3 b--gray flex justify-between items-center z-1' style={{top: 0, position: 'sticky'}}>
                <MetricsSelector entryLabels={this.props.entryLabels} defaultDisplayedStats={this.props.defaultDisplayedStats} />
                <div className='flex items-center'>
                    <Filters onFilterLocation={inp => this.handleFilterLocation(inp)}/>
                    <Sorts onSort={(idx, prop) => this.handleSort(idx, prop)} entryLabels={this.props.entryLabels} />
                </div>
            </div>
        );
    }
}
