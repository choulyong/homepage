# Design Specifications
## metaldragon.co.kr Visual Design System

---

## Color Palette

### Primary Brand Colors

#### Teal (Primary Action)
```
teal-50:  #f4fffd  — Lightest tint (backgrounds)
teal-100: #e6fffa  — Light tint
teal-200: #b2f5ea  — Soft tint
teal-300: #81e6d9  — Medium tint
teal-400: #4fd1c5  — Hover state
teal-500: #3abab4  ★ Main brand color
teal-600: #319795  — Darker shade
teal-700: #2c7a7b  — Dark shade
teal-800: #285e61  — Darker
teal-900: #234e52  — Darkest
```

**Usage:**
- Primary CTA buttons: `bg-teal-500 hover:bg-teal-400`
- Links: `text-teal-500 dark:text-teal-400`
- Icons/Badges: `text-teal-500`
- Focus rings: `ring-teal-500`

---

#### Indigo/Purple (Gradient Secondary)
```
indigo-100: #ebf4ff  — Lightest
indigo-200: #c3dafe  — Light
indigo-300: #a3bffa  — Medium light
indigo-400: #7f9cf5  ★ Gradient end color
indigo-500: #667eea  — Main
indigo-600: #5a67d8  — Darker
indigo-700: #4c51bf  — Dark
indigo-800: #34399b  — Darker
indigo-900: #1e2156  — Darkest
```

**Usage:**
- Gradient combinations: `from-teal-500 to-indigo-400`
- Secondary actions: `bg-indigo-500 hover:bg-indigo-400`
- Decorative elements: `text-indigo-400`

---

### Grayscale (Text & Backgrounds)

#### Light Mode
```
gray-50:  #f9fafb  — Page background
gray-100: #f3f4f6  — Card/section backgrounds
gray-200: #e5e7eb  — Borders (light)
gray-300: #d1d5db  — Borders (medium)
gray-400: #9ca3af  — Disabled text
gray-500: #6b7280  — Placeholder text
gray-600: #4b5563  — Secondary text
gray-700: #374151  — Body text
gray-800: #1f2937  — Headings
gray-900: #111827  — Primary headings
```

#### Dark Mode
```
dark:bg-gray-950  — Darkest background
dark:bg-gray-900  — Page background
dark:bg-gray-800  — Card backgrounds
dark:bg-gray-700  — Hover states
dark:text-gray-100 — Primary text (white-ish)
dark:text-gray-300 — Body text
dark:text-gray-400 — Secondary text
dark:border-gray-700 — Borders
```

---

### Gradient Definitions

#### Logo Gradient
```css
background: linear-gradient(135deg, #3ABAB4 0%, #7F9CF5 100%);
```
**Tailwind:** `bg-gradient-to-r from-teal-500 to-indigo-400`

#### Hero Background Gradient (Light)
```css
background: linear-gradient(to bottom right, #f9fafb 0%, #e5e7eb 100%);
```
**Tailwind:** `bg-gradient-to-br from-gray-50 to-gray-200`

#### Hero Background Gradient (Dark)
```css
background: linear-gradient(to bottom right, #111827 0%, #1f2937 100%);
```
**Tailwind:** `bg-gradient-to-br from-gray-900 to-gray-800`

#### Radial Glow (Light Mode Only)
```svg
<radialGradient id="heroglow">
  <stop offset="0%" stop-color="#3ABAB4" stop-opacity="0.4" />
  <stop offset="100%" stop-color="#3ABAB4" stop-opacity="0" />
</radialGradient>
```

---

## Typography

### Font Families

#### Display Font (Headings)
**Name:** Red Hat Display
**Weights:** 500 (Medium), 700 (Bold), 900 (Black)
**Usage:** Hero titles, section headings, logo text

```tsx
<h1 className="font-display font-extrabold">Metaldragon Control Room</h1>
```

**Google Fonts Import:**
```tsx
import { Red_Hat_Display } from 'next/font/google';

const redHat = Red_Hat_Display({
  subsets: ['latin'],
  weight: ['500', '700', '900'],
  display: 'swap',
  variable: '--font-display',
});
```

---

#### Body Font
**Name:** Inter
**Weights:** 400 (Regular), 500 (Medium), 700 (Bold)
**Usage:** Body text, UI elements, navigation

