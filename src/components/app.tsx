import {h, Component} from 'preact';
import * as dataSources from '../constants/data-sources.json';
import { History, createBrowserHistory } from 'history';
import {queryToObj, updateURLQuery} from '../utils/url';

// Components
import {Nav, Page} from './nav';
import {JHUWorldDashboard} from './jhu-world-dashboard';
import {USStates} from './us-states';
import {USCounties} from './us-counties';
import {AboutPage} from './about-page';

const history = createBrowserHistory();

interface Props {
}

interface State {
    rows?: any;
    currentPage: Page;
}

export class App extends Component<Props, State> {

    constructor(props) {
        super(props);
        const defaultPage = 'us-states';
        this.state = {
            currentPage: defaultPage
        };
        history.push({search: '?p=' + defaultPage});
        // Listen for changes to the current location.
        history.listen(() => {
            const queryObj = queryToObj();
            const page = queryObj.p;
            if (page) {
                this.setState({currentPage: page as Page});
            }
        });
    }

    handleClickNavItem(page: Page) {
        const query = updateURLQuery({p: page});
        history.push({search: query});
    }

    worldDataPage() {
        if (this.state.currentPage !== 'world-data') {
            return '';
        }
        return (<JHUWorldDashboard />);
    }

    usStatesPage() {
        if (this.state.currentPage !== 'us-states') {
            return '';
        }
        return (<USStates />);
    }

    usCountiesPage() {
        if (this.state.currentPage !== 'us-counties') {
            return '';
        }
        return (<USCounties />);
    }

    aboutPage() {
        if (this.state.currentPage !== 'about') {
            return '';
        }
        return (<AboutPage />);
    }

    render() {
        return (
            <div className='bg-near-black sans-serif white'>
                <Nav onClickNavItem={pageName => this.handleClickNavItem(pageName)} currentPage={this.state.currentPage} />
                <div className='mw8 center pa2' style={{paddingTop: '4rem'}}>
                    {this.worldDataPage()}
                    {this.usStatesPage()}
                    {this.usCountiesPage()}
                    {this.aboutPage()}
                </div>
            </div>
        );
    }
}
