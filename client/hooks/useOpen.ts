import { useCallback, useEffect, useRef, useState } from "react";

interface UseOpenProps {
  defaultOpen?: boolean;
  open?: boolean;
  onOpen?: () => void;
  onClose?: () => void;
}

export default function useOpen({ defaultOpen, open: inOpen, onOpen: inOnOpen, onClose: inOnClose }: UseOpenProps = {}) {
  const [open, setOpen] = useState(defaultOpen || false);
  const mounted = useRef(false);
  
  const onOpen = useCallback(() => {
    if(!mounted.current) return;
    
    setOpen(true);
    if(inOnOpen) inOnOpen();
  }, [inOnOpen]);
  
  const onClose = useCallback(() => {
    if(!mounted.current) return;
    
    setOpen(false);
    if(inOnClose) inOnClose();
  }, [inOnClose]);
  
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);
  
  return {
    open: inOpen ?? open,
    onOpen,
    onClose,
  };
}
