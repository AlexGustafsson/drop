import React, { createContext, HTMLAttributes, Provider, useContext, useState } from "react";

export interface SnackbarMessage {
  title?: string
  body?: string
  id?: number
  type: "default" | "error" | "warning"
}

// const Snackbar = (props: {}): JSX.Element => {
//   return <div className={"cursor-pointer transition-shadow bg-primary w-12 h-12 rounded-full text-white p-2 shadow-lg hover:shadow-xl select-none active:shadow-none "}>

//   </div>
// };

type SnackbarState = {
  snackbars: SnackbarMessage[],
  setSnackbars: React.Dispatch<React.SetStateAction<SnackbarMessage[]>>,
};

export type SnackbarsInterface = {
  snackbars: SnackbarMessage[],
  show(snackbar: SnackbarMessage): void,
  remove(id: number): void,
};

const SnackbarContext = createContext<SnackbarState>({snackbars: [], setSnackbars: () => {}});

export function useSnackbars(): SnackbarsInterface {
  const {snackbars, setSnackbars} = useContext(SnackbarContext);
  const show = (snackbar: SnackbarMessage) => {
    if (!snackbar.id)
      snackbar.id = Math.random();
    setSnackbars(currentSnackbars => [...currentSnackbars, snackbar]);
  };
  const remove = (id: number) => {
    setSnackbars(currentSnackbars => currentSnackbars.filter(x => x.id !== id));
  };
  return {snackbars, show, remove};
}

export const Snackbar = ({title, body, type, id}: SnackbarMessage): JSX.Element => {
  const snackbars = useSnackbars();
  const height = title ? "h-14" : "h-10";
  let background = "bg-primary";
  if (type === "error")
    background = "bg-red-400";
  else if (type === "warning")
    background = "bg-yellow-400";
  return <div className={`animate-move-in relative flex flex-col justify-center rounded-md w-96 text-sm p-3 mb-2 overflow-hidden pointer-events-auto ${height} ${background}`}>
    {title && <p className="text-white">{title}</p>}
    <p className="text-white text-opacity-80">{body}</p>
    <a className="absolute cursor-pointer right-3 text-white" onClick={() => snackbars.remove(id!)}>OK</a>
  </div>
};

export const SnackbarContainer = ({ children }: HTMLAttributes<Provider<SnackbarState>>): JSX.Element => {
  const [snackbars, setSnackbars] = useState<SnackbarMessage[]>([]);
  const snackbarElements = snackbars.map(({id, ...props}) => <Snackbar key={id} id={id} {...props}></Snackbar>);
  return <SnackbarContext.Provider value={{snackbars, setSnackbars}}>
    <div className="fixed flex justify-center inset-x-0 bottom-0 flex z-20 pointer-events-none">
      <div className="container flex flex-col items-center">
        {snackbarElements}
      </div>
    </div>
    {children}
  </SnackbarContext.Provider>
};
