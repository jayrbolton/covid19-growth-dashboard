import {h, Component, Fragment} from 'preact';
import {hasParentId} from '../../utils/dom';

interface Props {
    defaultDisplayedStats: Array<number>;
    entryLabels: Array<string>;
}

interface State {
    dropdownOpen: boolean;
    selectedStats: Array<number>;
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

    renderOption(label, idx) {
        const id = label + '-select-display';
        const selected = this.state.selectedStats;
        return (
            <div className='white-80 mb1'>
                <input type='checkbox' id={id} checked={selected.indexOf(idx) !== -1} />
                <label htmlFor={id} className='pointer dim'>
                    {label}
                </label>
            </div>
        );
    }

    render() {
        console.log(this.props, this.state);
        return (
            <div className='mr3 relative bg-dark-gray' style={{width: '15rem'}} id='metrics-selector-wrapper'>
                <a
                    onClick={() => this.handleClick()}
                    className='pointer white-80 link dim b dib pa2 flex justify-between'>
                    <div>Select metrics to display</div>
                    <div>▾</div>
                </a>
                <div className='absolute w-100 pa2 bg-dark-gray' style={{display: this.state.dropdownOpen ? 'block' : 'none'}}>
                    {this.props.entryLabels.map((label, idx) => this.renderOption(label, idx))}
                </div>
            </div>
        );
    }
}

