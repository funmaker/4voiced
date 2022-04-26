import { useEffect, useState } from "react";

export default function useSSR() {
  const [ssr, setSSR] = useState(true);
  
  useEffect(() => setSSR(false), []);
  
  return ssr;
}
