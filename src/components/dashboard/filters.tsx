import {h, Component, Fragment} from 'preact';
import {SearchInput} from '../generic/inputs';

interface Props {
    onFilterLocation?: (string) => void;
};

interface State {};

export class Filters extends Component<Props, State> {

    // Input debounce timeout
    timeout: number | null = null;

    constructor(props) {
        super(props);
        this.state = {};
    }

    // From an input event, call the callback at most every 200 milliseconds
    handleFilterLocation(ev) {
        const inp = ev.currentTarget.value.trim().toLowerCase();
        const callback = () => {
            if (this.props.onFilterLocation) {
                this.props.onFilterLocation(inp);
            }
        }
        if (this.timeout) {
          clearTimeout(this.timeout);
          this.timeout = null;
        }
        this.timeout = window.setTimeout(callback, 200);
    }

    render() {
        return (
            <div className='flex items-center'>
                <div>
                    <label className='dib mr2 white-80'>Search location:</label>
                    <SearchInput
                        type='text'
                        onInput={ev => this.handleFilterLocation(ev)}
                    />
                </div>
            </div>
        );
    }
}
