import {h, Component, Fragment} from 'preact';


interface Props {
    onSort?: (string) => void;
}

interface State {
}

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
                <span className='dib mr2 white-80'>Sorting by:</span>
                <select className='bg-black white ba b--white-50 pa1' onChange={ev => this.handleSort(ev)}>
                    <option value='confirmed'>Confirmed cases</option>
                    <option value='growth'>Recent growth rate</option>
                </select>
            </div>
        );
    }
}

