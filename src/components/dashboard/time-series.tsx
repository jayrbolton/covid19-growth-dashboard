// Time series bar chart
import {h, Component, Fragment} from 'preact';
import {formatUTCDate, formatNumber} from '../../utils/formatting';
import {TimeSeriesData} from '../../types/dashboard';

interface Props {
    data: TimeSeriesData;
}

interface State {
}

// Purposes of these sections:
// - show current state
//   - show total cases, deaths
//   - compare the above values (bars)
// - show growth rate
//    - average new cases all time
//    - average new cases this week
//    - horizontal bar chart over time of total cases


export class TimeSeriesBars extends Component<Props, State> {

    constructor(props) {
        super(props);
        this.state = {}
    }

    vertBar(percentages, idx, colors, labels) {
        return (
            <div
                class='flex flex-column flex-column-reverse justify-start h-100'
                style={{width: '1.5%', margin: '0px 0.25%'}}>
                {
                    percentages.map((perc, idx) => {
                        const bg = colors[idx];
                        const label = labels[idx];
                        return (
                            <div
                                title={label + ': ' + perc + '%'}
                                style={{height: perc + '%', background: bg}}
                            >
                            </div>
                        );
                    })
                }
            </div>
        );
    }

    yAxisLabels(labels, colors) {
        return labels.map((label, idx) => {
            const color = colors[idx];
            return (
                <Fragment>
                    <span style={{color: color}} className='b'>{label}</span>
                    {idx === (labels.length - 1) ? ' ' : ', '}
                </Fragment>
            );
        });
    }

    render() {
        const {percentages, colors, labels} = this.props.data;
        const start = new Date(this.props.data.xMin).toLocaleDateString();
        const end = new Date(this.props.data.xMax).toLocaleDateString();
        return (
            <div className='w-100'>

                <div className='flex w-100 items-end bg-dark-gray' style={{height: '100px'}}>
                    {percentages.map((perc, idx) => this.vertBar(perc, idx, colors, labels))}
                </div>

                <div className='white-90 f6 mt2'>
                    {this.yAxisLabels(this.props.data.labels, this.props.data.colors)}{' '}
                    from <b>{formatNumber(this.props.data.yMin)}</b> on <b>{start}</b>{' '}
                    up to <b>{formatNumber(this.props.data.yMax)}</b> on <b>{end}</b>
                </div>
            </div>
        );
    }
}
