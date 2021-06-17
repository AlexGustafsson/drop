import React from "react";

type FabProps = {
  onClick: React.MouseEventHandler<HTMLDivElement>,
} & React.HTMLAttributes<HTMLDivElement>;

const Fab = (props: FabProps): JSX.Element => {
  const { onClick, className, children, ...rest } = props;
  return <div {...rest} className={"cursor-pointer transition-shadow bg-primary w-12 h-12 rounded-full text-white p-2 shadow-lg hover:shadow-xl select-none active:shadow-none " + className} onClick={onClick}>
    {children}
  </div>
};
export default Fab;
