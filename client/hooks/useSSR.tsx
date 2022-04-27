import React, { useEffect, useState } from "react";

// eslint-disable-next-line @typescript-eslint/naming-convention
export const SSRContext = React.createContext(true);

interface SSRProviderProps {
  children: React.ReactNode;
}

export function SSRProvider({ children }: SSRProviderProps) {
  const [ssr, setSSR] = useState(true);
  
  useEffect(() => {
    setSSR(false);
  }, []);
  
  return (
    <SSRContext.Provider value={ssr}>
      {children}
    </SSRContext.Provider>
  );
}

export default function useSSR() {
  const [ssr, setSSR] = useState(true);
  
  useEffect(() => setSSR(false), []);
  
  return ssr;
}
