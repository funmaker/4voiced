import React, { useContext, useEffect, useMemo, useState } from "react";
import { SetState } from "../helpers/utils";

interface SFWCotextState {
  sfw: boolean;
  setSFW: SetState<boolean>;
}

export const SFWContext = React.createContext<SFWCotextState | null>(null);

interface SFWProviderProps {
  defaultSFW?: boolean;
  children: React.ReactNode;
}

export function SFWProvider({ children, defaultSFW = true }: SFWProviderProps) {
  const [sfw, setSFW] = useState(defaultSFW);
  const state = useMemo<SFWCotextState>(() => ({ sfw, setSFW }), [sfw, setSFW]);
  
  return (
    <SFWContext.Provider value={state}>
      {children}
    </SFWContext.Provider>
  );
}

export default function useSFW() {
  const context = useContext(SFWContext);
  if(!context) throw new Error("useSSR must be used within SFW context");
  return context;
}
