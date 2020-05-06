import { h, Component } from "preact";
import { DashboardEntry } from "../../../types/dashboard";
import { updateURLQuery } from "../../../utils/url";

interface Props {
  entry: DashboardEntry
}

interface State {
}

export class RegionDetails extends Component<Props, State> {
  handleClickReturn() {
    const query = updateURLQuery({ r: null });
    window._history.push({ search: query });
    console.log(query)
  }

  render() {
    return (
      <div className='ph3 mt4'>
        <p>
          <a className='lightest-blue pointer dim' onClick={() => this.handleClickReturn()}>
            Return to region list
          </a>
        </p>
        <h2>{this.props.entry.location}</h2>
      </div>
    );
  }
}
