import React, { useEffect, useReducer } from 'react';
import { keyframes, Paper, styled } from '@mui/material';
import { IndexPageResponse } from "../../types/api";
import usePageData from "../hooks/usePageData";

const busyBraile = ['⠙', '⠸', '⢰', '⣠', '⣄', '⡆', '⠇', '⠋'];

export default function IndexPage() {
  const { pageData } = usePageData<IndexPageResponse>();
  const [counter, incCounter] = useReducer(acc => acc + 1, 0);
  
  useEffect(() => {
    const id = setInterval(incCounter, 100);
    return () => clearInterval(id);
  }, []);
  
  return (
    <StyledIndexPage>
      <StyledPaper>
        {busyBraile[counter % busyBraile.length]}
        &ensp;
        {pageData?.kek}
        &ensp;
        {busyBraile[counter % busyBraile.length]}
      </StyledPaper>
      <StyledBubbles>
        <StyledBubble />
        <StyledBubble />
        <StyledBubble />
        <StyledBubble />
        <StyledBubble />
        <StyledBubble />
        <StyledBubble />
        <StyledBubble />
        <StyledBubble />
        <StyledBubble />
      </StyledBubbles>
    </StyledIndexPage>
  );
}

const StyledPaper = styled(Paper)`
    padding: 2em;
`;

const StyledIndexPage = styled("div")`
  position: fixed;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(to bottom right, #50a3a2 0%, #53e3a6 100%);
`;

const StyledBubbles = styled("div")`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: -1;
  pointer-events: none;
`;

const bubbleAnim = keyframes`
  0%   { transform: translateY(0); }
  100% { transform: translateY(-130vh) rotate(600deg); }
`;

const StyledBubble = styled("div")`
  position: absolute;
  display: block;
  width: 40px;
  height: 40px;
  background-color: rgba(255, 255, 255, 0.75);
  opacity: 0.15;
  bottom: -160px;
  animation: ${bubbleAnim} 25s infinite;
  transition-timing-function: linear;
  
  &:nth-of-type(1) {
    left: 10%;
  }
  
  &:nth-of-type(2) {
    left: 20%;
    width: 80px;
    height: 80px;
    animation-delay: 2s;
    animation-duration: 17s;
  }
  
  &:nth-of-type(3) {
    left: 25%;
    animation-delay: 4s;
  }
  
  &:nth-of-type(4) {
    left: 40%;
    width: 60px;
    height: 60px;
    animation-duration: 22s;
    opacity: 0.25;
  }
  
  &:nth-of-type(5) {
    left: 70%;
  }
  
  &:nth-of-type(6) {
    left: 80%;
    width: 120px;
    height: 120px;
    animation-delay: 3s;
    opacity: 0.2;
  }
  
  &:nth-of-type(7) {
    left: 32%;
    width: 160px;
    height: 160px;
    animation-delay: 7s;
  }
  
  &:nth-of-type(8) {
    left: 55%;
    width: 20px;
    height: 20px;
    animation-delay: 15s;
    animation-duration: 40s;
  }
  
  &:nth-of-type(9) {
    left: 25%;
    width: 10px;
    height: 10px;
    animation-delay: 2s;
    animation-duration: 40s;
    opacity: 0.30;
  }
  
  &:nth-of-type(10) {
    left: 90%;
    width: 160px;
    height: 160px;
    animation-delay: 11s;
  }
`;

