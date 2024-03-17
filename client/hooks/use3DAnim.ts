import { useEffect, useRef } from "react";
import useRefCache from "./useRefCache";

export type Position = [number, number, number, number, number, number];

export interface Use3DAnimOptions {
  from: Position;
  to: Position;
  time: number;
  transition?: string;
  onEnd?: () => void;
}

export default function use3DAnim<T extends HTMLElement>({ from, to, time, transition, onEnd }: Use3DAnimOptions) {
  const ref = useRef<T | null>(null);
  const onEndRef = useRefCache(onEnd);
  
  useEffect(() => {
    const element = ref.current;
    if(!element) return;
    
    let transitionTimeout: NodeJS.Timeout | null = null;
    
    (async () => {
      element.style.transition = "";
      element.style.transform = toTransform(from);
      element.style.opacity = "0";
      
      await new Promise(res => transitionTimeout = setTimeout(res, 200));
      
      element.style.transition = `${transition ? `${transition}, ` : ""}transform ${time}s linear, opacity ${time / 4}s ease`;
      element.style.transform = toTransform(to);
      element.style.opacity = "1";
      
      transitionTimeout = setTimeout(() => {
        if(onEndRef.current) onEndRef.current();
      }, time * 1000);
    })().catch(console.error);
    
    return () => {
      if(transitionTimeout !== null) clearTimeout(transitionTimeout);
    };
  }, [from, to, time, onEndRef]);
  
  return ref;
}

const toTransform = (position: Position) => `
  translate(-50%, -50%)
  translate3D(${position[0]}em, ${position[1]}em, ${position[2]}em)
  rotateZ(${position[5]}rad)
  rotateY(${position[4]}rad)
  rotateX(${position[3]}rad)
`;