```tsx
<p className="font-sans font-normal">Body content here</p>
```

**Google Fonts Import:**
```tsx
import { Inter } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  display: 'swap',
  variable: '--font-inter',
});
```

---

### Font Size Scale

| Size | Tailwind | Pixels | Usage |
|------|----------|--------|-------|
| xs | `text-xs` | 12px | Captions, small labels |
| sm | `text-sm` | 14px | Helper text, metadata |
| base | `text-base` | 16px | Body text (default) |
| lg | `text-lg` | 18px | Large body text |
| xl | `text-xl` | 20px | Subheadings |
| 2xl | `text-2xl` | 24px | Section titles |
| 3xl | `text-3xl` | 30px | Page titles |
| 4xl | `text-4xl` | 36px | Hero subtitles |
| 5xl | `text-5xl` | 48px | Hero titles |
| 6xl | `text-6xl` | 60px | Large hero titles |

**Responsive Text Example:**
```tsx
<h1 className="text-4xl md:text-5xl lg:text-6xl">
  Responsive Heading
</h1>
```

---

### Font Weights

| Weight | Tailwind | Value | Usage |
|--------|----------|-------|-------|
| Normal | `font-normal` | 400 | Body text |
| Medium | `font-medium` | 500 | Navigation, labels |
| Semibold | `font-semibold` | 600 | Card titles |
| Bold | `font-bold` | 700 | Headings |
| Extrabold | `font-extrabold` | 800 | Hero titles |

---

### Line Heights

| Tailwind | Value | Usage |
|----------|-------|-------|
| `leading-tight` | 1.25 | Headings |
| `leading-snug` | 1.375 | Subheadings |
| `leading-normal` | 1.5 | Default |
| `leading-relaxed` | 1.625 | Body text |
| `leading-loose` | 2 | Spacious text |

---

### Text Color Guidelines

#### Light Mode
```tsx
// Primary headings
<h1 className="text-gray-900">Main Title</h1>

// Body text
<p className="text-gray-700">Body content</p>

// Secondary text
<span className="text-gray-600">Metadata</span>

// Disabled text
<span className="text-gray-400">Disabled</span>

// Links
<a className="text-teal-500 hover:text-teal-600">Link</a>
```

#### Dark Mode
```tsx
// Primary headings
<h1 className="text-gray-900 dark:text-gray-100">Main Title</h1>

// Body text
<p className="text-gray-700 dark:text-gray-300">Body content</p>

// Secondary text
<span className="text-gray-600 dark:text-gray-400">Metadata</span>

// Links
<a className="text-teal-500 dark:text-teal-400">Link</a>
```

---

## Spacing & Layout

### Spacing Scale (4px base unit)

| Tailwind | Pixels | Usage |
|----------|--------|-------|
| `p-1` | 4px | Tight padding |
| `p-2` | 8px | Small padding |
| `p-3` | 12px | Compact padding |
| `p-4` | 16px | Standard padding |
| `p-6` | 24px | Medium padding |
| `p-8` | 32px | Large padding |
| `p-12` | 48px | XL padding |
| `p-16` | 64px | XXL padding |

**Same applies to:**
- Margin: `m-*`
- Gap: `gap-*`

---

### Container Widths

```tsx
// Maximum content width (1280px)
<div className="max-w-6xl mx-auto px-4 sm:px-6">
  Content
</div>

// Narrow content (768px)
<div className="max-w-3xl mx-auto px-4">
  Narrow content
</div>

// Full width with padding
<div className="w-full px-4 sm:px-6 lg:px-8">
  Full width
</div>
```

---

### Grid Layouts

#### Auto-fit Grid
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {items.map(item => <Card key={item.id} {...item} />)}
</div>
```

#### Feature Grid (appy-html style)
```tsx
<div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
  <FeatureCard />
  <FeatureCard />
  <FeatureCard />
</div>
```

---

## Shadows & Elevation

### Shadow Scale

| Tailwind | Usage | Example |
|----------|-------|---------|
| `shadow-sm` | Subtle elevation | Input fields |
| `shadow` | Default card | Cards, dropdowns |
| `shadow-md` | Medium elevation | Hover cards |
| `shadow-lg` | High elevation | Modals, popovers |
| `shadow-xl` | Maximum elevation | Hero images |
| `shadow-2xl` | Ultra elevation | Feature images |

**Dark Mode Shadows:**
```tsx
<div className="shadow-lg dark:shadow-2xl dark:shadow-gray-900/50">
  Card with dark mode shadow
