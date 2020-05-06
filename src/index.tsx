import "tachyons/css/tachyons.css";
import "./index.css";
import "./icons.css";
import "./styles/input-range.css";
import { h, render } from "preact";
import { App } from "./components/app";
import { History, createBrowserHistory } from "history";

declare global {
    interface Window {
      _history: History;
    }
}

// History object for managing page navigation via url params
window._history = createBrowserHistory();

render(<App />, document.body);
