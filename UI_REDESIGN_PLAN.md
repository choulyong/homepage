# metaldragon.co.kr UI Redesign Plan
## Based on appy-html Template Design System

---

## Executive Summary

This document outlines a comprehensive UI redesign strategy to transform the current metaldragon.co.kr website from its Emotion CSS-in-JS glassmorphism design to match the clean, modern aesthetic of the appy-html template. The redesign maintains all existing functionality while adopting Tailwind CSS v4, Alpine.js interactivity patterns, and a teal-to-purple gradient design language.

**Key Objectives:**
- Migrate from Emotion CSS-in-JS to Tailwind CSS v4
- Implement dark/light mode toggle with localStorage persistence
- Adopt appy-html's clean, gradient-based design language
- Maintain 100% feature parity with current implementation
- Ensure mobile-first responsive design
- Preserve Next.js 15 + Supabase architecture

**Timeline:** 3-4 weeks (Phased Implementation)

---

## Design System Analysis

### 1. appy-html Design Tokens

#### Color Palette
```javascript
// Primary Brand Colors
const colors = {
  // Teal (Primary Action Color)
  teal: {
    50: '#f4fffd',
    100: '#e6fffa',
    200: '#b2f5ea',
    300: '#81e6d9',
    400: '#4fd1c5',
    500: '#3abab4',  // Main brand color
    600: '#319795',
    700: '#2c7a7b',
    800: '#285e61',
    900: '#234e52',
  },

  // Indigo/Purple (Secondary Gradient)
  indigo: {
    100: '#ebf4ff',
    200: '#c3dafe',
    300: '#a3bffa',
    400: '#7f9cf5',  // Gradient end
    500: '#667eea',
    600: '#5a67d8',
    700: '#4c51bf',
    800: '#34399b',
    900: '#1e2156',
  },

  // Grayscale (Text & Backgrounds)
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
  },
};
```

#### Logo Gradient
```css
/* Signature teal-to-purple gradient */
.logo-gradient {
  background: linear-gradient(135deg, #3ABAB4 0%, #7F9CF5 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}
```

#### Typography System
```javascript
const typography = {
  fontFamily: {
    display: 'Red Hat Display, sans-serif',  // Headings (weight: 500, 700, 900)
    sans: 'Inter, system-ui, sans-serif',     // Body (weight: 400, 500, 700)
  },
  fontSize: {
    xs: '0.75rem',    // 12px
    sm: '0.875rem',   // 14px
    base: '1rem',     // 16px
    lg: '1.125rem',   // 18px
    xl: '1.25rem',    // 20px
    '2xl': '1.5rem',  // 24px
    '3xl': '1.875rem',// 30px
    '4xl': '2.25rem', // 36px
    '5xl': '3rem',    // 48px
  },
};
```

#### Spacing & Layout
```javascript
// 4px base unit (Tailwind default)
const spacing = {
  1: '0.25rem',  // 4px
  2: '0.5rem',   // 8px
  3: '0.75rem',  // 12px
  4: '1rem',     // 16px
  5: '1.25rem',  // 20px
  6: '1.5rem',   // 24px
  8: '2rem',     // 32px
  10: '2.5rem',  // 40px
  12: '3rem',    // 48px
  16: '4rem',    // 64px
  20: '5rem',    // 80px
};
```

#### Shadows & Effects
```css
/* Clean, modern shadow system */
.shadow-sm { box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05); }
.shadow-md { box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }
.shadow-lg { box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1); }
.shadow-xl { box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1); }
.shadow-2xl { box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25); }
```

#### Dark Mode Implementation
```javascript
// appy-html dark mode strategy
// 1. localStorage persistence
if (localStorage.getItem('dark-mode') === 'true' || !('dark-mode' in localStorage)) {
  document.querySelector('html').classList.add('dark');
}

// 2. Tailwind dark: variants
// dark:bg-gray-900 dark:text-gray-100

// 3. Toggle switch component
<input type="checkbox" class="light-switch" />
<label class="bg-gradient-to-t from-gray-100 to-white dark:from-gray-800 dark:to-gray-700">
  <!-- Sun/Moon icons -->
</label>
```

#### Animation & Transitions
```css
/* Smooth, intentional animations */
.transition-base {
  transition: all 150ms cubic-bezier(0.4, 0, 0.2, 1);
}

/* AOS (Animate On Scroll) integration */
[data-aos="fade-up"] {
  transform: translate3d(0, 16px, 0);
  opacity: 0;
}

/* Gradient animation */
@keyframes gradientShift {
  0%, 100% { transform: translateX(0) translateY(0); }
  50% { transform: translateX(10%) translateY(10%); }
}
```