</div>
```

---

### Glassmorphism Effect

#### Light Glassmorphism
```tsx
<div className="backdrop-blur-md bg-white/15 border border-white/20 shadow-lg">
  Glass card content
</div>
```

#### Dark Glassmorphism
```tsx
<div className="backdrop-blur-md bg-gray-800/30 border border-gray-700/50 shadow-xl">
  Dark glass card
</div>
```

#### Combined (Responsive to theme)
```tsx
<div className="backdrop-blur-md bg-white/15 dark:bg-gray-800/30 border border-white/20 dark:border-gray-700/50 shadow-lg">
  Adaptive glass card
</div>
```

---

## Border Radius

| Tailwind | Pixels | Usage |
|----------|--------|-------|
| `rounded-sm` | 2px | Subtle rounding |
| `rounded` | 4px | Default |
| `rounded-md` | 6px | Input fields |
| `rounded-lg` | 8px | Buttons, cards |
| `rounded-xl` | 12px | Large cards |
| `rounded-2xl` | 16px | Hero images |
| `rounded-full` | 9999px | Pills, avatars |

---

## Animations & Transitions

### Transition Durations

```tsx
// Fast (150ms)
<button className="transition-colors duration-150">

// Default (200ms)
<div className="transition-all duration-200">

// Slow (300ms)
<div className="transition-transform duration-300">

// Slower (500ms)
<div className="transition-opacity duration-500">
```

---

### Hover Effects

#### Card Lift
```tsx
<div className="transition-all duration-300 hover:-translate-y-2 hover:shadow-xl">
  Lifts on hover
</div>
```

#### Button Lift (Subtle)
```tsx
<button className="transition-transform duration-150 hover:-translate-y-0.5">
  Lifts slightly
</button>
```

#### Gradient Shift (Animated)
```css
/* globals.css */
@keyframes gradientShift {
  0%, 100% { transform: translateX(0) translateY(0); }
  50% { transform: translateX(10%) translateY(10%); }
}

.animate-gradient-shift {
  animation: gradientShift 8s ease infinite;
}
```

---

### AOS (Animate On Scroll)

**Installation:**
```bash
npm install aos
```

**Setup:**
```tsx
// app/layout.tsx
import AOS from 'aos';
import 'aos/dist/aos.css';

useEffect(() => {
  AOS.init({
    duration: 800,
    easing: 'ease-out',
    once: true,
    offset: 50,
  });
}, []);
```

**Usage:**
```tsx
<div data-aos="fade-up">Fades up on scroll</div>
<div data-aos="fade-up" data-aos-delay="100">Delayed fade</div>
<div data-aos="zoom-in">Zooms in</div>
<div data-aos="fade-left">Slides from right</div>
```

---

## Component Patterns

### 1. Primary Button

```tsx
<button className="
  inline-flex items-center justify-center
  px-6 py-3
  bg-teal-500 hover:bg-teal-400
  text-white font-medium
  rounded-lg
  shadow-sm
  transition-all duration-150
  hover:-translate-y-0.5
  focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2
">
  Primary Action
</button>
```

---

### 2. Secondary Button

```tsx
<button className="
  inline-flex items-center justify-center
  px-6 py-3
  bg-white dark:bg-gray-800
  text-gray-700 dark:text-gray-300
  font-medium
  border-2 border-gray-300 dark:border-gray-600
  rounded-lg
  transition-colors duration-150
  hover:border-teal-500 hover:text-teal-500
  focus:outline-none focus:ring-2 focus:ring-teal-500
">
  Secondary Action
</button>
```

---

### 3. Card Component

```tsx
<article className="
  bg-white dark:bg-gray-800
  rounded-xl
  p-8
  shadow-md
  transition-all duration-300
  hover:shadow-xl hover:-translate-y-2
  border border-gray-100 dark:border-gray-700
">
  <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
    Card Title
  </h3>
  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
    Card content goes here.
  </p>
