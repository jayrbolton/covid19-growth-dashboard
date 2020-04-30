/*
 * Really simple way to show and hide child elements based on a boolean
 * expression.
 */
import { h, Component } from "preact";

interface Props {
  bool: boolean;
}

interface State {}

export class ShowIf extends Component<Props, State> {
  render() {
    if (!this.props.bool) {
      return "";
    }
    return this.props.children;
  }
}
