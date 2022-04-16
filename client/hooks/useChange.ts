import { useEffect, useRef } from "react";

type Compare<T> = (a: T, b: T) => boolean;
type Callback<T> = (a: T, b: T) => void;
export const defaultCmp = <T>(a: T, b: T) => a === b;
export const arrayCmp = <T extends any[]>(a: T, b: T) => a.length === b.length && a.every((el, id) => a[id] === b[id]);

export default function useChange<T>(val: T, callback: Callback<T>, cmpFn: Compare<T> = defaultCmp) {
  const valRef = useRef(val);
  const callbackRef = useRef(callback);
  callbackRef.current = callback;
  
  useEffect(() => {
    if(!cmpFn(valRef.current, val)) {
      callbackRef.current(val, valRef.current);
      valRef.current = val;
    }
  }, [cmpFn, val]);
}
