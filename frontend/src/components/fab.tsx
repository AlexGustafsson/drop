import React from "react";

import "./fab.css";

type FabProps = {
  onClick: React.MouseEventHandler<HTMLDivElement>,
} & React.HTMLAttributes<HTMLDivElement>;

export default class Fab extends React.Component<FabProps> {
  render() {
    const {onClick, className, children, ...rest} = this.props;
    return <div {...rest} className={"fab " + className} onClick={onClick}>
      {children}
    </div>
  }
}
