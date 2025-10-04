/**
 * Button Component with metaldragon theme
 * Supports kinetic gradient and glassmorphism styles
 */

'use client';

import styled from '@emotion/styled';
import { ButtonHTMLAttributes, ReactNode } from 'react';
import { tokens } from '@/lib/styles/tokens';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'glass';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  children: ReactNode;
}

const StyledButton = styled.button<ButtonProps>`
  /* Base styles */
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-family: ${tokens.typography.fontFamily.sans};
  font-weight: ${tokens.typography.fontWeight.medium};
  border-radius: ${tokens.borderRadius.md};
  cursor: pointer;
  transition: all ${tokens.transitions.base};
  border: none;
  outline: none;
  position: relative;
  overflow: hidden;

  /* Disable state */
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  /* Size variants */
  ${(props) => {
    if (props.size === 'sm') {
      return `
        padding: ${tokens.spacing[2]} ${tokens.spacing[4]};
        font-size: ${tokens.typography.fontSize.sm};
      `;
    }
    if (props.size === 'lg') {
      return `
        padding: ${tokens.spacing[4]} ${tokens.spacing[8]};
        font-size: ${tokens.typography.fontSize.lg};
      `;
    }
    // default: md
    return `
      padding: ${tokens.spacing[3]} ${tokens.spacing[6]};
      font-size: ${tokens.typography.fontSize.base};
    `;
  }}

  /* Full width */
  ${(props) => props.fullWidth && `width: 100%;`}

  /* Variant styles */
  ${(props) => {
    if (props.variant === 'primary') {
      return `
        background: ${tokens.colors.gradients.kinetic};
        color: white;
        box-shadow: ${tokens.shadows.md};

        &:hover:not(:disabled) {
          box-shadow: ${tokens.shadows.lg};
          transform: translateY(-2px);
        }

        &:active:not(:disabled) {
          transform: translateY(0);
        }
      `;
    }

    if (props.variant === 'secondary') {
      return `
        background: ${tokens.colors.secondary[500]};
        color: white;
        box-shadow: ${tokens.shadows.md};

        &:hover:not(:disabled) {
          background: ${tokens.colors.secondary[600]};
          box-shadow: ${tokens.shadows.lg};
          transform: translateY(-2px);
        }

        &:active:not(:disabled) {
          transform: translateY(0);
        }
      `;
    }

    if (props.variant === 'outline') {
      return `
        background: transparent;
        border: 2px solid ${tokens.colors.primary[500]};
        color: ${tokens.colors.primary[500]};

        &:hover:not(:disabled) {
          background: ${tokens.colors.primary[50]};
          transform: translateY(-2px);
        }

        &:active:not(:disabled) {
          transform: translateY(0);
        }
      `;
    }

    if (props.variant === 'ghost') {
      return `
        background: transparent;
        color: ${tokens.colors.gray[700]};

        &:hover:not(:disabled) {
          background: ${tokens.colors.gray[100]};
        }

        &:active:not(:disabled) {
          background: ${tokens.colors.gray[200]};
        }
      `;
    }

    if (props.variant === 'glass') {
      return `
        background: ${tokens.colors.glass.medium};
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.18);
        color: white;
        box-shadow: ${tokens.shadows.glass};

        &:hover:not(:disabled) {
          background: ${tokens.colors.glass.heavy};
          box-shadow: ${tokens.shadows.glow};
          transform: translateY(-2px);
        }

        &:active:not(:disabled) {
          transform: translateY(0);
        }
      `;
    }

    // default: primary
    return `
      background: ${tokens.colors.gradients.kinetic};
      color: white;
      box-shadow: ${tokens.shadows.md};

      &:hover:not(:disabled) {
        box-shadow: ${tokens.shadows.lg};
        transform: translateY(-2px);
      }

      &:active:not(:disabled) {
        transform: translateY(0);
      }
    `;
  }}

  /* Focus ring */
  &:focus-visible {
    outline: 2px solid ${tokens.colors.primary[500]};
    outline-offset: 2px;
  }
`;

export function Button({ variant = 'primary', size = 'md', children, ...props }: ButtonProps) {
  return (
    <StyledButton variant={variant} size={size} {...props}>
      {children}
    </StyledButton>
  );
}
