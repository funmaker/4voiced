import React from "react";
import useSSR from "../hooks/useSSR";

interface Props {
  children?: any;
}

export default function SSRCurtain({ children }: Props) {
  const rss = useSSR();
  
  if(rss) return null;
  else return children || null;
}
