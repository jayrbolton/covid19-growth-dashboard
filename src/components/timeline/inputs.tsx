/*
 * Some user controls for the animated timeline, found above the country rows.
 */
import { h, Component } from "preact";
import { constants } from "./constants";

interface Props {
  onInputDaysAgo: (number) => void;
  onChangeSort: (string) => void;
}
interface State {
  dateStr: string;
  daysAgo: number;
  atEnd: boolean;
  atStart: boolean;
  paused: boolean;
}

export class Inputs extends Component<Props, State> {
  // Interval timer for playing animation
  playingInterval: number | null = null;

  constructor(props: Props) {
    super(props);
    this.state = Object.assign(getDates(0), {
      loading: true,
      atEnd: true,
      atStart: false,
      paused: true,
    });
  }

  componentDidMount() {
    // Bind left and right arrows to move time
    document.addEventListener("keydown", (ev) => {
      if (
        ev.keyCode !== constants.leftArrowKey &&
        ev.keyCode !== constants.rightArrowKey
      ) {
        return;
      }
      if (ev.keyCode === constants.leftArrowKey) {
        this.handleJumpBack();
      }
      if (ev.keyCode === constants.rightArrowKey) {
        this.handleJumpForward();
      }
    });
  }

  setDaysAgo(daysAgo: number) {
    const update: any = getDates(daysAgo);
    update.atEnd = daysAgo === 0;
    update.atStart = daysAgo === constants.range;
    this.setState(update);
    this.props.onInputDaysAgo(daysAgo);
  }

  handleInputTime(ev) {
    const val = ev.currentTarget.value;
    const daysAgo = constants.range - val;
    this.setDaysAgo(daysAgo);
  }

  handleJumpStart() {
    const daysAgo = constants.range;
    this.setDaysAgo(daysAgo);
  }

  handleJumpBack() {
    if (this.state.daysAgo === constants.range) {
      return;
    }
    const daysAgo = this.state.daysAgo + 1;
    this.setDaysAgo(daysAgo);
  }

  handlePlay() {
    if (this.playingInterval) {
      return;
    }
    this.setState({ paused: false });
    this.playingInterval = setInterval((ts) => {
      if (this.state.atEnd) {
        this.handlePause();
        return;
      }
      this.handleJumpForward();
    }, 500);
  }

  handlePause() {
    if (!this.playingInterval) {
      return;
    }
    this.setState({ paused: true });
    clearInterval(this.playingInterval);
    this.playingInterval = null;
  }

  handleJumpForward() {
    if (this.state.daysAgo === 0) {
      return;
    }
    const daysAgo = this.state.daysAgo - 1;
    this.setDaysAgo(daysAgo);
  }

  handleJumpEnd() {
    const daysAgo = 0;
    this.setDaysAgo(daysAgo);
  }

  handleChangeSort(ev) {
    const val = ev.currentTarget.value;
    this.props.onChangeSort(val);
  }

  render() {
    const { atStart, atEnd, paused } = this.state;
    return (
      <div
        className="b"
        style={{ width: "48rem", marginLeft: constants.leftSpace + "rem" }}
      >
        <div className="flex items-center justify-between mb2">
          <label style={{ width: "10rem" }} className="db">
            Date: {this.state.dateStr}
          </label>
          <div className="flex justify-between">
            {renderControlBtn(
              "icon-to-start-alt",
              atStart,
              this.handleJumpStart.bind(this)
            )}
            {renderControlBtn(
              "icon-fast-bw",
              atStart,
              this.handleJumpBack.bind(this)
            )}
            {renderControlBtn(
              "icon-play",
              atEnd || !paused,
              this.handlePlay.bind(this)
            )}
            {renderControlBtn(
              "icon-pause",
              paused,
              this.handlePause.bind(this)
            )}
            {renderControlBtn(
              "icon-fast-fw",
              atEnd,
              this.handleJumpForward.bind(this)
            )}
            {renderControlBtn(
              "icon-to-end-alt",
              atEnd,
              this.handleJumpEnd.bind(this)
            )}
          </div>
          {renderSelectSort(this)}
        </div>
        <input
          className="db w-100"
          type="range"
          min="0"
          max={constants.range}
          onInput={(ev) => this.handleInputTime(ev)}
          value={constants.range - this.state.daysAgo}
        />
      </div>
    );
  }
}

// Calculate additional state fields from a `daysAgo` value
function getDates(daysAgo: number) {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return {
    daysAgo,
    timestamp: Number(date),
    dateStr: date.toLocaleDateString(),
  };
}

// Render a play/pause/etc time control button
function renderControlBtn(icon: string, disabled: boolean = false, onClick) {
  const style = {
    userSelect: "none",
  };
  const cls = "bt bb pv2 ph2 flex justify-center";
  if (disabled) {
    return (
      <a style={style} className={cls + " b--white-20 bg-near-black dark-gray"}>
        <i className={icon}></i>
      </a>
    );
  }
  return (
    <a
      style={style}
      onClick={onClick}
      className={cls + " b--blue bg-dark-gray white pointer grow dim"}
    >
      <i className={icon}></i>
    </a>
  );
}

// Dropdown to select what to sort
function renderSelectSort(cmpnt: Inputs) {
  const optionData = [
    ["Total cases", "confirmed"],
    ["Active cases", "active"],
    ["Recovered", "recovered"],
  ];
  const options = optionData.map(([label, val]) => {
    return <option value={val}>{label}</option>;
  });
  return (
    <div>
      <span className="dib mr2">Sort by:</span>
      <select
        className="bg-black white ba b--white-50 pa1 mw-100"
        onInput={cmpnt.handleChangeSort.bind(cmpnt)}
      >
        {options}
      </select>
    </div>
  );
}
