import {h, Component, Fragment} from 'preact';

import {DashboardEntry} from '../../types/dashboard';


interface Props {
    onSort?: (number, string) => void;
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
        const el = ev.currentTarget;
        const [idxStr, prop] = el.value.split(':');
        const idx = Number(idxStr);
        if (this.props.onSort) {
            this.props.onSort(idx, prop);
        }
    }

    render() {
        const options = this.props.entryLabels.reduce((arr, label, idx) => {
            arr.push({
                name: label + ' (total)',
                statIdx: idx,
                prop: 'val'
            });
            arr.push({
                name: label + ' (change)',
                statIdx: idx,
                prop: 'percentGrowth'
            });
            return arr;
        }, []);
        const growthLabels = this.props.entryLabels.map((label) => label + ' growth');
        return (
            <div>
                <span className='dib mr2 white-80'>Sort by:</span>
                <select className='bg-black white ba b--white-50 pa1' onChange={ev => this.handleSort(ev)}>
                    {
                        options.map(({name, statIdx, prop}) => {
                            return (
                                <option value={statIdx + ':' + prop}>{name}</option>
                            );
                        })
                    }
                </select>
            </div>
        );
    }
}

