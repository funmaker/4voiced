import React, { useEffect, useMemo, useState } from "react";
import styled from "@emotion/styled";
import { css } from "@emotion/react";
import useWebSocket from "../hooks/useWebSocket";
import { BoardStats, BoardsStats } from "../../types/api";
import { transientOptions } from "../helpers/utils";

interface FetchingStatsProps {
  className?: string;
}

export default function Statistics({ className }: FetchingStatsProps) {
  const [now, setNow] = useState(Date.now());
  const [stats, setStats] = useState<BoardsStats | null>(null);
  const sorted = useMemo(() => (
    [...stats?.boards || []].sort((a, b) =>
      (+!!b.nextFetch - +!!a.nextFetch)
      || (a.nextFetch && b.nextFetch && a.nextFetch - b.nextFetch)
      || a.board.localeCompare(b.board))
  ), [stats]);
  
  const { status } = useWebSocket<BoardsStats>({
    url: "/api/boards/status",
    active: true,
    onMessage: boards => setStats(boards),
  });
  
  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now), 1000);
    
    return () => void clearInterval(interval);
  }, []);
  
  return (
    <StyledStatistics className={className}>
      <BoardRow> WebSocket: <StatsValue>{status}</StatsValue></BoardRow>
      <BoardRow></BoardRow>
      <BoardRow> /all/ listeners: <StatsValue>{stats?.allListeners ?? "N/A"}</StatsValue></BoardRow>
      <BoardRow> Stats listeners: <StatsValue>{stats?.statusListeners ?? "N/A"}</StatsValue></BoardRow>
      <BoardRow></BoardRow>
      <BoardRow>  board  |   last post   | lis |  status  </BoardRow>
      <BoardRow> ------- + ------------- + --- + -------- </BoardRow>
      {sorted.map(board => <Board key={board.board} board={board} now={now}></Board>)}
    </StyledStatistics>
  );
}

interface BoardProps {
  board: BoardStats;
  now: number;
}

function Board({ board, now }: BoardProps) {
  const nextFetchIn = board.nextFetch && board.nextFetch - now;
  
  const name = `/${board.board}/`;
  const lastPost = board.lastPostNo ? `No.${board.lastPostNo}` : "---";
  const listeners = (board.listeners || "---").toString();
  
  let time;
  if(board.fetching) time = "fetching";
  else if(nextFetchIn === null) time = "---";
  else if(nextFetchIn <= 0) time = "in queue";
  else time = `${Math.ceil(nextFetchIn / 1000)}s`;
  
  return (
    <BoardRow key={board.board} $disabled={!board.nextFetch} $fetching={board.fetching} $queue={!!board.nextFetch && board.nextFetch < now}>
      {name.padStart(8, " ")} | {lastPost.padEnd(13, " ")} | {listeners.padEnd(3, " ")} | {time.padEnd(9, " ")}
    </BoardRow>
  );
}

const BoardRow = styled("div", transientOptions)<{ $disabled?: boolean; $fetching?: boolean; $queue?: boolean}>`
  height: 1em;
  line-height: 1em;
  
  ${props => props.$disabled && css`color: gray`}
  ${props => props.$queue && css`color: orange`}
  ${props => props.$fetching && css`color: green`}
`;

const StyledStatistics = styled("div")`
  font-family: Consolas, monospace;
  white-space: pre;
`;

const StatsValue = styled("span")`
  font-weight: bold;
  text-transform: capitalize;
`;
