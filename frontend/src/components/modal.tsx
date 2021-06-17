import React from "react";

type ModalProps = {
  onClick?: React.MouseEventHandler<HTMLDivElement>
} & React.HTMLAttributes<HTMLDivElement>;

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
    const {className, onClick, children, ...rest} = this.props;
    return <div {...rest} className={"modal " + className} onClick={ this.handleClick }>
    { children }
    </div >
  }
}
