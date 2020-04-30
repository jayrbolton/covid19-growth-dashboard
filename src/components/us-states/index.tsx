import { h, Component, Fragment } from "preact";
import { fetchData } from "../../utils/covidtracking/fetch-data";
import { transformData } from "../../utils/covidtracking/transform-data";
import { Dashboard } from "../dashboard";
import { COVIDTRACKING_SOURCE } from "../../constants/data-sources";

interface Props {}

interface State {}

export class USStates extends Component<Props, State> {
  render() {
    return (
      <Fragment>
        <div className="mw8 ph2 ph2-m ph3-ns pt3">
          <h1 className="light-gray f4 f2-m f2-ns">
            COVID-19 USA Growth by State
          </h1>
          <p>
            Data is updated daily from{" "}
            <a
              className="light-blue"
              href={COVIDTRACKING_SOURCE.homeUrl}
              target="_blank"
            >
              The COVID Tracking Project
            </a>
            .
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
