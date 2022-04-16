import React from "react";
import { classJoin } from "../helpers/utils";
import useMeasure from "../hooks/useMeasure";
import "./Layout.scss";

const MOBILE_WIDTH = 800;
const MIN_WIDTH = 350;
const MIN_HEIGHT = 600;

interface LayoutProps {
  children: React.ReactNode;
}

// eslint-disable-next-line @typescript-eslint/naming-convention
export default function Layout({ children }: LayoutProps) {
  const { rect, ref } = useMeasure();
  const compact = rect ? rect.width < MOBILE_WIDTH : false;
  const scale = rect ? Math.min(rect.width / MIN_WIDTH, rect.height / MIN_HEIGHT, 1.0) * 100 : 100;
  
  return (
    <div className={classJoin("Layout", compact && "compact")}
         ref={ref}
         style={{ fontSize: scale < 100 ? `${scale}%` : undefined }}>
      {children}
    </div>
  );
}
