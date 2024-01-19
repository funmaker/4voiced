import { useCallback, useEffect, useState } from "react";

interface Change {
  (value: null): null;
  (value: Blob): string;
  (value: Blob | null): string | null;
}

export default function useObjectURL() {
  const [url, setUrl] = useState<string | null>(null);
  
  const change = useCallback((object: Blob | null) => {
    let url: string | null;
    if(object === null) url = null;
    else url = URL.createObjectURL(object);
    
    setUrl(url);
    return url;
  }, []) as Change;
  
  useEffect(() => {
    return () => {
      if(url) URL.revokeObjectURL(url);
    };
  }, [url]);
  
  return [url, change] as const;
}
