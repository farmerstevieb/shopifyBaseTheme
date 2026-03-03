import React, { createContext, useContext, useEffect, useState } from "react";

interface ButtonHeightContextType {
  maxButtonHeight: number;
  setMaxButtonHeight: (height: number) => void;
  hasMultiLinePrice: boolean;
  setHasMultiLinePrice: (hasMultiLine: boolean) => void;
}

const ButtonHeightContext = createContext<ButtonHeightContextType | undefined>(
  undefined,
);

export function ButtonHeightProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [maxButtonHeight, setMaxButtonHeight] = useState(0);
  const [hasMultiLinePrice, setHasMultiLinePrice] = useState(false);

  // Reset when component mounts
  useEffect(() => {
    setMaxButtonHeight(0);
    setHasMultiLinePrice(false);
  }, []);

  return (
    <ButtonHeightContext.Provider
      value={{
        maxButtonHeight,
        setMaxButtonHeight,
        hasMultiLinePrice,
        setHasMultiLinePrice,
      }}
    >
      {children}
    </ButtonHeightContext.Provider>
  );
}

export function useButtonHeight() {
  const context = useContext(ButtonHeightContext);
  if (context === undefined) {
    throw new Error(
      "useButtonHeight must be used within a ButtonHeightProvider",
    );
  }
  return context;
}
