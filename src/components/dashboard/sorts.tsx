import {h, Component, Fragment} from 'preact';

import {DashboardEntry} from '../../types/dashboard';


interface Props {
    onSort?: (string) => void;
    // Used to automatically fill in the sort options
    rowExample: DashboardEntry;
}

interface State {}

export class Sorts extends Component<Props, State> {

    constructor(props) {
        super(props);
        this.state = {};
    }

    handleSort(ev) {
        const val = ev.currentTarget.value.trim().toLowerCase();
        if (this.props.onSort) {
            this.props.onSort(val);
        }
    }

    render() {
        const sortNames = this.props.rowExample.col0.stats.map(each => each.label);
        const sortIndexes = this.props.rowExample.col0.stats.map((_, idx) => idx);
        return (
            <div>
                <span className='dib mr2 white-80'>Sort by:</span>
                <select className='bg-black white ba b--white-50 pa1' onChange={ev => this.handleSort(ev)}>
                    {
                        sortNames.map((name, idx) => {
                            return (
                                <option value={idx}>{name}</option>
                            );
                        })
                    }
                </select>
            </div>
        );
    }
}

