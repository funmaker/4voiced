import { useRef } from "react";

export default function useRefCache<F>(value: F) {
  const cacheRef = useRef({
    current: value,
    previous: value,
  });
  cacheRef.current.previous = cacheRef.current.current;
  cacheRef.current.current = value;
  return cacheRef.current;
}
