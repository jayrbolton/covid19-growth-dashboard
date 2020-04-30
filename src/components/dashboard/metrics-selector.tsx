/*
 * Sidebar component for selecting which region stats/metrics to display.
 */
import { h, Component } from "preact";
import { hasParentId } from "../../utils/dom";

interface Props {
  defaultDisplayedStats: Map<number, boolean>;
  entryLabels: Array<string>;
  onSelect: (displayedStats: Map<number, boolean>) => void;
}

interface State {
  displayedStats: Map<number, boolean>;
}

export class MetricsSelector extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      displayedStats: this.props.defaultDisplayedStats,
    };
  }

  // User checks or unchecks a metric to show/hide
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

  render() {
    return (
      <div class="mb3 pb3 bb b--white-20">
        <div class="b white-80 mb2">Displaying metrics:</div>
        <div>
          {this.props.entryLabels.map((label, idx) =>
            renderOption(this, label, idx)
          )}
        </div>
      </div>
    );
  }
}

function renderOption(metricsSelector, label, idx) {
  const id = label + "-select-display";
  const selected = metricsSelector.state.displayedStats;
  return (
    <div className="white-80 mb1 flex items-center">
      <input
        className="mr1"
        type="checkbox"
        data-idx={idx}
        id={id}
        checked={selected.get(idx)}
        onChange={(ev) => metricsSelector.handleChange(ev)}
      />
      <label htmlFor={id} className="pointer dim">
        {label}
      </label>
    </div>
  );
}