---

## Component Design Specifications

### 1. Header/Navigation Component

**Current Implementation:** Emotion-based glassmorphism sticky header
**Target Design:** Clean, absolute positioned header with gradient logo

```tsx
// New Tailwind-based Header Component
'use client';

import Link from 'next/link';
import { useState } from 'react';

export function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);

  return (
    <header className="absolute w-full z-30">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-20">

          {/* Logo with Gradient */}
          <Link href="/" className="shrink-0">
            <svg className="w-8 h-8" viewBox="0 0 32 32">
              <defs>
                <linearGradient id="logo_gradient" x1="26%" y1="100%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#3ABAB4" />
                  <stop offset="100%" stopColor="#7F9CF5" />
                </linearGradient>
              </defs>
              {/* Logo paths */}
            </svg>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex md:grow">
            <ul className="flex grow flex-wrap items-center font-medium">
              <li>
                <Link
                  href="/about"
                  className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100 px-5 py-2 flex items-center transition duration-150"
                >
                  About
                </Link>
              </li>
              {/* More nav items */}
            </ul>

            {/* Dark Mode Toggle */}
            <div className="form-switch flex flex-col justify-center ml-3">
              <input
                type="checkbox"
                id="light-switch"
                className="light-switch sr-only"
                checked={isDark}
                onChange={(e) => {
                  setIsDark(e.target.checked);
                  document.documentElement.classList.toggle('dark');
                  localStorage.setItem('dark-mode', String(e.target.checked));
                }}
              />
              <label htmlFor="light-switch" className="relative">
                <span className="relative bg-gradient-to-t from-gray-100 to-white dark:from-gray-800 dark:to-gray-700 shadow-xs z-10" />
                {/* Sun/Moon SVG */}
              </label>
            </div>

            {/* CTA Button */}
            <Link
              href="/contact"
              className="btn-sm text-white bg-teal-500 hover:bg-teal-400 ml-6"
            >
              문의하기
            </Link>
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="hamburger md:hidden"
            onClick={() => setIsOpen(!isOpen)}
          >
            <svg className="w-6 h-6 fill-current text-gray-900 dark:text-gray-300">
              <rect y="4" width="24" height="2" rx="1" />
              <rect y="11" width="24" height="2" rx="1" />
              <rect y="18" width="24" height="2" rx="1" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}
```

**Key Changes:**
- Replace `styled-components` with Tailwind utility classes
- Add `dark:` variants for all color-dependent styles
- Implement localStorage-based dark mode persistence
- Use `bg-teal-500` as primary CTA color
- Absolute positioning instead of sticky (matches appy-html)

---

### 2. Hero Section Component

**Current:** Glassmorphism with kinetic gradient overlay
**Target:** Clean gradient background with animated radial glow effects

```tsx
// Hero Section with appy-html styling
export function HeroSection() {
  return (
    <section className="relative">
      {/* Gradient Background */}
      <div
        className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-900 dark:to-gray-800 pointer-events-none"
        aria-hidden="true"
      >
        {/* Radial gradient glow (light mode only) */}
        <svg className="absolute left-1/2 top-0 -translate-x-1/2 dark:hidden" width="800" height="520">
          <defs>
            <radialGradient id="heroglow_paint0" cx="0" cy="0" r="1">
              <stop offset="0%" stopColor="#3ABAB4" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#3ABAB4" stopOpacity="0" />
            </radialGradient>
          </defs>
          <circle cx="400" cy="100" r="400" fill="url(#heroglow_paint0)" />
        </svg>
      </div>

      {/* Content */}
      <div className="relative max-w-6xl mx-auto px-4 sm:px-6">
        <div className="pt-32 pb-16 md:pt-52 md:pb-20">

          {/* Hero Text */}
          <div className="max-w-3xl mx-auto text-center">
            <h1
              className="font-extrabold text-4xl md:text-5xl lg:text-6xl mb-6"
              data-aos="fade-up"
            >
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-teal-500 to-indigo-400">
                Metaldragon Control Room
              </span>
            </h1>

            <p
              className="text-xl text-gray-600 dark:text-gray-300 mb-10"
              data-aos="fade-up"
              data-aos-delay="100"
            >
              실시간 학습, 재무 관리, AI 창작물을 하나의 운영 패널에서
            </p>

            {/* CTA Buttons */}
            <div
              className="flex flex-col sm:flex-row gap-4 justify-center"
              data-aos="fade-up"
              data-aos-delay="200"
            >
              <Link
                href="/board/ai_study"
                className="btn text-white bg-teal-500 hover:bg-teal-400"
              >
                스터디 시작하기
              </Link>
              <Link
                href="/about"
                className="btn text-gray-600 bg-white hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                더 알아보기
              </Link>
            </div>
          </div>

          {/* Hero Image/Illustration */}
          <div
            className="max-w-3xl mx-auto mt-16"
            data-aos="zoom-in"
            data-aos-delay="300"
          >
            <img
              src="/hero-dashboard.png"
              alt="Dashboard Preview"
              className="w-full shadow-2xl rounded-lg"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
```

