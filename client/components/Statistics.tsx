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
      (+(b.nextFetch !== null) - +(a.nextFetch !== null))
      || (a.nextFetch !== null && b.nextFetch !== null && a.nextFetch < now && b.nextFetch < now && +a.lowPriority - +b.lowPriority)
      || (a.nextFetch !== null && b.nextFetch !== null && a.nextFetch - b.nextFetch)
      || a.board.localeCompare(b.board))
  ), [now, stats?.boards]);
  
  const { status } = useWebSocket<BoardsStats>({
    url: "/api/boards/status",
    active: true,
    onMessage: boards => setStats(boards),
  });
  
  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now), 1000);
    
    return () => void clearInterval(interval);
  }, []);
  
  let totalStats;
  if(stats) totalStats = stats.statusListeners + stats.allListeners + stats.boards.reduce((acc, val) => acc + val.listeners, 0);
  else totalStats = null;
  
  return (
    <StyledStatistics className={className}>
      <BoardRow> WebSocket: <StatsValue>{status}</StatsValue></BoardRow>
      <BoardRow></BoardRow>
      <BoardRow> /all/ listeners: <StatsValue>{stats?.allListeners ?? "N/A"}</StatsValue></BoardRow>
      <BoardRow> Stats listeners: <StatsValue>{stats?.statusListeners ?? "N/A"}</StatsValue></BoardRow>
      <BoardRow> Total listeners: <StatsValue>{totalStats ?? "N/A"}</StatsValue></BoardRow>
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
  else if(nextFetchIn <= 0 && board.lowPriority) time = "waiting";
  else if(nextFetchIn <= 0) time = "in queue";
  else time = `${Math.ceil(nextFetchIn / 1000)}s`;
  
  return (
    <BoardRow key={board.board} $disabled={!board.nextFetch} $fetching={board.fetching} $queue={board.nextFetch !== null && board.nextFetch < now} $lowPriority={board.lowPriority}>
      {name.padStart(8, " ")} | {lastPost.padEnd(13, " ")} | {listeners.padEnd(3, " ")} | {time.padEnd(9, " ")}
    </BoardRow>
  );
}

const BoardRow = styled("div", transientOptions)<{ $disabled?: boolean; $fetching?: boolean; $queue?: boolean; $lowPriority?: boolean }>`
  height: 1em;
  line-height: 1em;
  color: black;
  
  ${props => props.$disabled && css`color: gray`}
  ${props => props.$queue && css`color: darkcyan`}
  ${props => props.$queue && props.$lowPriority && css`color: darkgreen`}
  ${props => props.$fetching && css`color: blue`}
`;

const StyledStatistics = styled("div")`
  font-family: Consolas, monospace;
  white-space: pre;
`;

const StatsValue = styled("span")`
  font-weight: bold;
  text-transform: capitalize;
`;
