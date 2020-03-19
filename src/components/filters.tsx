import {h, Component, Fragment} from 'preact';
import {SearchInput} from './generic/inputs';


interface Props {
    onFilter: (string) => void;
}

interface State {
}


export class Filters extends Component<Props, State> {

    // Input debounce timeout
    timeout: number | null = null;

    constructor(props) {
        super(props);
        this.state = {};
    }

    // From an input event, call the callback at most every 200 milliseconds
    handleFilter(ev) {
        const inp = ev.currentTarget.value.trim().toLowerCase();
        const callback = () => {
            if (this.props.onFilter) {
                this.props.onFilter(inp);
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
            <Fragment>
                <SearchInput
                    labelText='Filter by region'
                    type='text'
                    placeholder='Filter by region'
                    onInput={ev => this.handleFilter(ev)}
                />
            </Fragment>
        );
    }
}