</article>
```

---

### 4. Feature Card (with Icon)

```tsx
<div className="
  relative
  bg-white dark:bg-gray-800
  rounded-lg
  p-8
  shadow-md hover:shadow-xl
  transition-shadow duration-300
  group
">
  {/* Gradient Icon */}
  <div className="
    flex items-center justify-center
    w-16 h-16
    bg-gradient-to-br from-teal-500 to-indigo-400
    rounded-lg
    mb-4
    group-hover:scale-110
    transition-transform
  ">
    <span className="text-white text-2xl">📚</span>
  </div>

  {/* Content */}
  <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
    Feature Title
  </h3>
  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
    Feature description here.
  </p>

  {/* Optional Link */}
  <a href="#" className="
    inline-flex items-center
    text-teal-500 dark:text-teal-400
    font-medium
    mt-4
    group-hover:translate-x-2
    transition-transform
  ">
    Learn more →
  </a>
</div>
```

---

### 5. Input Field

```tsx
<div className="mb-4">
  <label className="
    block
    text-sm font-medium
    text-gray-700 dark:text-gray-300
    mb-2
  ">
    Label
  </label>
  <input
    type="text"
    className="
      w-full
      px-4 py-3
      bg-white dark:bg-gray-800
      border border-gray-300 dark:border-gray-600
      rounded-lg
      text-gray-900 dark:text-gray-100
      placeholder:text-gray-400 dark:placeholder:text-gray-500
      focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent
      transition-all duration-200
    "
    placeholder="Enter text..."
  />
</div>
```

---

### 6. Badge/Tag

```tsx
<span className="
  inline-block
  px-3 py-1
  text-xs font-medium
  text-teal-600 dark:text-teal-400
  bg-teal-50 dark:bg-teal-900/20
  rounded-full
">
  Category
