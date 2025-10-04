/**
 * Card Component with glassmorphism support
 */

'use client';

import styled from '@emotion/styled';
import { HTMLAttributes, ReactNode } from 'react';
import { tokens } from '@/lib/styles/tokens';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'glass' | 'bordered';
  padding?: 'sm' | 'md' | 'lg';
  hoverable?: boolean;
  children: ReactNode;
}

const StyledCard = styled.div<CardProps>`
  border-radius: ${tokens.borderRadius.lg};
  transition: all ${tokens.transitions.base};

  /* Padding variants */
  ${(props) => {
    if (props.padding === 'sm') {
      return `padding: ${tokens.spacing[4]};`;
    }
    if (props.padding === 'lg') {
      return `padding: ${tokens.spacing[8]};`;
    }
    // default: md
    return `padding: ${tokens.spacing[6]};`;
  }}

  /* Card variants */
  ${(props) => {
    if (props.variant === 'glass') {
      return `
        background: ${tokens.colors.glass.medium};
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.18);
        box-shadow: ${tokens.shadows.glass};
      `;
    }

    if (props.variant === 'bordered') {
      return `
        background: white;
        border: 1px solid ${tokens.colors.gray[200]};
        box-shadow: none;
      `;
    }

    // default
    return `
      background: white;
      border: none;
      box-shadow: ${tokens.shadows.md};
    `;
  }}

  /* Hoverable */
  ${(props) => props.hoverable && `
    cursor: pointer;

    &:hover {
      box-shadow: ${tokens.shadows.lg};
      transform: translateY(-4px);
    }

    &:active {
      transform: translateY(-2px);
    }
  `}
`;

export function Card({ variant = 'default', padding = 'md', hoverable = false, children, ...props }: CardProps) {
  return (
    <StyledCard variant={variant} padding={padding} hoverable={hoverable} {...props}>
      {children}
    </StyledCard>
  );
}
