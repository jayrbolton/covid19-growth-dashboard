// Time series bar chart
import './styles/chartist-overrides';
import {h, Component, Fragment} from 'preact';

interface Props {
    dates: Array<Array<number>>;
    totals: {
        confirmed: Array<number>,
        recoverd: Array<number>,
        deaths: Array<number>
    }
}

interface State {
}

// Purposes of these sections:
// - show current state
//   - show total cases, deaths, recovered
//   - compare the above values (bars)
// - show growth rate
//    - average new cases all time
//    - average new cases this week
//    - horizontal bar chart over time of total cases


export class TimeSeriesBars extends Component<Props, State> {

    constructor(props) {
        super(props);
        this.state = {
        }
    }

    render() {
        console.log(this.props);
        return (
            <Fragment>
                <div>
                </div>
            </Fragment>
        );
    }
}
