import { useCallback, useEffect, useRef, useState } from "react";

export default function useOpen() {
  const [open, setOpen] = useState(false);
  const mounted = useRef(false);
  
  const onOpen = useCallback(() => mounted.current && setOpen(true), []);
  const onClose = useCallback(() => mounted.current && setOpen(false), []);
  
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);
  
  return { open, onOpen, onClose };
}
