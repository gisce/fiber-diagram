import { Fiber } from "base/Fiber";
import React from "react";

export type FiberConnectionContextType = {
  fiber_in: Fiber | undefined;
  fiber_out: Fiber | undefined;
  setFiberIn: (fiber: Fiber | undefined) => void;
  setFiberOut: (fiber: Fiber | undefined) => void;
};

export const FiberConnectionContext =
  React.createContext<FiberConnectionContextType>(undefined);

type FiberConnectionContextProps = {
  children: React.ReactNode;
};

export const FiberConnectionContextProvider = (
  props: FiberConnectionContextProps
): any => {
  const { children } = props;
  const [fiber_in, setFiberIn] = React.useState<Fiber | undefined>(undefined);
  const [fiber_out, setFiberOut] = React.useState<Fiber | undefined>(undefined);

  return (
    <FiberConnectionContext.Provider
      value={{
        fiber_in,
        setFiberIn,
        fiber_out,
        setFiberOut,
      }}
    >
      {children}
    </FiberConnectionContext.Provider>
  );
};
