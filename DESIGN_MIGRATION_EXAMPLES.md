# Design Migration Examples
## Emotion CSS-in-JS → Tailwind CSS Conversion Guide

This document provides practical before/after examples for migrating components from the current Emotion-based design to the new Tailwind CSS system.

---

## Quick Reference: Design Token Mapping

### Colors
| Current (Emotion) | New (Tailwind) | Usage |
|------------------|----------------|-------|
| `tokens.colors.primary[500]` | `bg-teal-500` | Primary CTA buttons |
| `tokens.colors.secondary[500]` | `bg-indigo-400` | Secondary actions |
| `tokens.colors.accent[500]` | `bg-gradient-to-r from-teal-500 to-indigo-400` | Gradients |
| `tokens.colors.gray[900]` | `text-gray-900 dark:text-gray-100` | Primary text |
| `tokens.colors.glass.medium` | `backdrop-blur-md bg-white/15` | Glass effects |

### Spacing
| Current | New | Value |
|---------|-----|-------|
| `${tokens.spacing[4]}` | `p-4` | 16px |
| `${tokens.spacing[6]}` | `p-6` | 24px |
| `${tokens.spacing[8]}` | `p-8` | 32px |
| `gap: ${tokens.spacing[4]}` | `gap-4` | 16px gap |

### Typography
| Current | New | Value |
|---------|-----|-------|
| `${tokens.typography.fontSize['2xl']}` | `text-2xl` | 24px |
| `${tokens.typography.fontWeight.bold}` | `font-bold` | 700 |
| `font-family: ${tokens.typography.fontFamily.display}` | `font-display` | Red Hat Display |

---

## Component Migration Examples

### 1. Header Component

#### BEFORE (Emotion)
```tsx
import styled from '@emotion/styled';
import { tokens } from '@/lib/styles/tokens';

const HeaderContainer = styled.header`
  position: sticky;
  top: 0;
  z-index: ${tokens.zIndex.sticky};
  background: ${tokens.colors.glass.heavy};
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.18);
  box-shadow: ${tokens.shadows.glass};
`;

const Logo = styled(Link)`
  font-family: ${tokens.typography.fontFamily.display};
  font-size: ${tokens.typography.fontSize['2xl']};
  font-weight: ${tokens.typography.fontWeight.bold};
  background: ${tokens.colors.gradients.kinetic};
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
`;

export function Header() {
  return (
    <HeaderContainer>
      <Logo href="/">metaldragon</Logo>
    </HeaderContainer>
  );
}
```

#### AFTER (Tailwind)
```tsx
import Link from 'next/link';

export function Header() {
  return (
    <header className="sticky top-0 z-30 backdrop-blur-md bg-white/25 border-b border-white/20 shadow-lg">
      <Link
        href="/"
        className="text-2xl font-bold font-display bg-gradient-to-r from-teal-500 to-indigo-400 bg-clip-text text-transparent"
      >
        metaldragon
      </Link>
    </header>
  );
}
```

**Key Changes:**
- `styled.header` → `<header className="...">`
- Token references → Direct Tailwind utilities
- CSS-in-JS logic → Utility classes
- Pseudo-selectors → Group utilities (if needed)

---

### 2. Button Component

#### BEFORE (Emotion)
```tsx
import styled from '@emotion/styled';
import { tokens } from '@/lib/styles/tokens';

const StyledButton = styled.button<{ variant: 'primary' | 'ghost'; size: 'sm' | 'lg' }>`
  padding: ${props => props.size === 'sm' ? tokens.spacing[2] : tokens.spacing[4]};
  background: ${props => props.variant === 'primary' ? tokens.colors.primary[500] : 'transparent'};
  color: ${props => props.variant === 'primary' ? 'white' : tokens.colors.gray[700]};
  border-radius: ${tokens.borderRadius.lg};
  font-weight: ${tokens.typography.fontWeight.medium};
  transition: all ${tokens.transitions.base};

  &:hover {
    background: ${props => props.variant === 'primary' ? tokens.colors.primary[400] : tokens.colors.gray[100]};
    transform: translateY(-2px);
  }
`;

export function Button({ variant = 'primary', size = 'lg', children }) {
  return (
    <StyledButton variant={variant} size={size}>
      {children}
    </StyledButton>
  );
}
```

