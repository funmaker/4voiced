import React from "react";
import useSSR from "../hooks/useSSR";

interface EmailLinkProps extends React.ComponentProps<"a"> {
  address: string;
}

export default function EmailLink({ address, children, ...rest }: EmailLinkProps) {
  const rss = useSSR();
  if(rss) return null;
  
  const link = window.atob(address);
  if(!children) children = link;
  
  return <a target="_blank" rel="noopener noreferrer" href={`mailto://${link}`} {...rest}>{children}</a>;
}

