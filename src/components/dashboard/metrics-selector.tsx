import {h, Component, Fragment} from 'preact';

interface Props {
}

interface State {
}

export class MetricsSelector extends Component<Props, State> {

    render() {
        return (
            <div className='mr3'>
                <a className='pointer white-70 link dim b dib pa2 bg-dark-gray'>Select metrics to display ▾</a>
            </div>
        );
    }
}

