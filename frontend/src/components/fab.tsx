import React from "react";

import "./fab.css";

type FabProps = {
  onClick: React.MouseEventHandler<HTMLDivElement>,
};

export default class Fab extends React.Component<FabProps> {
  render() {
    return <div className="fab" onClick={this.props.onClick}>
      {this.props.children}
    </div>
  }
}