**Key Changes:**
- Remove Emotion `styled-components`
- Use Tailwind gradient utilities: `bg-gradient-to-r from-teal-500 to-indigo-400`
- Add AOS (Animate On Scroll) data attributes
- Implement SVG radial gradient glow (light mode only)
- Clean, minimal shadow approach (`shadow-2xl`)

---

### 3. Feature Card Component

**Current:** Glassmorphism cards with hover lift
**Target:** Clean white cards with subtle shadow and teal accent

```tsx
// Feature Card Component
interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  href?: string;
}

export function FeatureCard({ icon, title, description, href }: FeatureCardProps) {
  const CardWrapper = href ? Link : 'div';

  return (
    <CardWrapper
      href={href || '#'}
      className="relative bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 p-8 group"
      data-aos="fade-up"
    >
      {/* Icon */}
      <div className="flex items-center justify-center w-16 h-16 rounded-lg bg-gradient-to-br from-teal-500 to-indigo-400 mb-4 group-hover:scale-110 transition-transform">
        <div className="text-white text-2xl">
          {icon}
        </div>
      </div>

      {/* Title */}
      <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
        {title}
      </h3>

      {/* Description */}
      <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
        {description}
      </p>

      {/* Optional CTA */}
      {href && (
        <div className="inline-flex items-center text-teal-500 dark:text-teal-400 font-medium group-hover:translate-x-2 transition-transform">
          더 알아보기
          <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      )}
    </CardWrapper>
  );
}
```

**Usage:**
```tsx
<FeatureCard
  icon={<span>📚</span>}
  title="스터디 게시판"
  description="AI, 빅데이터처리기사 등 다양한 주제의 스터디 자료를 공유하고 토론하세요."
  href="/board/ai_study"
/>
```

---

### 4. Admin Sidebar Component

**Current:** Glassmorphism sidebar with gradient text
**Target:** Solid dark sidebar with teal accent highlights

```tsx
// Admin Sidebar
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const adminLinks = [
  { href: '/admin', label: '대시보드', icon: '📊' },
  { href: '/admin/posts', label: '게시물 관리', icon: '📝' },
  { href: '/admin/news', label: '뉴스 관리', icon: '📰' },
  { href: '/admin/youtube', label: 'YouTube 관리', icon: '🎵' },
  { href: '/admin/finance', label: '재무 관리', icon: '💰' },
  { href: '/admin/contacts', label: '문의 관리', icon: '📧' },
  { href: '/admin/about', label: 'About 관리', icon: '👤' },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 h-screen w-72 bg-gray-900 dark:bg-gray-950 border-r border-gray-800 overflow-y-auto">
      {/* Logo */}
      <div className="p-6 border-b border-gray-800">
        <Link href="/admin" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-teal-500 to-indigo-400 flex items-center justify-center text-white font-bold text-xl">
            M
          </div>
          <span className="text-xl font-bold text-white">Admin Panel</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="p-4">
        <ul className="space-y-2">
          {adminLinks.map((link) => {
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

      {/* Bottom Section */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-800">
        <Link
          href="/"
          className="flex items-center gap-2 px-4 py-2 text-gray-400 hover:text-gray-200 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span>사이트로 돌아가기</span>
        </Link>
      </div>
    </aside>
  );
}
```

**Key Changes:**
- Dark sidebar (`bg-gray-900`) with teal active state
- Active link uses `bg-teal-500/10 text-teal-400`
- Gradient logo badge (M letter)
- Fixed positioning with smooth scroll

---

### 5. Button Component Library

