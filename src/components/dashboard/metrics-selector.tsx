import { h, Component, Fragment } from "preact";
import { hasParentId } from "../../utils/dom";

interface Props {
  defaultDisplayedStats: Map<number, boolean>;
  entryLabels: Array<string>;
  onSelect: (displayedStats: Map<number, boolean>) => void;
}

interface State {
  dropdownOpen: boolean;
  displayedStats: Map<number, boolean>;
}

export class MetricsSelector extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      displayedStats: this.props.defaultDisplayedStats,
      dropdownOpen: false,
    };
  }

  componentDidMount() {
    document.body.addEventListener("click", ({ target }) => {
      if (
        !this.state.dropdownOpen ||
        hasParentId(target, "metrics-selector-wrapper")
      ) {
        return;
      }
      this.setState({ dropdownOpen: false });
    });
  }

  handleClick() {
    this.setState({ dropdownOpen: !this.state.dropdownOpen });
  }

  handleChange(ev) {
    const idx = Number(ev.currentTarget.getAttribute("data-idx"));
    const checked = ev.currentTarget.checked;
    const selected = this.state.displayedStats;
    if (checked) {
      selected.set(idx, true);
    } else {
      selected.delete(idx);
    }
    this.setState({ displayedStats: selected });
    this.props.onSelect(selected);
  }

  renderOption(label, idx) {
    const id = label + "-select-display";
    const selected = this.state.displayedStats;
    return (
      <div className="white-80 mb1 flex items-center">
        <input
          className="mr1"
          type="checkbox"
          data-idx={idx}
          id={id}
          checked={selected.get(idx)}
          onChange={(ev) => this.handleChange(ev)}
        />
        <label htmlFor={id} className="pointer dim">
          {label}
        </label>
      </div>
    );
  }

  render() {
    return (
      <div id="metrics-selector-wrapper" class="mb3 pb3 bb b--white-20">
        <div class="b white-80 mb2">Displaying metrics:</div>
        <div>
          {this.props.entryLabels.map((label, idx) =>
            this.renderOption(label, idx)
          )}
        </div>
      </div>
    );
  }
}
