/**
 * View Component - Base Container (React Native inspired)
 * Based on LLD.md and HELP_GPT design principles
 */

'use client';

import styled from '@emotion/styled';
import { HTMLAttributes } from 'react';

interface ViewProps extends HTMLAttributes<HTMLDivElement> {
  flex?: boolean;
  direction?: 'row' | 'column' | 'row-reverse' | 'column-reverse';
  align?: 'start' | 'center' | 'end' | 'stretch' | 'baseline';
  justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
  gap?: number;
  padding?: number;
  glass?: 'light' | 'medium' | 'heavy';
}

export const View = styled.div<ViewProps>`
  ${(props) => props.flex && `display: flex;`}
  ${(props) => props.direction && `flex-direction: ${props.direction};`}
  ${(props) => props.align && `align-items: ${props.align};`}
  ${(props) => props.justify && `
    justify-content: ${
      props.justify === 'between' ? 'space-between' :
      props.justify === 'around' ? 'space-around' :
      props.justify === 'evenly' ? 'space-evenly' :
      props.justify
    };
  `}
  ${(props) => props.gap && `gap: ${props.gap * 4}px;`}
  ${(props) => props.padding && `padding: ${props.padding * 4}px;`}
  ${(props) => props.glass && `
    background: ${
      props.glass === 'light' ? 'rgba(255, 255, 255, 0.1)' :
      props.glass === 'medium' ? 'rgba(255, 255, 255, 0.15)' :
      'rgba(255, 255, 255, 0.25)'
    };
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.18);
  `}
`;
