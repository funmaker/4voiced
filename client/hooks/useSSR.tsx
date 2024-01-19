import React, { useContext, useEffect, useState } from "react";

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
  return useContext(SSRContext);
}
