import React, { useCallback, useRef, useState } from "react";
import styled from "@emotion/styled";
import { css, keyframes } from "@emotion/react";
import { transientOptions } from "../helpers/utils";
import useMeasure from "../hooks/useMeasure";
import useSFW from "../hooks/useSFW";
import { StyledHide } from "./Hide";

const MOBILE_WIDTH = 800;
const MIN_WIDTH = 350;
const MIN_HEIGHT = 600;
const FADE_TIME = 2000;

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { rect, ref } = useMeasure();
  const compact = rect ? rect.width < MOBILE_WIDTH : false;
  const scale = rect ? Math.min(rect.width / MIN_WIDTH, rect.height / MIN_HEIGHT, 1.0) * 100 : 100;
  const { sfw } = useSFW();
  const [autoHide, setAutoHide] = useState(false);
  const autoHideRef = useRef<NodeJS.Timeout | null>(null);
  
  const onMouseMove = useCallback(() => {
    if(autoHideRef.current) {
      clearTimeout(autoHideRef.current);
      autoHideRef.current = null;
    } else {
      setAutoHide(false);
    }
    
    autoHideRef.current = setTimeout(() => {
      autoHideRef.current = null;
      setAutoHide(true);
    }, FADE_TIME);
  }, []);
  
  return (
    <StyledLayout $compact={compact}
                  $autoHide={autoHide}
                  $sfw={sfw}
                  ref={ref}
                  onMouseMove={onMouseMove}
                  style={{ fontSize: scale < 100 ? `${scale}%` : undefined }}>
      <GodRays>
        <GodRay $speed={0.25} />
        <GodRay $speed={-0.3} />
        <GodRay $speed={0.4} />
      </GodRays>
      
      {children}
    </StyledLayout>
  );
}

const StyledLayout = styled("div", transientOptions)<{ $compact: boolean; $autoHide: boolean; $sfw: boolean }>`
  position: relative;
  display: flex;
  flex-direction: column;
  min-height: 100%;
  transition: color 1s ease, --board-background-1 1s ease, --board-background-2 1s ease, --board-background-3 1s ease;
  background: radial-gradient(circle, var(--board-background-1) 0%, var(--board-background-2) 25%, var(--board-background-3) 100%);
  color: #000;
  
  > header {
    position: sticky;
    top: 0;
  }
  
  > header + div {
    flex: 1 0 auto;
  }
  
  ${props => props.$sfw ? css`
    color: #000;
    --board-background-1: #eef2ff;
    --board-background-2: #d1d5ee;
    --board-background-3: #bbc1e8;
    --post-background: #d6daf0;
    --post-border: #b7c5d9;
    --quote-link: #d00;
  ` : css`
    color: maroon;
    --board-background-1: #ffffee;
    --board-background-2: #f1dac0;
    --board-background-3: #fed6af;
    --post-background: #f0e0d6;
    --post-border: #d9bfb7;
    --quote-link: navy;
  `}
  
  ${props => props.$autoHide && css`
    cursor: none !important;
    
    ${StyledHide}.auto > * {
      opacity: 0;
      pointer-events: none;
    }
  `}
`;

const GodRays = styled("div")`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  mask-image: radial-gradient(white 0%, #FFFFFF3F 30%, transparent 60%);
  pointer-events: none;
`;

const godRayAnim = keyframes`
  0%   { transform: translate(-50%, -50%) rotate(0deg); }
  100% { transform: translate(-50%, -50%) rotate(360deg); }
`;

const GodRay = styled("div", transientOptions)<{ $speed: number }>`
  position: absolute;
  top: 50%;
  left: 50%;
  width: 100vmax;
  height: 100vmax;
  transform: translate(-50%, -50%);
  opacity: 0.2;
  transition: --board-background-1 1s ease;
  
  background: repeating-conic-gradient(
    var(--board-background-1) 0% 1%,
    transparent 2% 4%,
    var(--board-background-1) 5% 7%,
    transparent 8% 9%,
    var(--board-background-1) 10% 11%,
    transparent 12% 15%,
    var(--board-background-1) 16% 18%,
    transparent 19% 22%,
    var(--board-background-1) 23% 25%
  );
  
  animation: ${godRayAnim}
             ${props => 60 / Math.abs(props.$speed)}s
             infinite
             ${props => props.$speed < 0 ? "reverse" : ""};
`;