**Current:** Emotion-based button variants
**Target:** Tailwind utility classes with variants

```tsx
// Button Component (Tailwind-based)
import { cn } from '@/lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  className,
  children,
  ...props
}: ButtonProps) {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-lg transition-colors duration-150';

  const variants = {
    primary: 'text-white bg-teal-500 hover:bg-teal-400 shadow-sm',
    secondary: 'text-white bg-indigo-500 hover:bg-indigo-400 shadow-sm',
    outline: 'text-gray-600 dark:text-gray-300 bg-transparent border-2 border-gray-300 dark:border-gray-600 hover:border-teal-500 hover:text-teal-500',
    ghost: 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800',
  };

  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  };

  return (
    <button
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      {...props}
    >
      {children}
    </button>
  );
}

// Utility function for className merging
export function cn(...classes: (string | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}
```

---

## Migration Roadmap

### Phase 1: Foundation Setup (Week 1)

**Goal:** Establish Tailwind v4 infrastructure and dark mode system

#### Tasks:
1. **Install Tailwind CSS v4**
   ```bash
   npm install tailwindcss@next @tailwindcss/postcss@next
   ```

2. **Configure Tailwind**
   ```typescript
   // tailwind.config.ts
   import type { Config } from 'tailwindcss';

   const config: Config = {
     content: [
       './src/app/**/*.{js,ts,jsx,tsx,mdx}',
       './src/components/**/*.{js,ts,jsx,tsx,mdx}',
     ],
     darkMode: 'class', // Enable class-based dark mode
     theme: {
       extend: {
         colors: {
           teal: {
             50: '#f4fffd',
             100: '#e6fffa',
             200: '#b2f5ea',
             300: '#81e6d9',
             400: '#4fd1c5',
             500: '#3abab4',
             600: '#319795',
             700: '#2c7a7b',
             800: '#285e61',
             900: '#234e52',
           },
           indigo: {
             100: '#ebf4ff',
             200: '#c3dafe',
             300: '#a3bffa',
             400: '#7f9cf5',
             500: '#667eea',
             600: '#5a67d8',
             700: '#4c51bf',
             800: '#34399b',
             900: '#1e2156',
           },
         },
         fontFamily: {
           display: ['Red Hat Display', 'sans-serif'],
           sans: ['Inter', 'system-ui', 'sans-serif'],
         },
       },
     },
     plugins: [],
   };

   export default config;
   ```

3. **Setup Dark Mode Provider**
   ```tsx
   // src/app/providers.tsx
   'use client';

   import { useEffect, useState } from 'react';

   export function Providers({ children }: { children: React.ReactNode }) {
     const [mounted, setMounted] = useState(false);

     useEffect(() => {
       setMounted(true);

       // Initialize dark mode from localStorage
       const isDark = localStorage.getItem('dark-mode') === 'true' ||
                      !('dark-mode' in localStorage);

       if (isDark) {
         document.documentElement.classList.add('dark');
       }
     }, []);

     if (!mounted) return null;

     return <>{children}</>;
   }
   ```

4. **Create Utility Classes**
   ```css
   /* src/app/globals.css */
   @import 'tailwindcss';

   /* Custom utilities */
   @layer components {
     .btn {
       @apply inline-flex items-center justify-center font-medium rounded-lg transition-colors duration-150;
     }

     .btn-sm {
       @apply px-4 py-2 text-sm;
     }

     .btn-md {
       @apply px-6 py-3 text-base;
     }

     .btn-lg {
       @apply px-8 py-4 text-lg;
     }
   }
   ```

**Deliverables:**
- ✅ Tailwind v4 installed and configured
- ✅ Dark mode system operational
- ✅ Design tokens (colors, fonts) defined
- ✅ Base utility classes created

---

### Phase 2: Core Components (Week 2)

**Goal:** Rebuild navigation, hero, and layout components

#### Tasks:
1. **Redesign Header Component**
   - Implement gradient logo
   - Add dark mode toggle switch
   - Create mobile hamburger menu
   - Update navigation links styling

2. **Redesign Hero Section**
   - Add radial gradient glow effect (SVG)
   - Implement gradient text for title
   - Update CTA buttons with teal primary color
   - Add AOS animations

3. **Create Reusable Components**
   - Button variants (primary, secondary, outline, ghost)
   - Card component with hover effects
   - Form input components with focus states
   - Badge/Tag components

