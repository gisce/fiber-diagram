import { Fiber } from "base/Fiber";
import React from "react";

export type FiberConnectionContextType = {
  selectedFiber: Fiber | undefined;
  setSelectedFiber: (fiber: Fiber | undefined) => void;
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
  const [selectedFiber, setSelectedFiber] = React.useState<Fiber | undefined>(
    undefined
  );

  return (
    <FiberConnectionContext.Provider
      value={{
        selectedFiber,
        setSelectedFiber,
      }}
    >
      {children}
    </FiberConnectionContext.Provider>
  );
};
