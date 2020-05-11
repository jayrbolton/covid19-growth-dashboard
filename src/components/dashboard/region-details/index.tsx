import { h, Component } from "preact";
import { DashboardEntry } from "../../../types/dashboard";
import { updateURLQuery } from "../../../utils/url";
import { RegionStat } from './stat';
import { QuickView } from './quick-view';

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
      <div className='ph3 pb4 mt4'>
        <p>
          <a className='b light-blue pointer dim' onClick={() => this.handleClickReturn()}>
            Return to region list
          </a>
        </p>
        <h2 style={{fontSize: '2rem'}} className='mb3'>{this.props.entry.location}</h2>
        <QuickView entry={this.props.entry} />
        <div>
          {this.props.entry.stats.map(stat => (<RegionStat stat={stat} />))}
        </div>
      </div>
    );
  }
}