4. **Update Footer**
   - Clean layout with social links
   - Newsletter signup form
   - Copyright and links section

**Testing:**
- Responsive design (mobile, tablet, desktop)
- Dark mode toggle functionality
- Accessibility (keyboard navigation, screen readers)

**Deliverables:**
- ✅ New Header with dark mode
- ✅ New Hero section with animations
- ✅ Component library foundation
- ✅ Responsive layouts verified

---

### Phase 3: Page-Specific Designs (Week 3)

**Goal:** Apply new design system to all public pages

#### Tasks:
1. **Marketing Pages**
   - `/` (Home) - Hero + Features grid
   - `/about` - Team/Mission with image gallery
   - `/contact` - Contact form with validation
   - `/schedule` - Calendar view redesign

2. **Board/Content Pages**
   - `/board/[category]` - Post list with cards
   - `/board/[category]/[id]` - Post detail with comments
   - `/news` - News feed with auto-refresh
   - `/artworks` - Gallery grid with lightbox
   - `/youtube` - Video grid with thumbnails

3. **Feature-Specific Components**
   - Post card component
   - News item component
   - Artwork gallery item
   - YouTube video card
   - Comment system

**Design Pattern:**
```tsx
// Example: Post Card Component
export function PostCard({ post }) {
  return (
    <article className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-xl transition-shadow overflow-hidden group">
      {/* Featured Image */}
      {post.image && (
        <div className="aspect-video overflow-hidden">
          <img
            src={post.image}
            alt={post.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      )}

      {/* Content */}
      <div className="p-6">
        {/* Category Badge */}
        <span className="inline-block px-3 py-1 text-xs font-medium text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-900/20 rounded-full mb-3">
          {post.category}
        </span>

        {/* Title */}
        <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2 group-hover:text-teal-500 transition-colors">
          {post.title}
        </h3>

        {/* Excerpt */}
        <p className="text-gray-600 dark:text-gray-300 line-clamp-3 mb-4">
          {post.excerpt}
        </p>

        {/* Meta */}
        <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
          <span>{post.author}</span>
          <span>•</span>
          <span>{formatDate(post.created_at)}</span>
        </div>
      </div>
    </article>
  );
}
```

**Deliverables:**
- ✅ All marketing pages redesigned
- ✅ Board/content pages updated
- ✅ Feature components implemented
- ✅ Korean language support maintained

---

### Phase 4: Admin Panel & Forms (Week 4)

**Goal:** Redesign admin dashboard and form components

#### Tasks:
1. **Admin Layout**
   - Dark sidebar with teal accents
   - Breadcrumb navigation
   - User profile dropdown
   - Notification system

2. **Admin Pages**
   - `/admin` - Dashboard with metrics cards
   - `/admin/posts` - Post management table
   - `/admin/news` - News management with crawling
   - `/admin/youtube` - YouTube video management
   - `/admin/finance` - Financial dashboard
   - `/admin/contacts` - Contact form submissions

3. **Form Components**
   - Text inputs with floating labels
   - Select dropdowns (custom styled)
   - File upload with preview
   - Rich text editor integration
   - Form validation states

4. **Data Tables**
   - Sortable columns
   - Pagination controls
   - Search/filter inputs
   - Bulk actions (delete, export)

**Example: Admin Dashboard Card**
```tsx
export function MetricCard({ title, value, change, icon }) {
  const isPositive = change >= 0;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
          {title}
        </h3>
        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-teal-500 to-indigo-400 flex items-center justify-center text-white text-2xl">
          {icon}
        </div>
      </div>

      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          {value}
        </span>
        <span className={`text-sm font-medium ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
          {isPositive ? '↑' : '↓'} {Math.abs(change)}%
        </span>
      </div>
    </div>
  );
}
```

**Deliverables:**
- ✅ Admin panel redesigned
- ✅ Form components library
- ✅ Data table component
- ✅ Dashboard metrics cards

---

### Phase 5: Polish & Optimization (Final Week)

**Goal:** Performance optimization, accessibility, and final touches

#### Tasks:
1. **Performance**
   - Optimize images (WebP, lazy loading)
   - Code splitting for route-based chunks
   - Minimize Tailwind CSS output (PurgeCSS)
   - Font optimization (FOUT prevention)

2. **Accessibility**
   - ARIA labels for all interactive elements
   - Keyboard navigation improvements
   - Focus states for all buttons/links
   - Screen reader testing

3. **Animations**
   - Integrate AOS (Animate On Scroll) library
   - Add page transition animations
   - Micro-interactions (button hover, card lift)
   - Loading states and skeletons

4. **Cross-browser Testing**
   - Chrome, Firefox, Safari, Edge
   - Mobile browsers (iOS Safari, Chrome Mobile)
   - Dark mode consistency across browsers

5. **Documentation**
   - Component usage guide
   - Design system documentation
   - Tailwind utility class reference
   - Dark mode implementation guide

**Deliverables:**
- ✅ Performance metrics improved (Lighthouse score 90+)
- ✅ WCAG 2.1 AA compliance
- ✅ Smooth animations and transitions
- ✅ Complete documentation

---

## Technical Implementation Details

### 1. Dark Mode Toggle Component

```tsx
// src/components/ui/DarkModeToggle.tsx
'use client';

