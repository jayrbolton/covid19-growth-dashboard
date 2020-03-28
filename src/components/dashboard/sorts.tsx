import {h, Component, Fragment} from 'preact';

import {DashboardEntry} from '../../types/dashboard';


interface Props {
    onSort?: (string) => void;
    // Used to automatically fill in the sort options
    entryLabels: Array<string>;
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
        return (
            <div>
                <span className='dib mr2 white-80'>Sort by:</span>
                <select className='bg-black white ba b--white-50 pa1' onChange={ev => this.handleSort(ev)}>
                    {
                        this.props.entryLabels.map((label, idx) => {
                            return (
                                <option value={idx}>{label}</option>
                            );
                        })
                    }
                </select>
            </div>
        );
    }
}

