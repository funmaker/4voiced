import React, { useEffect, useMemo, useRef } from "react";
import styled from "@emotion/styled";
import sanitizeHtml from 'sanitize-html';
import { css } from "@emotion/react";
import { IndexPost } from "../../types/4chan";
import useSpeech, { Emitter } from "../hooks/useSpeech";
import { transientOptions } from "../helpers/utils";

export type Position = [number, number, number, number, number, number];

const allowedClasses = {
  a: ['quoteLink', 'quotelink', 'deadlink'],
  span: ['quote'],
};

interface PostProps {
  post: IndexPost;
  x?: number;
  y?: number;
  animate?: boolean;
  onRemovePost?: (no: number) => void;
}

export default function Post({ post, x, y, animate, onRemovePost }: PostProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const contentRef = useRef<HTMLQuoteElement | null>(null);
  const sanitized = useMemo(() => post.com ? sanitizeHtml(post.com, { allowedClasses }) : null, [post.com]);
  const { speak } = useSpeech();
  
  useEffect(() => {
    let transitionTimeout: NodeJS.Timeout | null = null;
    let emitter: Emitter | null = null;
    
    const sleep = async (ms: number) => {
      await new Promise(res => transitionTimeout = setTimeout(res, ms));
      transitionTimeout = null;
    };
    
    (async () => {
      const element = ref.current;
      if(!element) return;
      
      const time = 20;
      const { from, to } = randomAnim();
      
      element.style.transition = "";
      element.style.transform = toTransform(from);
      element.style.opacity = "0";
      
      if(contentRef.current) {
        emitter = await speak(getReadableText(contentRef.current), {
          pitch: Math.random() * 100,
          speed: 150 + Math.random() * 50,
        });
        await sleep(time * 200);
      } else {
        await sleep(time * 200);
      }
      
      element.style.transition = `
        background-color 1s ease,
        border-top-color 1s ease,
        border-left-color 1s ease,
        border-right-color 1s ease,
        border-bottom-color 1s ease,
        transform ${time}s linear,
        opacity ${time / 4}s ease
      `;
      element.style.transform = toTransform(to);
      element.style.opacity = "1";
      
      if(emitter) {
        emitter.panner.positionX.setValueCurveAtTime([from[0] / 10, to[0] / 10], emitter.context.currentTime, time);
        emitter.panner.positionY.setValueCurveAtTime([-from[1] / 10, -to[1] / 10], emitter.context.currentTime, time);
        emitter.panner.positionZ.setValueCurveAtTime([from[2] / 10 - 5, to[2] / 10 - 5], emitter.context.currentTime, time);
        
        if(emitter.source.buffer) emitter.play((time - emitter.source.buffer.duration) * 0.5);
        else emitter.play();
      }
      
      await sleep(time * 1000);
      
      if(emitter) emitter.stop();
      if(onRemovePost) onRemovePost(post.no);
    })().catch(console.error);
    
    return () => {
      if(transitionTimeout !== null) clearTimeout(transitionTimeout);
      if(emitter) emitter.stop();
    };
  }, [speak, post.com, post.no, onRemovePost, x, y]);
  
  let link;
  if(post.resto === 0) link = `//boards.4chan.org/${post.board}/thread/${post.no}`;
  else link = `//boards.4chan.org/${post.board}/thread/${post.resto}#p${post.no}`;
  
  let imgLink;
  if(post.tim) imgLink = `//i.4cdn.org/${post.board}/${post.tim}${post.ext}`;
  
  const fileSize = post.fsize ? `${(post.fsize / 1024).toFixed(2)} KB` : "";
  
  return (
    <StyledPost id={`p${post.no}`} $animate={animate} ref={ref}>
      <div>
        <input type="checkbox" />{" "}
        <PostNameBlock><PostName>{post.name}</PostName></PostNameBlock>{" "}
        <span>{post.now}</span>{" "}
        <span>
          <PostLink href={`#p${post.no}`}>No.</PostLink>
          <PostLink href={link} target="_blank" rel="noreferrer">{post.no}</PostLink>
        </span>{" "}
        <PostMenu href="#">▶</PostMenu>
      </div>
      {imgLink && (
        <div>
          <FileText>
            File:{" "}
            <a href={imgLink} target="_blank" rel="noreferrer">{post.filename}{post.ext}</a>{" "}
            ({fileSize}, {post.w}x{post.h})
          </FileText>
          <ThumbLink href={imgLink} target="_blank" rel="noreferrer">
            <Thumbnail src={`/api/proxy/${post.board}/${post.tim}s.jpg`} alt={fileSize} style={{ height: post.tn_h, width: post.tn_w }} loading="lazy" />
          </ThumbLink>
        </div>
      )}
      {sanitized && <PostContent dangerouslySetInnerHTML={{ __html: sanitized }} ref={contentRef} />}
    </StyledPost>
  );
}