#### AFTER (Tailwind)
```tsx
import { cn } from '@/lib/utils'; // className merger utility

interface ButtonProps {
  variant?: 'primary' | 'ghost';
  size?: 'sm' | 'lg';
  children: React.ReactNode;
  className?: string;
}

export function Button({ variant = 'primary', size = 'lg', children, className }: ButtonProps) {
  return (
    <button
      className={cn(
        // Base styles
        'rounded-lg font-medium transition-all duration-200 hover:-translate-y-0.5',
        // Variant styles
        variant === 'primary' && 'bg-teal-500 hover:bg-teal-400 text-white',
        variant === 'ghost' && 'bg-transparent hover:bg-gray-100 text-gray-700 dark:text-gray-300 dark:hover:bg-gray-800',
        // Size styles
        size === 'sm' && 'px-4 py-2 text-sm',
        size === 'lg' && 'px-6 py-3 text-base',
        // Custom className override
        className
      )}
    >
      {children}
    </button>
  );
}

// Utility function (create in @/lib/utils.ts)
export function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}
```

**Key Changes:**
- Conditional props → `cn()` utility with logical AND
- Styled component props → Tailwind classes with conditionals
- Theme tokens → Direct color values (`teal-500`)
- Pseudo-selectors → `hover:` prefix

---

### 3. Card Component

#### BEFORE (Emotion)
```tsx
import styled from '@emotion/styled';
import { tokens } from '@/lib/styles/tokens';
import { rcss } from '@/lib/styles/rcss';

const CardContainer = styled.div`
  ${rcss.glass('medium')};
  ${rcss.rounded('xl')};
  ${rcss.p(8)};
  ${rcss.shadow('glass')};
  transition: all ${tokens.transitions.base};

  &:hover {
    transform: translateY(-8px);
    box-shadow: ${tokens.shadows.glow};
  }
`;

const CardTitle = styled.h3`
  font-size: ${tokens.typography.fontSize.xl};
  font-weight: ${tokens.typography.fontWeight.semibold};
  color: ${tokens.colors.gray[900]};
  margin: 0 0 ${tokens.spacing[2]};
`;

export function Card({ title, children }) {
  return (
    <CardContainer>
      <CardTitle>{title}</CardTitle>
      {children}
    </CardContainer>
  );
}
```

#### AFTER (Tailwind)
```tsx
interface CardProps {
  title: string;
  children: React.ReactNode;
}

export function Card({ title, children }: CardProps) {
  return (
    <div className="backdrop-blur-md bg-white/15 rounded-xl p-8 shadow-lg transition-all duration-200 hover:-translate-y-2 hover:shadow-2xl border border-white/20">
      <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
        {title}
      </h3>
      {children}
    </div>
  );
}
```

**Glassmorphism Conversion:**
- `rcss.glass('medium')` → `backdrop-blur-md bg-white/15 border border-white/20`
- Dark mode support → Add `dark:bg-gray-800 dark:border-gray-700`

---

### 4. Hero Section

#### BEFORE (Emotion)
```tsx
import styled from '@emotion/styled';
import { tokens } from '@/lib/styles/tokens';

const HeroSection = styled.section`
  min-height: 80vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: ${tokens.spacing[12]} ${tokens.spacing[6]};
  background: ${tokens.colors.gradients.dark};
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: ${tokens.colors.gradients.kinetic};
    opacity: 0.1;
    animation: gradientShift 8s ease infinite;
  }

  @keyframes gradientShift {
    0%, 100% { transform: translateX(0) translateY(0); }
    50% { transform: translateX(10%) translateY(10%); }
  }
`;

const Title = styled.h1`
  font-family: ${tokens.typography.fontFamily.display};
  font-size: clamp(2.5rem, 8vw, 4.5rem);
  font-weight: ${tokens.typography.fontWeight.extrabold};
  background: ${tokens.colors.gradients.kinetic};
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: fadeInUp 0.8s ease-out;
`;
```

#### AFTER (Tailwind)
```tsx
export function HeroSection() {
  return (
    <section className="relative min-h-[80vh] flex flex-col items-center justify-center px-6 py-12 bg-gradient-to-br from-gray-900 to-gray-800 overflow-hidden">
      {/* Animated gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-teal-500/10 to-indigo-400/10 animate-gradient-shift" />

      {/* Content */}
      <div className="relative z-10">
        <h1 className="font-display text-[clamp(2.5rem,8vw,4.5rem)] font-extrabold bg-gradient-to-r from-teal-500 to-indigo-400 bg-clip-text text-transparent animate-fade-in-up">
          Metaldragon Control Room
        </h1>
      </div>
    </section>
  );
}
```