</span>
```

---

## Dark Mode Implementation

### 1. Initialize Dark Mode

```tsx
// app/layout.tsx
export default function RootLayout({ children }) {
  return (
    <html lang="ko" className="">
      <head>
        {/* Prevent flash of unstyled content */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if (localStorage.getItem('dark-mode') === 'true' || !('dark-mode' in localStorage)) {
                document.documentElement.classList.add('dark');
              }
            `,
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
```

---

### 2. Dark Mode Toggle Component

```tsx
'use client';

import { useEffect, useState } from 'react';

export function DarkModeToggle() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const darkMode = localStorage.getItem('dark-mode') === 'true' ||
                     !('dark-mode' in localStorage);
    setIsDark(darkMode);
    if (darkMode) {
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggle = () => {
    const newDarkMode = !isDark;
    setIsDark(newDarkMode);
    localStorage.setItem('dark-mode', String(newDarkMode));
    document.documentElement.classList.toggle('dark');
  };

  return (
    <button
      onClick={toggle}
      className="
        relative w-11 h-6
        bg-gradient-to-t from-gray-100 to-white dark:from-gray-800 dark:to-gray-700
        rounded-full
        shadow-sm
        transition-colors
      "
    >
      <span className={`
        absolute top-0.5 left-0.5
        w-5 h-5
        bg-white dark:bg-gray-900
        rounded-full
        shadow-sm
        transition-transform duration-150
        ${isDark ? 'translate-x-5' : 'translate-x-0'}
      `} />
    </button>
  );
}
```

---

### 3. Color Mode Patterns

#### Background Colors
```tsx
// Page background
<div className="bg-white dark:bg-gray-900">

// Card background
<div className="bg-gray-50 dark:bg-gray-800">

// Hover background
<div className="hover:bg-gray-100 dark:hover:bg-gray-700">
```

#### Text Colors
```tsx
// Primary text
<p className="text-gray-900 dark:text-gray-100">

// Body text
<p className="text-gray-700 dark:text-gray-300">

// Muted text
<p className="text-gray-600 dark:text-gray-400">
```

#### Border Colors
```tsx
<div className="border border-gray-200 dark:border-gray-700">
```

---

## Responsive Design

### Breakpoints

| Tailwind | Min Width | Usage |
|----------|-----------|-------|
| `sm:` | 640px | Small tablets |
| `md:` | 768px | Tablets |
| `lg:` | 1024px | Laptops |
| `xl:` | 1280px | Desktops |
| `2xl:` | 1536px | Large screens |

---

### Mobile-First Examples

#### Responsive Text
```tsx
<h1 className="
  text-3xl
  sm:text-4xl
  md:text-5xl
  lg:text-6xl
">
  Responsive Heading
</h1>
```

#### Responsive Grid
```tsx
<div className="
  grid
  grid-cols-1
  sm:grid-cols-2
  lg:grid-cols-3
  xl:grid-cols-4
  gap-4
  md:gap-6
">
  {items.map(item => <Card />)}
</div>
```

#### Responsive Padding
```tsx
<section className="
  px-4
  sm:px-6
  lg:px-8
  py-8
  md:py-12
  lg:py-16
">
  Content
</section>
```

#### Hide/Show Elements
```tsx
// Hide on mobile, show on desktop
<nav className="hidden md:flex">Desktop Nav</nav>

// Show on mobile, hide on desktop
<button className="block md:hidden">Mobile Menu</button>
```

---

## Accessibility Guidelines

### 1. Focus States
**Always include visible focus states:**
```tsx
<button className="
  focus:outline-none
  focus:ring-2
  focus:ring-teal-500
  focus:ring-offset-2
">
  Accessible Button
</button>
```

---

### 2. Color Contrast

**Minimum ratios (WCAG AA):**
- Normal text (16px): 4.5:1
- Large text (24px+): 3:1
- UI components: 3:1

**Compliant combinations:**
- White bg + `text-gray-700` (7.5:1) ✅
- Dark bg + `text-gray-200` (12:1) ✅
- Teal-500 + white (3.1:1) ✅ (large text only)

---

### 3. Semantic HTML

```tsx
// Use semantic elements
<header>, <nav>, <main>, <section>, <article>, <aside>, <footer>

// Add ARIA labels
<button aria-label="Close menu">
  <svg>...</svg>
</button>

// Use proper heading hierarchy
<h1> → <h2> → <h3> (no skipping levels)
```

---

### 4. Keyboard Navigation

```tsx
// Ensure all interactive elements are keyboard accessible
<div
  role="button"
  tabIndex={0}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      handleClick();
    }
  }}
>
  Custom button
</div>
```

---

## Icon System

### Recommended Icon Library
**Heroicons** (Tailwind's official icons)

```bash
npm install @heroicons/react
```

**Usage:**
```tsx
import { ChevronRightIcon } from '@heroicons/react/24/outline';

<ChevronRightIcon className="w-5 h-5 text-gray-400" />
```

**Emoji as Icons (appy-html style):**
```tsx
<div className="text-4xl">📚</div>
<div className="text-2xl">📊</div>
```

---

## Performance Best Practices

### 1. Image Optimization

```tsx
import Image from 'next/image';

<Image
  src="/hero-image.jpg"
  alt="Hero"
  width={1200}
  height={600}
  priority // Above the fold
  className="rounded-lg shadow-2xl"
/>
```

---

### 2. Font Loading

```tsx
import { Inter, Red_Hat_Display } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap', // Prevent FOIT
  preload: true,
});
```

---

### 3. Critical CSS

Inline critical above-the-fold styles in `<head>` for fastest FCP.

---

## Browser Support

**Target browsers:**
- Chrome (last 2 versions)
- Firefox (last 2 versions)
- Safari (last 2 versions)
- Edge (last 2 versions)
- iOS Safari (last 2 versions)
- Chrome Mobile (last 2 versions)

**Tailwind CSS compatibility:** IE11 not supported (uses modern CSS features)

---

## Design Checklist

### Before Launch:
- [ ] All colors have dark mode variants
- [ ] Focus states visible on all interactive elements
- [ ] WCAG AA color contrast verified
- [ ] Responsive design tested (mobile, tablet, desktop)
- [ ] Dark mode toggle functional with localStorage
- [ ] Images optimized (WebP, lazy loading)
- [ ] Fonts loaded with `display: swap`
- [ ] AOS animations smooth (60fps)
- [ ] Keyboard navigation tested
- [ ] Screen reader compatibility verified
- [ ] Performance (Lighthouse 90+ score)

---

**Design System Version:** 1.0
**Based on:** appy-html template + metaldragon brand
**Last Updated:** 2025-10-04