const spp = (val: number, power: number) => Math.abs(val) ** power * Math.sign(val);

function randomAnim(dx?: number, dy?: number) {
  const x = dx ?? spp(Math.random() * 2 - 1, 0.25) * 50;
  const y = dy ?? spp(Math.random() * 2 - 1, 0.25) * 15;
  
  const xa = Math.PI * 0.1 * Math.sign(y) * Math.abs(y / 15);
  const ya = Math.PI * 0.4 * -Math.sign(x) * Math.abs(x / 50) ** 0.2;
  const za = spp(Math.random() * 2 - 1, 4) * 0.1;
  
  return {
    from: [x, y, -150, xa, ya, za] satisfies Position,
    to: [x, y, 100, xa, ya, za] satisfies Position,
  };
}

function getReadableText(element: HTMLElement) {
  let readableText = "";
  
  element.childNodes.forEach(node => {
    if(node.nodeType === node.TEXT_NODE) readableText += node.nodeValue;
    else if(node.nodeType === node.ELEMENT_NODE && node.nodeName === "BR") readableText += "\n";
    else if(node.nodeType === node.ELEMENT_NODE && node.nodeName === "SPAN") readableText += node.textContent;
  });
  
  readableText = readableText.replace(/https?:\/\/\S*/g, "\n");
  readableText = readableText.replace(/ +/g, " ");
  readableText = readableText.replace(/\n(:? *\n*)+/g, "\n");
  readableText = readableText.trim();
  
  return readableText;
}

const toTransform = (position: Position) => `
  translate(-50%, -50%)
  translate3D(${position[0]}em, ${position[1]}em, ${position[2]}em)
  rotateZ(${position[5]}rad)
  rotateY(${position[4]}rad)
  rotateX(${position[3]}rad)
`;

const StyledPost = styled("div", transientOptions)<{ $animate?: boolean }>`
  display: table;
  background-color: var(--post-background);
  border: 1px solid var(--post-border);
  padding: 2px;
  text-align: left;
  
  ${props => props.$animate && css`
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    opacity: 0;
  `}
  
  span.quote {
    color: #789922;
  }
  
  a.quoteLink, a.quotelink, a.deadlink {
    color: var(--quote-link) !important;
    text-decoration: underline;
    transition: color 1s ease;
  }
`;

const PostName = styled("span")`
  color: #117743;
  font-weight: 700;
`;

const PostNameBlock = styled("span")`
  display: inline-block;
`;

const PostLink = styled("a")`
  text-decoration: none;
  color: inherit;
`;

const FileText = styled("div")`
  max-width: 600px;
  white-space: nowrap;
`;

const PostMenu = styled("a")`
  margin-left: 5px;
  text-decoration: none;
  line-height: 1em;
  display: inline-block;
  width: 1em;
  height: 1em;
  text-align: center;
  outline: none;
  opacity: 0.8;
`;

const ThumbLink = styled("a")`
  float: left;
  margin: 3px 20px 5px;
`;

const Thumbnail = styled("img")`
  float: left;
`;

const PostContent = styled("blockquote")`
  display: block;
  margin: revert;
`;
