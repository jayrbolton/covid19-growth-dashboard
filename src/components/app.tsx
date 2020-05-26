/*
 * Root component for the whole app
 */
import { h, Component } from "preact";
import { queryToObj, updateURLQuery } from "../utils/url";

// Components
import { Nav, Page } from "./nav";
import { JHUWorldDashboard } from "./jhu-world-dashboard";
import { USStates } from "./us-states";
import { USCounties } from "./us-counties";
import { Timeline } from "./timeline";
import { AboutPage } from "./about-page";

// Load the current page from the url params with a default
let initialPage: Page = "us-states";
(function getInitialPage() {
  const query = queryToObj();
  if (query.p) {
    initialPage = query.p;
  }
})();

interface Props {}

interface State {
  currentPage: Page;
}

export class App extends Component<Props, State> {
  constructor(props) {
    super(props);
    this.state = {
      currentPage: initialPage,
    };
    // Listen for changes to the current location.
    window._history.listen(() => {
      const queryObj = queryToObj();
      const page = queryObj.p;
      if (page) {
        this.setState({ currentPage: page as Page });
      }
    });
  }

  // Clicking a top-level page nav changes url params and history
  handleClickNavItem(page: Page) {
    const query = updateURLQuery({ p: page, r: null });
    window._history.push({ search: query });
  }

  renderWorldData() {
    if (this.state.currentPage !== "world-data") {
      return "";
    }
    return <JHUWorldDashboard />;
  }

  renderUSStates() {
    if (this.state.currentPage !== "us-states") {
      return "";
    }
    return <USStates />;
  }

  renderUSCounties() {
    if (this.state.currentPage !== "us-counties") {
      return "";
    }
    return <USCounties />;
  }

  renderTimeline() {
    if (this.state.currentPage !== "timeline") {
      return "";
    }
    return <Timeline />;
  }

  renderAbout() {
    if (this.state.currentPage !== "about") {
      return "";
    }
    return <AboutPage />;
  }

  render() {
    return (
      <div className="sans-serif white" style={{ background: "#1d1d1d" }}>
        <Nav
          onClickNavItem={(pageName) => this.handleClickNavItem(pageName)}
          currentPage={this.state.currentPage}
        />
        {this.renderWorldData()}
        {this.renderUSStates()}
        {this.renderUSCounties()}
        {this.renderAbout()}
        {this.renderTimeline()}
      </div>
    );
  }
}
