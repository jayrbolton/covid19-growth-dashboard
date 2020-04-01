import {h, Component, Fragment} from 'preact';
import {ShowIf} from './show-if';

interface SearchProps {
    onInput: (string) => void;
    labelText: string;
};
interface SearchState {
    hasInput: boolean;
    val: string;
};

export class SearchInput extends Component<SearchProps, SearchState> {
    constructor(props: SearchProps) {
        super(props);
        this.state = {hasInput: false, val: ''};
    }

    handleInput(ev) {
        const val = ev.currentTarget.value.toLowerCase();
        this.props.onInput(val);
        this.setState({hasInput: Boolean(val), val});
    }

    handleClear() {
        this.setState({val: '', hasInput: false});
        this.props.onInput('');
    }

    render() {
        return (
            <Fragment>
            <input
                className='bg-black input-reset outline-0 white ph2 pv1 w4 ba b--white-50'
                type='text'
                value={this.state.val}
                placeholder={this.props.labelText}
                onInput={ev => this.handleInput(ev)}
            />
            <ShowIf bool={this.state.hasInput}>
                <a className='dib ml2 light-blue pointer' onClick={() => this.handleClear()}>
                    Clear
                </a>
            </ShowIf>
            </Fragment>
        );
    }
}