import { useEffect, useState } from 'react';

export function DarkModeToggle() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const darkMode = localStorage.getItem('dark-mode') === 'true';
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
      <label
        htmlFor="light-switch"
        className="relative cursor-pointer"
      >
        <span className="relative block w-11 h-6 bg-gradient-to-t from-gray-100 to-white dark:from-gray-800 dark:to-gray-700 rounded-full shadow-sm">
          <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white dark:bg-gray-900 rounded-full shadow-sm transition-transform duration-150 ${isDark ? 'translate-x-5' : 'translate-x-0'}`} />
        </span>

        {/* Sun/Moon Icon */}
        <svg className="absolute inset-0 pointer-events-none" width="44" height="24" viewBox="0 0 44 24">
          <g className="fill-current text-gray-400" fillRule="nonzero" opacity=".88">
            {/* Sun rays (visible in light mode) */}
            <path className={isDark ? 'opacity-0' : 'opacity-100'} d="M32 8a.5.5 0 00.5-.5v-1a.5.5 0 10-1 0v1a.5.5 0 00.5.5z..." />
            {/* Moon (visible in dark mode) */}
            <circle className={isDark ? 'opacity-100' : 'opacity-40'} cx="12" cy="12" r="6" />
          </g>
        </svg>
      </label>
    </div>
  );
}
```

### 2. Gradient Logo Component

```tsx
// src/components/ui/Logo.tsx
export function Logo({ className = '' }: { className?: string }) {
  return (
    <svg className={`w-8 h-8 ${className}`} viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient x1="26%" y1="100%" x2="100%" y2="100%" id="logo_a">
          <stop stopColor="#3ABAB4" offset="0%" />
          <stop stopColor="#7F9CF5" offset="100%" />
        </linearGradient>
        <linearGradient x1="26%" y1="100%" x2="100%" y2="100%" id="logo_b">
          <stop stopColor="#3ABAB4" offset="0%" />
          <stop stopColor="#3ABAB4" stopOpacity="0" offset="100%" />
        </linearGradient>
      </defs>
      <path d="M32 16h-8a8 8 0 10-16 0H0C0 7.163 7.163 0 16 0s16 7.163 16 16z" fill="url(#logo_a)" />
      <path d="M32 16c0 8.837-7.163 16-16 16S0 24.837 0 16h8a8 8 0 1016 0h8z" fill="url(#logo_b)" />
    </svg>
  );
}
```

### 3. AOS Animation Setup

```tsx
// src/app/layout.tsx
import AOS from 'aos';
import 'aos/dist/aos.css';

export default function RootLayout({ children }) {
  useEffect(() => {
    AOS.init({
      duration: 800,
      easing: 'ease-out',
      once: true,
      offset: 50,
    });
  }, []);

  return (
    <html lang="ko" className="">
      <body>{children}</body>
    </html>
  );
}
```

**Usage in components:**
```tsx
<div data-aos="fade-up">Content</div>
<div data-aos="fade-up" data-aos-delay="100">Delayed content</div>
<div data-aos="zoom-in">Zoom effect</div>
```

---

## Migration Strategy: Emotion to Tailwind

### Step-by-Step Conversion Process

**1. Identify Emotion Component:**
```tsx
// OLD: Emotion styled-component
const Button = styled.button`
  padding: ${props => props.size === 'sm' ? '0.5rem 1rem' : '0.75rem 1.5rem'};
  background: ${props => props.theme.colors.primary[500]};
  color: white;
  border-radius: 0.5rem;
  transition: all 200ms;

  &:hover {
    background: ${props => props.theme.colors.primary[400]};
    transform: translateY(-2px);
  }
