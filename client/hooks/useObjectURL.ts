import { useCallback, useEffect, useRef } from "react";

export default function useObjectURL() {
  const url = useRef<string | null>(null);
  
  const create = useCallback((object: any) => {
    if(url.current) URL.revokeObjectURL(url.current);
    
    return url.current = URL.createObjectURL(object);
  }, []);
  
  useEffect(() => {
    return () => {
      if(url.current) URL.revokeObjectURL(url.current);
    };
  }, []);
  
  return create;
}
