/**
 * Emotion Theme Configuration
 * Based on metaldragon design tokens
 */

import { tokens } from './tokens';

export const theme = {
  colors: tokens.colors,
  spacing: tokens.spacing,
  typography: tokens.typography,
  borderRadius: tokens.borderRadius,
  shadows: tokens.shadows,
  zIndex: tokens.zIndex,
  transitions: tokens.transitions,
  breakpoints: tokens.breakpoints,
} as const;

export type Theme = typeof theme;

// Emotion Theme 타입 확장
declare module '@emotion/react' {
  export interface Theme {
    colors: typeof tokens.colors;
    spacing: typeof tokens.spacing;
    typography: typeof tokens.typography;
    borderRadius: typeof tokens.borderRadius;
    shadows: typeof tokens.shadows;
    zIndex: typeof tokens.zIndex;
    transitions: typeof tokens.transitions;
    breakpoints: typeof tokens.breakpoints;
  }
}
