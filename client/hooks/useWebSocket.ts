import { useEffect, useState } from "react";
import { IndexPost } from "../../types/4chan";
import useRefCache from "./useRefCache";

export interface UsePostsOptions<T> {
  url?: string;
  active?: boolean;
  onMessage?: (post: T) => void;
}

export enum PostsStatus {
  CLOSED = "closed",
  CLOSING = "closing",
  CONNECTING = "connecting",
  OPEN = "open",
  RECONNECTING = "reconnecting",
}

export default function useWebSocket<T>({ url, active, onMessage }: UsePostsOptions<T>) {
  const [status, setStatus] = useState(PostsStatus.CLOSED);
  const onMessageRef = useRefCache(onMessage);
  
  useEffect(() => {
    if(!active || !url) {
      setStatus(PostsStatus.CLOSED);
      return;
    }
    
    let ws: WebSocket | null = null;
    let reconnectTimeout: NodeJS.Timeout | null = null;
    let exit = false;
    
    function reconnect() {
      const urlBase = `${location.protocol === "https:" ? "wss:" : "ws:"}//${location.host}`;
      
      ws = new WebSocket(urlBase + url!);
      
      ws.addEventListener("open", updateStatus);
      
      ws.addEventListener("close", () => {
        ws = null;
        if(exit) return;
        
        reconnectTimeout = setTimeout(() => {
          reconnectTimeout = null;
          reconnect();
        }, 5000);
        
        updateStatus();
      });
      
      ws.addEventListener("error", () => {
        console.error("WebSocket Error!");
        updateStatus();
      });
      
      ws.addEventListener("message", event => {
        if(exit) return;
        
        if(onMessageRef.current) onMessageRef.current(JSON.parse(event.data));
      });
      
      updateStatus();
    }
    
    function updateStatus() {
      if(reconnectTimeout !== null) {
        setStatus(PostsStatus.RECONNECTING);
      } else if(ws) {
        switch(ws.readyState) {
          case WebSocket.CONNECTING: setStatus(PostsStatus.CONNECTING); break;
          case WebSocket.OPEN: setStatus(PostsStatus.OPEN); break;
          case WebSocket.CLOSING: setStatus(PostsStatus.CLOSING); break;
          case WebSocket.CLOSED: setStatus(PostsStatus.CLOSED); break;
          default: setStatus(PostsStatus.CLOSED); break;
        }
      } else {
        setStatus(PostsStatus.CLOSED);
      }
    }
    
    reconnect();
    
    return () => {
      exit = true;
      if(reconnectTimeout !== null) {
        clearTimeout(reconnectTimeout);
        reconnectTimeout = null;
      }
      if(ws) ws.close();
      
      updateStatus();
    };
  }, [url, active, onMessageRef]);
  
  return { status };
}
