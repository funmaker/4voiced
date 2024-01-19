import React from "react";
import { styled } from "@mui/material";
import { transientOptions } from "../helpers/utils";
import useMeasure from "../hooks/useMeasure";

const MOBILE_WIDTH = 800;
const MIN_WIDTH = 350;
const MIN_HEIGHT = 600;

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { rect, ref } = useMeasure();
  const compact = rect ? rect.width < MOBILE_WIDTH : false;
  const scale = rect ? Math.min(rect.width / MIN_WIDTH, rect.height / MIN_HEIGHT, 1.0) * 100 : 100;
  
  return (
    <StyledLayout $compact={compact}
                  ref={ref}
                  style={{ fontSize: scale < 100 ? `${scale}%` : undefined }}>
      <header />
      {children}
    </StyledLayout>
  );
}

const StyledLayout = styled("div", transientOptions)<{ $compact: boolean }>`
  display: flex;
  flex-direction: column;
  min-height: 100%;
  
  ${props => props.$compact} {
    // TODO: mobile
  }
  
  > header {
    position: sticky;
    top: 0;
  }
  
  > header + div {
    flex: 1 0 auto;
  }
`;
