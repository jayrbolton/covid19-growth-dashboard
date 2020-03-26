import {h, Component, Fragment} from 'preact';
import {SearchInput} from '../generic/inputs';

interface Props {
    onFilterCountry?: (string) => void;
    onFilterProvince?: (string) => void;
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
    handleFilterCountry(ev) {
        const inp = ev.currentTarget.value.trim().toLowerCase();
        const callback = () => {
            if (this.props.onFilterCountry) {
                this.props.onFilterCountry(inp);
            }
        }
        if (this.timeout) {
          clearTimeout(this.timeout);
          this.timeout = null;
        }
        this.timeout = window.setTimeout(callback, 200);
    }

    // From an input event, call the callback at most every 200 milliseconds
    handleFilterProvince(ev) {
        const inp = ev.currentTarget.value.trim().toLowerCase();
        const callback = () => {
            if (this.props.onFilterProvince) {
                this.props.onFilterProvince(inp);
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
                <div className='mr3'>
                    <label className='dib mr2 white-80'>Country:</label>
                    <SearchInput
                        type='text'
                        onInput={ev => this.handleFilterCountry(ev)}
                    />
                </div>
                <div>
                    <label className='dib mr2 white-80'>Province/state:</label>
                    <SearchInput
                        type='text'
                        onInput={ev => this.handleFilterProvince(ev)}
                    />
                </div>
            </div>
        );
    }
}
