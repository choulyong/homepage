/**
 * RCSS - Utility Style System (Replit-inspired)
 * Based on HELP_GPT design principles and LLD.md
 */

import { CSSObject } from '@emotion/react';

type FlexDirection = 'row' | 'column' | 'row-reverse' | 'column-reverse';
type AlignItems = 'start' | 'center' | 'end' | 'stretch' | 'baseline';
type JustifyContent = 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';

/**
 * RCSS Utility Functions
 * Usage: <View css={[rcss.flex('column'), rcss.gap(4), rcss.p(6)]} />
 */
export const rcss = {
  /**
   * Flexbox utilities
   */
  flex: (direction: FlexDirection = 'row'): CSSObject => ({
    display: 'flex',
    flexDirection: direction,
  }),

  center: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  } as CSSObject,

  alignItems: (align: AlignItems): CSSObject => ({
    alignItems: align,
  }),

  justifyContent: (justify: JustifyContent): CSSObject => ({
    justifyContent: justify === 'between' ? 'space-between' :
                     justify === 'around' ? 'space-around' :
                     justify === 'evenly' ? 'space-evenly' :
                     justify,
  }),

  /**
   * Spacing utilities (4px unit)
   */
  p: (value: number): CSSObject => ({
    padding: `${value * 4}px`,
  }),

  px: (value: number): CSSObject => ({
    paddingLeft: `${value * 4}px`,
    paddingRight: `${value * 4}px`,
  }),

  py: (value: number): CSSObject => ({
    paddingTop: `${value * 4}px`,
    paddingBottom: `${value * 4}px`,
  }),

  pt: (value: number): CSSObject => ({
    paddingTop: `${value * 4}px`,
  }),

  pr: (value: number): CSSObject => ({
    paddingRight: `${value * 4}px`,
  }),

  pb: (value: number): CSSObject => ({
    paddingBottom: `${value * 4}px`,
  }),

  pl: (value: number): CSSObject => ({
    paddingLeft: `${value * 4}px`,
  }),

  m: (value: number): CSSObject => ({
    margin: `${value * 4}px`,
  }),

  mx: (value: number): CSSObject => ({
    marginLeft: `${value * 4}px`,
    marginRight: `${value * 4}px`,
  }),

  my: (value: number): CSSObject => ({
    marginTop: `${value * 4}px`,
    marginBottom: `${value * 4}px`,
  }),

  mt: (value: number): CSSObject => ({
    marginTop: `${value * 4}px`,
  }),

  mr: (value: number): CSSObject => ({
    marginRight: `${value * 4}px`,
  }),

  mb: (value: number): CSSObject => ({
    marginBottom: `${value * 4}px`,
  }),

  ml: (value: number): CSSObject => ({
    marginLeft: `${value * 4}px`,
  }),

  gap: (value: number): CSSObject => ({
    gap: `${value * 4}px`,
  }),

  /**
   * Glassmorphism utilities
   */
  glass: (opacity: 'light' | 'medium' | 'heavy' = 'medium'): CSSObject => ({
    background: opacity === 'light' ? 'rgba(255, 255, 255, 0.1)' :
                opacity === 'medium' ? 'rgba(255, 255, 255, 0.15)' :
                'rgba(255, 255, 255, 0.25)',
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.18)',
  }),

  /**
   * Width/Height utilities
   */
  w: (value: string | number): CSSObject => ({
    width: typeof value === 'number' ? `${value}px` : value,
  }),

  h: (value: string | number): CSSObject => ({
    height: typeof value === 'number' ? `${value}px` : value,
  }),

  minW: (value: string | number): CSSObject => ({
    minWidth: typeof value === 'number' ? `${value}px` : value,
  }),

  minH: (value: string | number): CSSObject => ({
    minHeight: typeof value === 'number' ? `${value}px` : value,
  }),

  maxW: (value: string | number): CSSObject => ({
    maxWidth: typeof value === 'number' ? `${value}px` : value,
  }),

  maxH: (value: string | number): CSSObject => ({
    maxHeight: typeof value === 'number' ? `${value}px` : value,
  }),

  /**
   * Position utilities
   */
  absolute: {
    position: 'absolute',
  } as CSSObject,

  relative: {
    position: 'relative',
  } as CSSObject,

  fixed: {
    position: 'fixed',
  } as CSSObject,

  sticky: {
    position: 'sticky',
  } as CSSObject,

  /**
   * Overflow utilities
   */
  overflowHidden: {
    overflow: 'hidden',
  } as CSSObject,

  overflowAuto: {
    overflow: 'auto',
  } as CSSObject,

  overflowScroll: {
    overflow: 'scroll',
  } as CSSObject,

  /**
   * Border radius utilities
   */
  rounded: (value: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full'): CSSObject => ({
    borderRadius: value === 'sm' ? '0.25rem' :
                  value === 'md' ? '0.5rem' :
                  value === 'lg' ? '0.75rem' :
                  value === 'xl' ? '1rem' :
                  value === '2xl' ? '1.5rem' :
                  '9999px',
  }),

  /**
   * Shadow utilities
   */
  shadow: (value: 'sm' | 'md' | 'lg' | 'xl' | 'glass' | 'glow'): CSSObject => ({
    boxShadow: value === 'sm' ? '0 1px 2px 0 rgba(0, 0, 0, 0.05)' :
               value === 'md' ? '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' :
               value === 'lg' ? '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)' :
               value === 'xl' ? '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' :
               value === 'glass' ? '0 8px 32px 0 rgba(31, 38, 135, 0.37)' :
               '0 0 20px rgba(99, 102, 241, 0.5)',
  }),

  /**
   * Text utilities
   */
  textAlign: (align: 'left' | 'center' | 'right' | 'justify'): CSSObject => ({
    textAlign: align,
  }),

  truncate: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  } as CSSObject,

  /**
   * Cursor utilities
   */
  pointer: {
    cursor: 'pointer',
  } as CSSObject,

  notAllowed: {
    cursor: 'not-allowed',
  } as CSSObject,

  /**
   * Transition utilities
   */
  transition: (speed: 'fast' | 'base' | 'slow' | 'slower' = 'base'): CSSObject => ({
    transition: speed === 'fast' ? '150ms cubic-bezier(0.4, 0, 0.2, 1)' :
                speed === 'base' ? '200ms cubic-bezier(0.4, 0, 0.2, 1)' :
                speed === 'slow' ? '300ms cubic-bezier(0.4, 0, 0.2, 1)' :
                '500ms cubic-bezier(0.4, 0, 0.2, 1)',
  }),
} as const;