**Custom animations in `globals.css`:**
```css
@layer utilities {
  .animate-gradient-shift {
    animation: gradientShift 8s ease infinite;
  }

  .animate-fade-in-up {
    animation: fadeInUp 0.8s ease-out;
  }
}

@keyframes gradientShift {
  0%, 100% { transform: translateX(0) translateY(0); }
  50% { transform: translateX(10%) translateY(10%); }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

---

### 5. Dark Mode Toggle

#### BEFORE (Emotion)
```tsx
import styled from '@emotion/styled';
import { useState } from 'react';

const ToggleSwitch = styled.button`
  position: relative;
  width: 44px;
  height: 24px;
  background: ${props => props.checked ? '#3abab4' : '#e5e7eb'};
  border-radius: 9999px;
  transition: background 0.2s;
`;

export function DarkModeToggle() {
  const [isDark, setIsDark] = useState(false);

  return (
    <ToggleSwitch
      checked={isDark}
      onClick={() => {
        setIsDark(!isDark);
        document.documentElement.classList.toggle('dark');
      }}
    />
  );
}
```

#### AFTER (Tailwind - appy-html style)
```tsx
'use client';

import { useEffect, useState } from 'react';

export function DarkModeToggle() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Initialize from localStorage
    const darkMode = localStorage.getItem('dark-mode') === 'true' ||
                     !('dark-mode' in localStorage);
    setIsDark(darkMode);
    if (darkMode) {
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleDarkMode = () => {
    const newDarkMode = !isDark;
    setIsDark(newDarkMode);
    localStorage.setItem('dark-mode', String(newDarkMode));
    document.documentElement.classList.toggle('dark');
  };

  return (
    <div className="form-switch flex flex-col justify-center">
      <input
        type="checkbox"
        id="light-switch"
        className="sr-only"
        checked={isDark}
        onChange={toggleDarkMode}
      />
      <label htmlFor="light-switch" className="relative cursor-pointer">
        <span className="relative block w-11 h-6 bg-gradient-to-t from-gray-100 to-white dark:from-gray-800 dark:to-gray-700 rounded-full shadow-sm">
          <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white dark:bg-gray-900 rounded-full shadow-sm transition-transform duration-150 ${isDark ? 'translate-x-5' : 'translate-x-0'}`} />
        </span>

        {/* Sun/Moon Icons */}
        <svg className="absolute inset-0 pointer-events-none" width="44" height="24" viewBox="0 0 44 24">
          <g className="fill-current text-gray-400" fillRule="nonzero" opacity=".88">
            {/* Sun (visible in light mode) */}
            <circle className={isDark ? 'opacity-40' : 'opacity-100'} cx="32" cy="12" r="3" />
            {/* Moon (visible in dark mode) */}
            <circle className={isDark ? 'opacity-100' : 'opacity-40'} cx="12" cy="12" r="6" />
          </g>
        </svg>
        <span className="sr-only">Switch to light / dark version</span>
      </label>
    </div>
  );
}
```

**Key Addition:**
- localStorage persistence
- Gradient background on toggle track
- Smooth sliding animation
- Sun/Moon icon indicators

---

### 6. Admin Sidebar

#### BEFORE (Emotion)
```tsx
import styled from '@emotion/styled';
import { tokens } from '@/lib/styles/tokens';

const SidebarContainer = styled.aside`
  position: fixed;
  left: 0;
  top: 0;
  height: 100vh;
  width: 280px;
  background: ${tokens.colors.gradients.dark};
  padding: ${tokens.spacing[6]};
  overflow-y: auto;
`;

const NavLink = styled(Link)<{ active: boolean }>`
  display: flex;
  align-items: center;
  gap: ${tokens.spacing[3]};
  padding: ${tokens.spacing[3]} ${tokens.spacing[4]};
  border-radius: ${tokens.borderRadius.lg};
  color: ${props => props.active ? tokens.colors.primary[500] : tokens.colors.gray[400]};
  background: ${props => props.active ? tokens.colors.glass.light : 'transparent'};
  transition: all ${tokens.transitions.base};

  &:hover {
    background: ${tokens.colors.glass.medium};
    color: ${tokens.colors.gray[200]};
  }
`;
```

#### AFTER (Tailwind)
```tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navLinks = [
  { href: '/admin', label: '대시보드', icon: '📊' },
  { href: '/admin/posts', label: '게시물 관리', icon: '📝' },
  { href: '/admin/news', label: '뉴스 관리', icon: '📰' },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 h-screen w-72 bg-gray-900 dark:bg-gray-950 p-6 overflow-y-auto border-r border-gray-800">
      {/* Logo */}
      <div className="mb-8">
        <Link href="/admin" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-teal-500 to-indigo-400 flex items-center justify-center text-white font-bold text-xl">
            M
          </div>
          <span className="text-xl font-bold text-white">Admin</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav>
        <ul className="space-y-2">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-lg transition-colors
                    ${isActive
                      ? 'bg-teal-500/10 text-teal-400 font-medium'
                      : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200'
                    }
                  `}
                >
                  <span className="text-2xl">{link.icon}</span>
                  <span>{link.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
```

**Key Changes:**
- `usePathname()` hook for active state
- Template literals for conditional classes
- Teal accent for active items (`bg-teal-500/10 text-teal-400`)
- Gradient logo badge

---

### 7. Form Input Component

#### BEFORE (Emotion)
```tsx
import styled from '@emotion/styled';
import { tokens } from '@/lib/styles/tokens';

const InputWrapper = styled.div`
  margin-bottom: ${tokens.spacing[4]};
`;

const Label = styled.label`
  display: block;
  font-size: ${tokens.typography.fontSize.sm};
  font-weight: ${tokens.typography.fontWeight.medium};
  color: ${tokens.colors.gray[700]};
  margin-bottom: ${tokens.spacing[2]};
`;

const Input = styled.input`
  width: 100%;
  padding: ${tokens.spacing[3]} ${tokens.spacing[4]};
  border: 1px solid ${tokens.colors.gray[300]};
  border-radius: ${tokens.borderRadius.md};
  font-size: ${tokens.typography.fontSize.base};
  transition: all ${tokens.transitions.base};

  &:focus {
    outline: none;
    border-color: ${tokens.colors.primary[500]};
    box-shadow: 0 0 0 3px ${tokens.colors.primary[100]};
  }
`;
```

#### AFTER (Tailwind)
```tsx
interface InputProps {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
}

export function Input({ label, name, type = 'text', placeholder }: InputProps) {
  return (
    <div className="mb-4">
      <label
        htmlFor={name}
        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
      >
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        placeholder={placeholder}
        className="
          w-full px-4 py-3
          border border-gray-300 dark:border-gray-600
          rounded-md
          text-base text-gray-900 dark:text-gray-100
          bg-white dark:bg-gray-800
          transition-all duration-200
          focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent
          placeholder:text-gray-400 dark:placeholder:text-gray-500
        "
      />
    </div>
  );
}
```

**Focus state:**
- `focus:outline-none` → Remove default outline
- `focus:ring-2 focus:ring-teal-500` → Add teal ring
- `focus:border-transparent` → Hide border on focus

---

### 8. Responsive Layout

#### BEFORE (Emotion)
```tsx
import styled from '@emotion/styled';
import { tokens } from '@/lib/styles/tokens';

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: ${tokens.spacing[6]};

  @media (max-width: ${tokens.breakpoints.md}) {
    grid-template-columns: 1fr;
    gap: ${tokens.spacing[4]};
  }
`;
```

#### AFTER (Tailwind)
```tsx
export function ResponsiveGrid({ children }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-4">
      {children}
    </div>
  );
}
```

**Responsive utilities:**
- Mobile-first: `grid-cols-1` (default)
- Tablet: `md:grid-cols-2` (≥768px)
- Desktop: `lg:grid-cols-3` (≥1024px)

---

## Advanced Patterns

### 1. Conditional Rendering with Dark Mode

```tsx
// Light mode only gradient (appy-html pattern)
<div className="absolute inset-0 dark:hidden">
  <svg width="800" height="520">
    <defs>
      <radialGradient id="heroglow" cx="0" cy="0" r="1">
        <stop offset="0%" stopColor="#3ABAB4" stopOpacity="0.4" />
        <stop offset="100%" stopColor="#3ABAB4" stopOpacity="0" />
      </radialGradient>
    </defs>
    <circle cx="400" cy="100" r="400" fill="url(#heroglow)" />
  </svg>
</div>
```

### 2. Group Hover Effects

```tsx
// Card with grouped hover states
<div className="group">
  <img className="group-hover:scale-105 transition-transform" />
  <h3 className="group-hover:text-teal-500 transition-colors">Title</h3>
  <div className="opacity-0 group-hover:opacity-100 transition-opacity">
    Hidden content
  </div>
</div>
```

### 3. Custom Animation Classes

```css
/* globals.css */
@layer utilities {
  .animate-fade-in-up {
    animation: fadeInUp 0.8s ease-out;
  }

  .animate-slide-in-right {
    animation: slideInRight 0.6s ease-out;
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}
```

---

## Utility Helper Functions

### 1. className Merger (cn utility)

```typescript
// src/lib/utils.ts
import clsx, { ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Usage:
<button className={cn(
  'px-4 py-2 rounded-lg',
  isActive && 'bg-teal-500',
  isPrimary ? 'text-white' : 'text-gray-700',
  className // Allows prop override
)} />
```

### 2. Responsive Value Helper

```typescript
// src/lib/responsive.ts
export const responsive = {
  mobile: (value: string) => value,
  tablet: (value: string) => `md:${value}`,
  desktop: (value: string) => `lg:${value}`,
};

// Usage:
<div className={cn(
  responsive.mobile('text-2xl'),
  responsive.tablet('text-3xl'),
  responsive.desktop('text-4xl')
)}>
  Responsive Text
</div>
```

---

## Migration Checklist

### Per Component:
- [ ] Remove `styled` import
- [ ] Remove `@emotion/styled` import
- [ ] Replace `styled.div` with `<div className="...">`
- [ ] Convert theme tokens to Tailwind classes
- [ ] Add dark mode variants (`dark:`)
- [ ] Test responsive breakpoints
- [ ] Verify hover/focus states
- [ ] Check accessibility (focus rings, contrast)

### Testing:
- [ ] Visual regression tests pass
- [ ] Dark mode toggle works
- [ ] Mobile responsive (iPhone, Android)
- [ ] Tablet responsive (iPad)
- [ ] Desktop responsive (1920px+)
- [ ] Keyboard navigation functional
- [ ] Screen reader compatible

---

## Common Gotchas

### 1. Z-index Conflicts
**Problem:** Multiple `z-` utilities competing
**Solution:** Use consistent z-index scale
```tsx
// Bad
<div className="z-50">
  <div className="z-40"></div>
</div>

// Good
<div className="z-modal">  /* z-50 */
  <div className="z-overlay"></div>  /* z-40 */
</div>
```

### 2. Dark Mode Specificity
**Problem:** Dark mode styles not applying
**Solution:** Ensure `dark` class on `<html>` element
```tsx
// layout.tsx
<html lang="ko" className="dark"> {/* or dynamically add */}
```

### 3. Gradient Text Clipping
**Problem:** Gradient text getting cut off
**Solution:** Add padding or line-height
```tsx
<h1 className="bg-gradient-to-r from-teal-500 to-indigo-400 bg-clip-text text-transparent py-2">
  Title
</h1>
```

### 4. Transition Flicker
**Problem:** Properties flashing during transition
**Solution:** Use `will-change` sparingly or transition specific properties
```css
/* Instead of transition-all */
.card {
  @apply transition-[transform,box-shadow] duration-300;
}
```

---

## Performance Optimization

### 1. PurgeCSS Configuration
```typescript
// tailwind.config.ts
export default {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  // This will tree-shake unused utilities
}
```

### 2. Critical CSS
```tsx
// app/layout.tsx
import './globals.css'; // Contains Tailwind directives

// Inline critical styles for above-the-fold content
<style dangerouslySetInnerHTML={{
  __html: `
    .hero { /* critical hero styles */ }
    .header { /* critical header styles */ }
  `
}} />
```

### 3. Font Loading Strategy
```tsx
// app/layout.tsx
import { Inter, Red_Hat_Display } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

const redHat = Red_Hat_Display({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-display',
});

export default function RootLayout({ children }) {
  return (
    <html className={`${inter.variable} ${redHat.variable}`}>
      <body className="font-sans">{children}</body>
    </html>
  );
}
```

```css
/* tailwind.config.ts */
theme: {
  extend: {
    fontFamily: {
      sans: ['var(--font-inter)', 'system-ui'],
      display: ['var(--font-display)', 'sans-serif'],
    },
  },
}
```

---

## Next Steps

1. **Start Small:** Begin with simple components (Button, Input)
2. **Test Incrementally:** Verify each component before moving on
3. **Document Patterns:** Create shared patterns for team consistency
4. **Performance Monitor:** Use Lighthouse to track improvements
5. **Accessibility Audit:** Run axe DevTools on each page

---

**Quick Start Command:**
```bash
# Install Tailwind v4
npm install tailwindcss@next @tailwindcss/postcss@next

# Install utility helpers
npm install clsx tailwind-merge

# Install AOS (optional)
npm install aos
```

**Resources:**
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Tailwind UI Components](https://tailwindui.com)
- [Headless UI (unstyled components)](https://headlessui.com)
- [AOS Library](https://michalsnik.github.io/aos/)
