import {h, Component, Fragment} from 'preact';
import {hasParentId} from '../../utils/dom';

interface Props {
    defaultDisplayedStats: Map<number, boolean>;
    entryLabels: Array<string>;
    onSelect: (selectedStats: Map<number, boolean>) => void;
}

interface State {
    dropdownOpen: boolean;
    selectedStats: Map<number, boolean>;
}

export class MetricsSelector extends Component<Props, State> {

    constructor(props: Props) {
        super(props);
        this.state = {
            selectedStats: this.props.defaultDisplayedStats,
            dropdownOpen: false
        };
    }

    componentDidMount() {
        document.body.addEventListener('click', ({target}) => {
            if (!this.state.dropdownOpen || hasParentId(target, 'metrics-selector-wrapper')) {
                return;
            }
            this.setState({dropdownOpen: false});
        });
    }

    handleClick() {
        this.setState({dropdownOpen: !this.state.dropdownOpen});
    }

    handleChange(ev) {
        const idx = Number(ev.currentTarget.getAttribute('data-idx'));
        const checked = ev.currentTarget.checked;
        const selected = this.state.selectedStats;
        if (checked) {
            selected.set(idx, true);
        } else {
            selected.delete(idx);
        }
        this.setState({selectedStats: selected});
        this.props.onSelect(selected);
    }

    renderOption(label, idx) {
        const id = label + '-select-display';
        const selected = this.state.selectedStats;
        return (
            <div className='white-80 mb1 flex items-center'>
                <input
                    className='mr1'
                    type='checkbox'
                    data-idx={idx}
                    id={id}
                    checked={selected.get(idx)}
                    onChange={ev => this.handleChange(ev)} />
                <label htmlFor={id} className='pointer dim'>
                    {label}
                </label>
            </div>
        );
    }

    render() {
        const width = '16rem';
        return (
            <div
                className='relative bg-dark-gray ma2 ba b--white-30'
                style={{width}}
                id='metrics-selector-wrapper'>
                <a
                    onClick={() => this.handleClick()}
                    style={{padding: '0.3rem 0.5rem 0.3rem 0.5rem'}}
                    className='pointer link dib flex justify-between'>
                    <div>Select metrics to display</div>
                    <div>{this.state.dropdownOpen ? '▴' : '▾'}</div>
                </a>
                <div
                    className='absolute w-100 pa2 bg-dark-gray z-2 bl br bb b--white-30'
                    style={{top: '100%', left: '-1px', display: this.state.dropdownOpen ? 'block' : 'none', width}}>
                    {this.props.entryLabels.map((label, idx) => this.renderOption(label, idx))}
                </div>
            </div>
        );
    }
}

