import { h, Component } from "preact";
import { ABOUT } from "../../constants/about";

interface Props {}
interface State {}

export class AboutPage extends Component<Props, State> {
  render() {
    return (
      <div className="mw7 ph4 pt4">
        <p>
          This website was created by{" "}
          {extLink(ABOUT.authorURL, ABOUT.authorName)} and maintained by
          volunteers.
        </p>

        <p>
          Additional feedback from{" "}
          {extLink(
            "https://de.linkedin.com/in/henrieke-baunack",
            "Henrieke Baunack"
          )}
          .
        </p>

        <p className="b">
          {extLink(
            ABOUT.contributorsURL,
            "View the code contributions for this project"
          )}
          .
        </p>

        <p>
          This website is open source (MIT-licensed), and its source code can be
          found {extLink(ABOUT.githubURL, "in its Github repository")}.
        </p>

        <p>
          If you see a bug, have feedback, or have a feature request, either:
          <ul>
            <li>
              Email {extLink("mailto:" + ABOUT.emailAddr, ABOUT.emailAddr)}
            </li>
            <li>
              Open an issue in{" "}
              {extLink(ABOUT.githubURL, "our Github repository")}
            </li>
          </ul>
        </p>

        <p>
          Acknowledgments:
          <ul>
            <li>
              {extLink(ABOUT.covidTracking.url, ABOUT.covidTracking.name)} for
              US state testing data
            </li>
            <li>
              {extLink(ABOUT.nyt.url, ABOUT.nyt.name)} for county-level US data
            </li>
            <li>{extLink(ABOUT.jhu.url, ABOUT.jhu.name)} for worldwide data</li>
            <li>{extLink(ABOUT.github.url, ABOUT.github.name)} for hosting</li>
          </ul>
        </p>
      </div>
    );
  }
}

// External link component
function extLink(href, text) {
  return (
    <a target="_blank" className="light-blue pointer" href={href}>
      {text}
    </a>
  );
}
