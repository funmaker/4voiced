import { useEffect, useState } from "react";

export default function useRSS() {
  const [rss, setRSS] = useState(true);
  
  useEffect(() => setRSS(false), []);
  
  return rss;
}
