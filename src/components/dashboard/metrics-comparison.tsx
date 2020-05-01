/*
 * Line graph where multiple metrics from different regions can be plotted
 * using the same y-axis scale.
 */
import { h, Component } from "preact";
import { DashboardData } from "../../types/dashboard";
import Chart from "chart.js";
import { computeLineChartData } from "../../utils/compute-linechart";
import { CHART_DEFAULTS } from "../../constants/ui-settings";

interface Props {
  hidden: boolean;
  onClose: () => void;
  data: DashboardData;
}

interface State {}

export class MetricsComparison extends Component<Props, State> {
  chart: any = null;

  componentDidMount() {
    Chart.defaults.global.defaultFontColor = "white";
    Chart.defaults.global.defaultFontSize = 16;
    this.chart = new Chart("comparison-chart", CHART_DEFAULTS);
  }

  handleClickClose() {
    this.props.onClose();
  }

  handleClickWrapper(ev) {
    if (ev.target.id !== "metrics-comparison-wrapper") {
      return;
    }
    this.handleClickClose();
  }

  render() {
    if (this.chart) {
      computeLineChartData(this.props.data, this.chart);
    }
    const height = window.outerHeight - 200;
    const width = window.outerWidth - 200;
    return (
      <div
        className="fixed w-100 h-100 z-2 bg-black-80 pa4"
        id="metrics-comparison-wrapper"
        onClick={(ev) => this.handleClickWrapper(ev)}
        style={{
          display: this.props.hidden ? "none" : "block",
          top: 0,
          left: 0,
        }}
      >
        <div className="mb3">
          <a
            className="f4 b pointer dim white"
            onClick={() => this.handleClickClose()}
          >
            Close and return
          </a>
        </div>
        <div className="flex justify-center items-center bg-near-black pa2 ba b--white-40">
          <canvas id="comparison-chart" height={height} width={width}></canvas>
        </div>
      </div>
    );
  }
}
