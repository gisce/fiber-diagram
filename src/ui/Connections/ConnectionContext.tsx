import { Fiber } from "base/Fiber";
import React from "react";

export type ConnectionContextType = {
  fiber_in: Fiber | undefined;
  fiber_out: Fiber | undefined;
  setFiberIn: (fiber: Fiber | undefined) => void;
  setFiberOut: (fiber: Fiber | undefined) => void;
};

export const ConnectionContext =
  React.createContext<ConnectionContextType>(undefined);

type ConnectionContextProps = {
  children: React.ReactNode;
};

export const ConnectionContextProvider = (
  props: ConnectionContextProps
): any => {
  const { children } = props;
  const [fiber_in, setFiberIn] = React.useState<Fiber | undefined>(undefined);
  const [fiber_out, setFiberOut] = React.useState<Fiber | undefined>(undefined);

  return (
    <ConnectionContext.Provider
      value={{
        fiber_in,
        setFiberIn,
        fiber_out,
        setFiberOut,
      }}
    >
      {children}
    </ConnectionContext.Provider>
  );
};
