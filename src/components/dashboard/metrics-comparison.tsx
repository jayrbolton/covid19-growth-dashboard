import {h, Component, Fragment} from 'preact';
import {DashboardData} from '../../types/dashboard';
import Chart from 'chart.js';
import * as colors from '../../constants/graph-colors.json';
import {computeLineChartData} from '../../utils/compute-linechart';

interface Props {
    hidden: boolean;
    onClose: () => void;
    sourceData: DashboardData;
}

interface State {
}

export class MetricsComparison extends Component<Props, State> {

    chart: any = null;

    handleClickClose() {
        this.props.onClose();
    }

    componentDidMount() {
        Chart.defaults.global.defaultFontColor = 'white';
        Chart.defaults.global.defaultFontSize = 16;
        this.chart = new Chart('comparison-chart', {
            type: 'line',
            data: {
                datasets: [],
            },
            defaults: {
                global: {
                    defaultFontColor: 'white',
                }
            },
            options: {
                scales: {
                    yAxes: [{
                        gridLines: {
                            color: 'rgb(255,255,255,0.3)'
                        }
                    }],
                    xAxes: [{
                        gridLines: {
                            color: 'rgb(255,255,255,0.3)'
                        }
                    }]
                },
                responsive: false,
                elements: {
                    line: {
                        tension: 0, // disables bezier curves
                    }
                },
                animation: {
                    duration: 0 // general animation time
                },
                hover: {
                    animationDuration: 0 // duration of animations when hovering an item
                },
                responsiveAnimationDuration: 0 // animation duration after a resize
            }
        });
    }

    render() {
        if (this.chart) {
            computeLineChartData(this.props.sourceData, this.chart);
        }
        const height = window.outerHeight - 200;
        const width = window.outerWidth - 200;
        return (
            <div
                className='fixed w-100 h-100 z-2 bg-near-black pa4'
                style={{display: this.props.hidden ? 'none' : 'block', top: 0, left: 0}}>
                <a className='f4 b pointer dim' onClick={() => this.handleClickClose()}>
                    🠘 Close and return
                </a>
                <canvas id="comparison-chart" height={height} width={width}></canvas>
            </div>
        );
    }
}

