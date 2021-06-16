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
    return <div {...rest} className={"modal " + className} onClick = { this.handleClick }>
    { children }
    </div >
  }
}

// position: fixed;
// top: 0;
// left: 0;
// width: 100 %;
// height: 100 %;
// background - color: rgba(0, 0, 0, 0.3);
// z - index: 1000;
// backdrop - filter: blur(2px);
// display: flex;
// flex - direction: column;
// align - items: center;
// justify - content: center;
