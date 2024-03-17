import React from "react";
import { css } from "@emotion/react";
import styled from "@emotion/styled";
import { classJoin, transientOptions } from "../helpers/utils";

interface HideProps {
  className?: string;
  children?: React.ReactNode;
  hide?: boolean | "auto";
}

export default function Hide({ className, children, hide = "auto" }: HideProps) {
  return (
    <StyledHide $hide={hide} className={classJoin(className, hide === "auto" ? "auto" : "")}>
      {children}
    </StyledHide>
  );
}


export const StyledHide = styled("div", transientOptions)<{ $hide: boolean | "auto" }>`
  display: contents;
  
  > * {
    transition: opacity 0.15s ease;
    
    ${props => props.$hide === true && css`opacity: 0; pointer-events: none;`}
    ${props => props.$hide === false && css`opacity: 1;`}
  }
`;
