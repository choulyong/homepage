/**
 * View Component - Base Container (React Native inspired) - Tailwind CSS
 * Based on LLD.md and HELP_GPT design principles
 */

'use client';

import { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface ViewProps extends HTMLAttributes<HTMLDivElement> {
  flex?: boolean;
  direction?: 'row' | 'column' | 'row-reverse' | 'column-reverse';
  align?: 'start' | 'center' | 'end' | 'stretch' | 'baseline';
  justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
  gap?: number;
  padding?: number;
  glass?: 'light' | 'medium' | 'heavy';
}

export function View({
  flex,
  direction,
  align,
  justify,
  gap,
  padding,
  glass,
  className,
  children,
  ...props
}: ViewProps) {
  const classes = cn(
    // Flex
    flex && 'flex',

    // Direction
    direction === 'row' && 'flex-row',
    direction === 'column' && 'flex-col',
    direction === 'row-reverse' && 'flex-row-reverse',
    direction === 'column-reverse' && 'flex-col-reverse',

    // Align
    align === 'start' && 'items-start',
    align === 'center' && 'items-center',
    align === 'end' && 'items-end',
    align === 'stretch' && 'items-stretch',
    align === 'baseline' && 'items-baseline',

    // Justify
    justify === 'start' && 'justify-start',
    justify === 'center' && 'justify-center',
    justify === 'end' && 'justify-end',
    justify === 'between' && 'justify-between',
    justify === 'around' && 'justify-around',
    justify === 'evenly' && 'justify-evenly',

    // Glass Effect
    glass === 'light' && 'bg-white/10 backdrop-blur-md border border-white/18',
    glass === 'medium' && 'bg-white/15 backdrop-blur-md border border-white/18',
    glass === 'heavy' && 'bg-white/25 backdrop-blur-md border border-white/18',

    // Custom className
    className
  );

  const style = {
    ...props.style,
    ...(gap && { gap: `${gap * 4}px` }),
    ...(padding && { padding: `${padding * 4}px` }),
  };

  return (
    <div className={classes} style={style} {...props}>
      {children}
    </div>
  );
}
