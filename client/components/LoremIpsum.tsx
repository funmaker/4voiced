import React, { useMemo } from "react";
import styled from "@emotion/styled";
import { ILoremIpsumParams, loremIpsum } from "lorem-ipsum";
import SSRCurtain from "./SSRCurtain";
import "./LoremIpsum.scss";

export type LoremIpsumProps = ILoremIpsumParams;

export default function LoremIpsum(props: LoremIpsumProps) {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const text = useMemo(() => loremIpsum(props), [...Object.values(props)]);
  
  return (
    <span>
      <SSRCurtain>{text}</SSRCurtain>
    </span>
  );
}

const StyledLoremIpsum = styled("span")`
    white-space: pre-line;
`;

