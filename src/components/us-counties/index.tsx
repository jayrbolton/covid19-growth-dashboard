import { h, Component, Fragment } from "preact";
import { fetchData } from "../../utils/nyt/fetch-data";
import { transformData } from "../../utils/nyt/transform-data";
import { Dashboard } from "../dashboard";
import { NYT_SOURCE } from "../../constants/data-sources";

interface Props {}

interface State {}

export class USCounties extends Component<Props, State> {
  render() {
    return (
      <Fragment>
        <div className="mw8 ph3 pt3">
          <h1 className="light-gray f4 f2-m f2-ns">
            COVID-19 USA Growth by County
          </h1>
          <p>
            Data is updated daily from{" "}
            <a className="light-blue" href={NYT_SOURCE.homeUrl} target="_blank">
              The New York Times COVID-19 data repository
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
