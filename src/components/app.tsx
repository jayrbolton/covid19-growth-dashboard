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

let initialPage: Page = 'us-states';
(function getInitialPage() {
    const query = queryToObj();
    if (query.p) {
        initialPage = query.p;
    }
})();


interface Props {
}

interface State {
    rows?: any;
    currentPage: Page;
}

export class App extends Component<Props, State> {

    constructor(props) {
        super(props);
        const defaultPage = initialPage;
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
        return (<JHUWorldDashboard hide={this.state.currentPage !== 'world-data'} />);
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
            <div className='sans-serif white' style={{background: '#1d1d1d'}}>
                <Nav onClickNavItem={pageName => this.handleClickNavItem(pageName)} currentPage={this.state.currentPage} />
                <div className='pt2'>
                    {this.worldDataPage()}
                    {this.usStatesPage()}
                    {this.usCountiesPage()}
                    {this.aboutPage()}
                </div>
            </div>
        );
    }
}
