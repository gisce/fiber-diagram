import { Fiber } from "base/Fiber";
import React from "react";

export type FiberConnectionContextType = {
  fiber_in: number | undefined;
  fiber_out: number | undefined;
  setFiberIn: (fiber: number | undefined) => void;
  setFiberOut: (fiber: number | undefined) => void;
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
  const [fiber_in, setFiberIn] = React.useState<number | undefined>(undefined);
  const [fiber_out, setFiberOut] = React.useState<number | undefined>(
    undefined
  );

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
