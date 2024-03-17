import { WebSocket } from "ws";
import { BoardsStats } from "../../types/api";
import { IndexPost } from "../../types/4chan";
import * as boardsController from "./boards";

interface Listener {
  ws: WebSocket;
  board: string | null;
  thread: number | null;
  status: boolean;
  counterKey: string;
  send: (data: any) => Promise<void>;
}

const listeners = new Set<Listener>();

export const listenerCounts: Record<string, number | undefined> = {};

export function deleteListener(listener: Listener) {
  if(listeners.has(listener)) {
    listeners.delete(listener);
    if(listener.counterKey in listenerCounts) listenerCounts[listener.counterKey]!--;
    broadcastStatus(true);
  }
  
  listener.ws.close();
}

export async function addListener(ws: WebSocket, board: string | null = null, thread: number | null = null, status = false) {
  let counterKey: string;
  if(status) counterKey = "status";
  else if(!board) counterKey = "all";
  else counterKey = board;
  
  const listener = {
    ws, board, thread, status, counterKey,
    send: async (data: any) => {
      try {
        await new Promise<void>((res, rej) => listener.ws.send(JSON.stringify(data), err => err ? rej(err) : res()));
      } catch(err) {
        console.error("Error while sending message:");
        console.error(err);
        deleteListener(listener);
      }
    },
  };
  
  ws.addEventListener("close", () => deleteListener(listener));
  
  listeners.add(listener);
  listenerCounts[counterKey] = (listenerCounts[counterKey] || 0) + 1;
  broadcastStatus(true);
  
  if(status) {
    await listener.send(getStatus());
  } else {
    boardsController.startFetching().catch(console.error);
  }
}

export function listenerCount(board?: string) {
  let count = listenerCounts.all || 0;
  if(board) count += listenerCounts[board] || 0;
  return count;
}

export function dispatchPost(post: IndexPost, board: string, delay: number) {
  (async () => {
    if(delay > 0) await new Promise(res => setTimeout(res, delay));
    
    await Promise.all(
      [...listeners]
        .filter(listener => (!listener.status
                             && (!listener.board || board === listener.board)
                             && (!listener.thread || (post.resto || post.no) === listener.thread)))
        .map(listener => listener.send(post)),
    );
  })().catch(console.error);
}

const UPDATE_STATUS_TIMEOUT = 1000;
let lastStatusUpdate: number | null = null;
let statusUpdateTimeout: NodeJS.Timeout | null = null;

export function broadcastStatus(debounce = false) {
  (async () => {
    if(debounce && lastStatusUpdate !== null && Date.now() - lastStatusUpdate < UPDATE_STATUS_TIMEOUT) {
      if(statusUpdateTimeout) return;
      await new Promise(res => statusUpdateTimeout = setTimeout(res, UPDATE_STATUS_TIMEOUT - (Date.now() - lastStatusUpdate!)));
      statusUpdateTimeout = null;
    }
    
    if(statusUpdateTimeout !== null) {
      clearTimeout(statusUpdateTimeout);
      statusUpdateTimeout = null;
    }
    
    lastStatusUpdate = Date.now();
    const status = getStatus();
    
    await Promise.all(
      [...listeners]
        .filter(listener => listener.status)
        .map(listener => listener.send(status)),
    );
  })().catch(console.error);
}

function getStatus(): BoardsStats {
  return {
    statusListeners: listenerCounts.status || 0,
    allListeners: listenerCounts.all || 0,
    boards: [...boardsController.boards.values()].map(board => ({
      board: board.name,
      fetching: board.fetching,
      listeners: listenerCounts[board.name] || 0,
      lastPostNo: board.lastPostNo,
      nextFetch: board.nextFetchEstimation(),
    })),
  };
}

if(module.hot) {
  module.hot.dispose(() => {
    for(const listener of listeners) deleteListener(listener);
  });
}
