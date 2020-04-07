import {h, Component, Fragment} from 'preact';

import {DashboardEntry} from '../../types/dashboard';


interface Props {
    onSort?: (number, string) => void;
    // Used to automatically fill in the sort options
    entryLabels: Array<string>;
    selectedStats: Map<number, boolean>;
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
        const statIdxs = [];
        this.props.selectedStats.forEach((bool, idx) => {
            if (!bool) {
                return;
            }
            statIdxs.push(idx);
        });
        const options = statIdxs.reduce((arr, statIdx) => {
            const label = this.props.entryLabels[statIdx];
            arr.push({
                name: label + ' (total)',
                statIdx: statIdx,
                prop: 'val'
            });
            arr.push({
                name: label + ' (growth)',
                statIdx: statIdx,
                prop: 'percentGrowth'
            });
            return arr;
        }, []);
        if (!options.length) {
            return '';
        }
        return (
            <div className='ma2' style={{width: '20.65rem'}}>
                <span className='dib mr2 white-80'>Sort:</span>
                <select className='bg-black white ba b--white-50 pa1' onChange={ev => this.handleSort(ev)} style={{width: '18rem'}}>
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

