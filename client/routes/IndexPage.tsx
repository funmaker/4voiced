import React, { useCallback, useEffect, useReducer, useState } from 'react';
import styled from '@emotion/styled';
import { Link } from "react-router-dom";
import { useParams } from "react-router";
import { useConfig } from "../hooks/usePageData";
import { IndexPost } from "../../types/4chan";
import useSFW from "../hooks/useSFW";
import useWebSocket from "../hooks/useWebSocket";
import useChange from "../hooks/useChange";
import useSpeech, { AudioStatus } from "../hooks/useSpeech";
import Hide from "../components/Hide";
import Post from "../components/Post";
import Statistics from "../components/Statistics";
import SSRCurtain from "../components/SSRCurtain";
import ExLink from "../components/ExLink";

export default function IndexPage() {
  const { boards } = useConfig();
  const { board: boardName, thread } = useParams<{ board?: string; thread?: string }>();
  const { setSFW } = useSFW();
  const { status: audioStatus, workerStatus } = useSpeech();
  const [posts, setPosts] = useState<IndexPost[]>([]);
  const [showStats, toggleFetchingStats] = useReducer(stats => !stats, false);
  
  const onRemovePost = useCallback((no: number) => setPosts(posts => posts.filter(post => post.no !== no)), []);
  
  const board = boards.find(boardInfo => boardInfo.board === boardName);
  const test = boardName === "test";
  const knownBoard = !!board || boardName === "all" || test;
  const callForAction = knownBoard && (audioStatus === AudioStatus.SUSPENDED || audioStatus === AudioStatus.NO_AUDIO);
  
  let wsUrl = `/api/boards`;
  if(board) wsUrl += `/${board.board}`;
  if(board && thread) wsUrl += `/${thread}`;
  
  useChange(boardName, () => setPosts([]));
  
  const { status: wsStatus } = useWebSocket<IndexPost>({
    url: wsUrl,
    active: knownBoard && !callForAction && !test,
    onMessage: post => setPosts(posts => [post, ...posts]),
  });
  
  let title;
  if(callForAction) title = <Title>Click to Start</Title>;
  else if(boardName === "all") title = <Title>/all/</Title>;
  else if(boardName === "test") title = <Title>/test/</Title>;
  else if(board) title = <Title>/{board.board}/ - {board.title}</Title>;
  else title = <Title>4voiced</Title>;
  
  let hideBoards;
  if(callForAction) hideBoards = true;
  else if(!knownBoard) hideBoards = false;
  else hideBoards = "auto" as const;
  
  useEffect(() => {
    if(board) setSFW(!!board.ws_board);
  }, [board, setSFW]);
  
  return (
    <StyledIndexPage>
      <Scene3D>
        {posts.map(post => <Post key={post.no} post={post} animate onRemovePost={onRemovePost} />)}
      </Scene3D>
      
      <ContentWrap>
        <Hide hide={showStats ? false : "auto"}>
          <Status>
            <noscript><StatusSection>(JavaScript is Required)</StatusSection></noscript>
            <StatusSection>(🎧 Headphones Recommended)</StatusSection>
            <StatusSection><ExLink to="https://github.com/funmaker/4voiced"><StatusButton>GitHub</StatusButton></ExLink></StatusSection>
            <SSRCurtain>
              <StatusSection>
                <div><label>AudioSystem:</label> <StatusValue>{audioStatus}</StatusValue></div>
                <div><label>WebSocket:</label> <StatusValue>{wsStatus}</StatusValue></div>
                {workerStatus.map((status, id) => (
                  <div key={id}><label>Worker {id}:</label> <StatusValue>{status}</StatusValue></div>
                ))}
              </StatusSection>
            </SSRCurtain>
            <StatusSection><StatusButton onClick={toggleFetchingStats}>[Statistics]</StatusButton></StatusSection>
          </Status>
        </Hide>
        
        {showStats && <StyledFetchingStats />}
        
        <Padding />
        
        {title}
        
        <Hide hide={hideBoards}>
          <BoardList>
            <BoardLink to="/">Home</BoardLink>
            <BoardLink to="/board/all">/all/</BoardLink>
            {boards.map(board => <BoardLink to={`/board/${board.board}`} key={board.board}>/{board.board}/</BoardLink>)}
          </BoardList>
        </Hide>
      </ContentWrap>
    </StyledIndexPage>
  );
}

const Status = styled("div")`
  font-family: Consolas, monospace;
  position: absolute;
  top: 1em;
  left: 1em;
`;

const StatusValue = styled("span")`
  text-transform: capitalize;
  font-weight: bold;
`;

const StatusButton = styled("span")`
  font-weight: bold;
  cursor: pointer;
`;

const StatusSection = styled("p")`
  margin-bottom: 1em;
`;

const Scene3D = styled("div")`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  pointer-events: none;
  
  perspective-origin: 50% 50%;
  perspective: 300px;
  
  > * {
    pointer-events: auto;
  }
`;

const StyledFetchingStats = styled(Statistics)`
  position: absolute;
  top: 0;
  right: 0;
  height: 100%;
  padding: 1em 0;
  overflow: hidden auto;
`;

const Padding = styled("div")`
  flex: 1 1 0;
`;

const Title = styled("h1")`
  font-family: Tahoma,sans-serif;
  color: #af0a0f;
  margin: 2em 0;
  font-size: 300%;
`;

const BoardList = styled("div")`
  flex: 1 1 0;
  width: 75%;
  max-width: 50em;
  display: flex;
  flex-wrap: wrap;
  align-content: flex-start;
  justify-content: center;
  
  > * {
    display: inline-block;
    width: 3em;
    padding: 0.5em 0;
    margin: 0.5em;
    text-align: center;
  }
`;

const BoardLink = styled(Link)`
  text-decoration: none;
  color: #0f70ee;
  
  &:hover {
    color: #1B94D1;
  }
`;

const ContentWrap = styled("div")`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  pointer-events: none;
  white-space: nowrap;
  
  > * {
    pointer-events: auto;
  }
`;

const StyledIndexPage = styled("div")`

`;

