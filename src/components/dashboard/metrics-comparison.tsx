import {h, Component, Fragment} from 'preact';
import {DashboardData} from '../../types/dashboard';
import Chart from 'chart.js';
import * as colors from '../../constants/graph-colors.json';

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
                responsive: false,
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
            const metrics = [];
            this.props.sourceData.entries.forEach(entry => {
                entry.stats.forEach(stat => {
                    if (stat.isComparing) {
                        metrics.push({location: entry.location, stat: stat});
                    }
                });
            });
            const maxMetricsLen = metrics.reduce((max, metric) => {
                const len = metric.stat.timeSeries.values.length;
                return len > max ? len : max;
            }, 0);
            const labels = [];
            for (let idx = 0; idx < maxMetricsLen; idx++) {
                const daysAgo = maxMetricsLen - idx;
                const date = new Date();
                date.setDate(date.getUTCDate() - daysAgo);
                labels.push(date.toLocaleDateString());
            }
            this.chart.data.labels = labels;
            const datasets = metrics.map((m, idx) => {
                const data = m.stat.timeSeries.values
                    .map((yVal, idx) => {
                        if (isNaN(yVal) || yVal === null || yVal === undefined) {
                            yVal = 0;
                        }
                        return yVal
                    });
                while (data.length < maxMetricsLen) {
                    data.unshift(0);
                }
                return {
                    label: m.location,
                    data,
                    borderColor: colors[idx],
                    backgroundColor: colors[idx],
                    fill: false
                }
            });
            this.chart.data.datasets = datasets;
            console.log(this.chart.data);
            this.chart.update();
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