`;
```

**2. Convert to Tailwind:**
```tsx
// NEW: Tailwind classes
function Button({ size = 'md', children, ...props }) {
  const sizeClasses = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  };

  return (
    <button
      className={`
        bg-teal-500 hover:bg-teal-400
        text-white rounded-lg
        transition-all duration-200
        hover:-translate-y-0.5
        ${sizeClasses[size]}
      `}
      {...props}
    >
      {children}
    </button>
  );
}
```

**3. Handle Complex Styles (CSS-in-JS):**
For animations or complex pseudo-elements, use Tailwind's `@layer` directive:

```css
/* src/app/globals.css */
@layer components {
  .hero-gradient-overlay {
    @apply absolute inset-0 pointer-events-none;
    background: linear-gradient(135deg, rgba(58, 186, 180, 0.1) 0%, rgba(127, 156, 245, 0.1) 100%);
    animation: gradientShift 8s ease infinite;
  }
}

@keyframes gradientShift {
  0%, 100% { transform: translateX(0) translateY(0); }
  50% { transform: translateX(10%) translateY(10%); }
}
```

**4. Theme Access (Tokens):**
```tsx
// OLD: Emotion theme prop
const Title = styled.h1`
  color: ${props => props.theme.colors.gray[900]};
  font-size: ${props => props.theme.typography.fontSize['4xl']};
`;

// NEW: Tailwind utilities
<h1 className="text-gray-900 dark:text-gray-100 text-4xl">Title</h1>
```

---

## Potential Challenges & Solutions

### Challenge 1: Next.js Server Components + Tailwind
**Issue:** Tailwind utilities might not work in RSC if not properly configured

**Solution:**
- Ensure `content` paths in `tailwind.config.ts` include all component directories
- Use `@tailwindcss/postcss` plugin
- Add `'use client'` directive for interactive components only

### Challenge 2: Dark Mode Flicker on Page Load
**Issue:** Brief flash of light mode before dark mode applies

**Solution:**
```tsx
// src/app/layout.tsx - Add blocking script in <head>
<script
  dangerouslySetInnerHTML={{
    __html: `
      if (localStorage.getItem('dark-mode') === 'true' || !('dark-mode' in localStorage)) {
        document.documentElement.classList.add('dark');
      }
    `,
  }}
/>
```

### Challenge 3: Complex Glassmorphism Effects
**Issue:** Tailwind doesn't have built-in glassmorphism utilities

**Solution:**
Create custom utility classes:
```css
@layer utilities {
  .glass-light {
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.18);
  }

  .glass-heavy {
    background: rgba(255, 255, 255, 0.25);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.3);
  }
}
```

### Challenge 4: Animation Performance
**Issue:** AOS animations might cause layout shift or performance issues

**Solution:**
- Use `will-change` sparingly
- Prefer `transform` and `opacity` animations (GPU-accelerated)
- Add `pointer-events: none` to decorative elements
- Test on low-end devices

### Challenge 5: TypeScript with Tailwind
**Issue:** No autocomplete for Tailwind classes in TypeScript

**Solution:**
- Install Tailwind CSS IntelliSense VSCode extension
- Use `clsx` or `cn` utility for conditional classes with types:
```tsx
import clsx from 'clsx';

function Button({ variant, className }) {
  return (
    <button className={clsx(
      'px-4 py-2 rounded-lg',
      {
        'bg-teal-500': variant === 'primary',
        'bg-gray-500': variant === 'secondary',
      },
      className
    )}>
      ...
    </button>
  );
}
```

---

## Testing & Quality Assurance

### 1. Visual Regression Testing
- Use Percy or Chromatic for screenshot comparisons
- Test all pages in light/dark mode
- Verify responsive breakpoints (mobile, tablet, desktop)

### 2. Performance Testing
```bash
# Lighthouse CI
npm install -g @lhci/cli
lhci autorun --collect.url=http://localhost:3000

# Target Scores:
# Performance: 90+
# Accessibility: 95+
# Best Practices: 95+
# SEO: 95+
```

### 3. Accessibility Testing
- Keyboard navigation (Tab, Enter, Escape)
- Screen reader testing (NVDA, JAWS, VoiceOver)
- Color contrast (WCAG AA: 4.5:1 for text)
- Focus indicators visible

### 4. Cross-browser Testing
- Chrome (latest)
- Firefox (latest)
- Safari (macOS & iOS)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

---

