import React, { createContext, HTMLAttributes, Provider, useContext, useState } from "react";

export interface SnackbarMessage {
  title?: string
  body?: string
  id?: number
  type?: "default" | "error" | "warning"
  removed?: (snackbar: UpdatableSnackbarMessage) => void
}

interface UpdatableSnackbarMessage {
  title: string
  body: string
  id: number
  type: string
  removed: (snackbar: UpdatableSnackbarMessage) => void
  remove(): void,
}

type SnackbarState = {
  snackbars: UpdatableSnackbarMessage[],
  setSnackbars: React.Dispatch<React.SetStateAction<UpdatableSnackbarMessage[]>>,
};

export type SnackbarsInterface = {
  snackbars: UpdatableSnackbarMessage[],
  show(snackbar: SnackbarMessage): UpdatableSnackbarMessage,
  remove(snackar: UpdatableSnackbarMessage): void,
};

const SnackbarContext = createContext<SnackbarState>({snackbars: [], setSnackbars: () => {}});

export function useSnackbars(): SnackbarsInterface {
  const {snackbars, setSnackbars} = useContext(SnackbarContext);
  const remove = (snackbar: UpdatableSnackbarMessage) => {
    setSnackbars(currentSnackbars => currentSnackbars.filter(x => x.id !== snackbar.id));
    if (snackbar.removed)
      snackbar.removed(snackbar);
  };
  const show = (snackbar: SnackbarMessage) => {
    const message: UpdatableSnackbarMessage = {
      title: snackbar.title || "",
      body: snackbar.body || "",
      id: typeof (snackbar.id) === "undefined" ? Math.random() : snackbar.id,
      type: snackbar.type || "default",
      removed: snackbar.removed || (() => {}),
      remove: () => {},
    }
    message.remove = () => remove(message);

    setSnackbars(currentSnackbars => [...currentSnackbars, message]);
    return message;
  }
  return {snackbars, show, remove};
}

type SnackbarProps = {
  snackbar: UpdatableSnackbarMessage
}

export const Snackbar = ({snackbar}: SnackbarProps): JSX.Element => {
  const snackbars = useSnackbars();
  const height = snackbar.title ? "h-14" : "h-10";
  let background = "bg-primary";
  if (snackbar.type === "error")
    background = "bg-red-400";
  else if (snackbar.type === "warning")
    background = "bg-yellow-400";
  return <div className={`animate-move-in relative flex flex-col justify-center rounded-md w-96 text-sm p-3 mb-2 overflow-hidden pointer-events-auto ${height} ${background}`}>
    {snackbar.title && <p className="text-white">{snackbar.title}</p>}
    <p className="text-white text-opacity-80">{snackbar.body}</p>
    <a className="absolute cursor-pointer right-3 text-white" onClick={() => snackbars.remove(snackbar)}>OK</a>
  </div>
};

export const SnackbarContainer = ({ children }: HTMLAttributes<Provider<SnackbarState>>): JSX.Element => {
  const [snackbars, setSnackbars] = useState<UpdatableSnackbarMessage[]>([]);
  const snackbarElements = snackbars.map(snackbar => <Snackbar key={snackbar.id} snackbar={snackbar}></Snackbar>);
  return <SnackbarContext.Provider value={{snackbars, setSnackbars}}>
    <div className="fixed flex justify-center inset-x-0 bottom-0 flex z-20 pointer-events-none">
      <div className="container flex flex-col items-center">
        {snackbarElements}
      </div>
    </div>
    {children}
  </SnackbarContext.Provider>
};
