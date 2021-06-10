import React from "react";

import "./modal.css";

type ModalProps = {
  onClick?: React.MouseEventHandler<HTMLDivElement>
};

export default class Modal extends React.Component<ModalProps> {
  constructor(props: ModalProps) {
    super(props);

    this.handleClick = this.handleClick.bind(this);
  }

  // Make sure only clicks on the container itself are valid
  handleClick(event: React.MouseEvent<HTMLDivElement>) {
    if (event.target !== event.currentTarget)
      return;

    if (this.props.onClick)
      this.props.onClick(event);
  }

  render() {
    return <div className = "modal" onClick = { this.handleClick }>
    { this.props.children }
    </div >
  }
}