## Documentation & Handoff

### 1. Component Documentation
Create Storybook or dedicated docs page:

```tsx
// Example component doc
/**
 * Button Component
 *
 * @example
 * <Button variant="primary" size="md">Click me</Button>
 *
 * @props
 * - variant: 'primary' | 'secondary' | 'outline' | 'ghost'
 * - size: 'sm' | 'md' | 'lg'
 * - className: string (optional)
 */
```

### 2. Design System Guide
Document in `DESIGN_SYSTEM.md`:
- Color palette with hex codes
- Typography scale
- Spacing system
- Component variants
- Dark mode implementation
- Accessibility guidelines

### 3. Migration Checklist
```markdown
## Pre-Migration
- [ ] Backup current codebase
- [ ] Create feature branch
- [ ] Install Tailwind v4
- [ ] Configure dark mode

## Component Migration
- [ ] Header/Navigation
- [ ] Footer
- [ ] Hero section
- [ ] Feature cards
- [ ] Blog/Post cards
- [ ] Admin sidebar
- [ ] Admin dashboard
- [ ] Form components
- [ ] Data tables

## Testing
- [ ] Visual regression tests pass
- [ ] Performance benchmarks met
- [ ] Accessibility audit complete
- [ ] Cross-browser testing done
- [ ] Mobile responsive verified

## Deployment
- [ ] Production build optimized
- [ ] CDN assets configured
- [ ] Analytics tracking updated
- [ ] Monitoring alerts set
```

---

## Implementation Timeline

### Week 1: Foundation
- **Day 1-2:** Install Tailwind, configure dark mode
- **Day 3-4:** Setup design tokens, create base utilities
- **Day 5:** Testing infrastructure

### Week 2: Core Components
- **Day 1-2:** Header, Footer, Logo
- **Day 3-4:** Hero section, CTA buttons
- **Day 5:** Button library, Card components

### Week 3: Pages
- **Day 1:** Marketing pages (Home, About, Contact)
- **Day 2-3:** Board/content pages
- **Day 4:** News, Artworks, YouTube pages
- **Day 5:** Testing and fixes

### Week 4: Admin & Polish
- **Day 1-2:** Admin sidebar, dashboard
- **Day 3:** Form components, data tables
- **Day 4:** Performance optimization
- **Day 5:** Final testing, documentation

---

## Success Metrics

### Performance
- **Lighthouse Score:** 90+ across all categories
- **First Contentful Paint (FCP):** < 1.5s
- **Largest Contentful Paint (LCP):** < 2.5s
- **Cumulative Layout Shift (CLS):** < 0.1
- **Time to Interactive (TTI):** < 3.5s

### Accessibility
- **WCAG 2.1 Level:** AA compliance
- **Keyboard Navigation:** 100% coverage
- **Screen Reader:** Compatible with NVDA, JAWS, VoiceOver
- **Color Contrast:** 4.5:1 minimum for text

### Code Quality
- **Bundle Size:** Reduce by 20% (Tailwind tree-shaking)
- **CSS Specificity:** Eliminate !important usage
- **Component Reusability:** 80%+ components shared
- **Dark Mode Coverage:** 100% of UI elements

---

## Conclusion

This UI redesign plan transforms metaldragon.co.kr from an Emotion-based glassmorphism design to a modern, clean Tailwind CSS implementation inspired by the appy-html template. The migration maintains 100% feature parity while introducing:

✅ **Modern Design Language:** Teal-to-purple gradient brand, clean shadows, smooth animations
✅ **Dark Mode System:** localStorage-based persistence, seamless toggle, consistent theming
✅ **Performance Gains:** Reduced bundle size, optimized CSS, faster page loads
✅ **Developer Experience:** Utility-first styling, better maintainability, type-safe components
✅ **Accessibility:** WCAG AA compliance, keyboard navigation, screen reader support

The phased implementation approach allows for incremental testing and rollback if needed, while the comprehensive documentation ensures long-term maintainability.

---

## Next Steps

1. **Review & Approval:** Stakeholder review of design mockups
2. **Development Kickoff:** Setup development environment
3. **Phase 1 Implementation:** Begin Tailwind installation and configuration
4. **Weekly Check-ins:** Progress review and adjustment
5. **Final Launch:** Production deployment with monitoring

---

**Document Version:** 1.0
**Last Updated:** 2025-10-04
**Author:** AI Design Architect
**Project:** metaldragon.co.kr UI Redesign
