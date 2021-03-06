import { h, Component } from "preact";
import { SearchInput } from "../generic/inputs";

interface Props {
  onFilterLocation?: (string) => void;
}

interface State {}

const DEBOUNCE_MS = 200;

export class Filters extends Component<Props, State> {
  // Input debounce timeout
  timeout: number | null = null;

  constructor(props) {
    super(props);
    this.state = {};
  }

  // From an input event, call the callback at most every x milliseconds
  handleFilterLocation(inp: string) {
    const callback = () => {
      if (this.props.onFilterLocation) {
        this.props.onFilterLocation(inp);
      }
    };
    if (this.timeout) {
      clearTimeout(this.timeout);
      this.timeout = null;
    }
    this.timeout = window.setTimeout(callback, DEBOUNCE_MS);
  }

  render() {
    return (
      <div className="bb b--white-20 mb3 pv3">
        <div>
          <label className="db white-80 b mb2">Search by location:</label>
          <SearchInput onInput={(inp) => this.handleFilterLocation(inp)} />
        </div>
      </div>
    );
  }
}
