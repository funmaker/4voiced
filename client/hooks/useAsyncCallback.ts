import { DependencyList, useCallback, useState } from "react";

export default function useAsyncCallback<T extends(...args: any[]) => Promise<any>>(callback: T, deps: DependencyList) {
  const [loading, setLoading] = useState(false);
  
  const wrapped = useCallback(async (...args: any[]) => {
    try {
      setLoading(true);
      
      return await callback(...args);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deps]) as T;
  
  return [wrapped, loading] as const;
}
