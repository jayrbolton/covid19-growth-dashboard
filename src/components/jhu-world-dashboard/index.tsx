import { h, Component, Fragment } from "preact";
import { Dashboard } from "../dashboard";
import { DashboardData } from "../../types/dashboard";
import { fetchData } from "../../utils/jhu/fetch-data";
import { transformData } from "../../utils/jhu/transform-data";
import { JHU_SOURCE } from "../../constants/data-sources";

interface Props {}
interface State {}

export class JHUWorldDashboard extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {};
  }

  render() {
    return (
      <Fragment>
        <div className="mw8 ph3 pt3">
          <h1 className="light-gray f4 f2-m f2-ns">
            COVID-19 Worldwide Growth by Country
          </h1>
          <p>
            Data is updated daily from the{" "}
            <a href={JHU_SOURCE.homeUrl} target="_blank" className="light-blue">
              Johns Hopkins University CSSE COVID-19 Data Repository
            </a>
            .
          </p>
          <p className='b'>
            Note that JHU is no longer tracking recovery metrics for the US.
          </p>
        </div>
        <Dashboard fetchSourceData={fetchSourceData} />
      </Fragment>
    );
  }
}

function fetchSourceData() {
  return fetchData().then(transformData);
}
