# UI Redesign Migration Checklist
## metaldragon.co.kr — Emotion to Tailwind CSS

---

## 📋 Pre-Migration Setup

### Environment Setup
- [ ] Backup current codebase (Git commit/branch)
- [ ] Create feature branch: `git checkout -b feature/tailwind-redesign`
- [ ] Review all project documentation (PRD.md, LLD.md, PLAN.md)
- [ ] Take screenshots of current UI for comparison

### Dependencies Installation
```bash
# Install Tailwind CSS v4
npm install tailwindcss@next @tailwindcss/postcss@next

# Install utility libraries
npm install clsx tailwind-merge

# Install AOS (animations)
npm install aos
npm install @types/aos --save-dev

# Install Heroicons (optional)
npm install @heroicons/react
```

- [ ] Tailwind CSS v4 installed
- [ ] Utility libraries installed
- [ ] AOS library installed
- [ ] Type definitions installed

---

## 🎨 Phase 1: Foundation Setup (Week 1)

### Day 1-2: Tailwind Configuration

- [ ] Create `tailwind.config.ts`
  ```typescript
  import type { Config } from 'tailwindcss';

  const config: Config = {
    content: [
      './src/app/**/*.{js,ts,jsx,tsx,mdx}',
      './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    darkMode: 'class',
    theme: {
      extend: {
        colors: {
          teal: {
            50: '#f4fffd',
            100: '#e6fffa',
            // ... (full palette from DESIGN_SPECS.md)
          },
          indigo: {
            100: '#ebf4ff',
            // ... (full palette)
          },
        },
        fontFamily: {
          display: ['Red Hat Display', 'sans-serif'],
          sans: ['Inter', 'system-ui', 'sans-serif'],
        },
      },
    },
  };

  export default config;
  ```

- [ ] Update `postcss.config.js`
  ```javascript
  module.exports = {
    plugins: {
      '@tailwindcss/postcss': {},
    },
  };
  ```

- [ ] Create `src/app/globals.css`
  ```css
  @import 'tailwindcss';
  @import 'aos/dist/aos.css';

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
  }

  @layer utilities {
    .animate-gradient-shift {
      animation: gradientShift 8s ease infinite;
    }
  }

  @keyframes gradientShift {
    0%, 100% { transform: translateX(0) translateY(0); }
    50% { transform: translateX(10%) translateY(10%); }
  }
  ```

- [ ] Test Tailwind installation: `npm run dev` and verify utilities work

---

### Day 3-4: Dark Mode System

- [ ] Update `src/app/layout.tsx` with dark mode script
  ```tsx
  export default function RootLayout({ children }) {
    return (
      <html lang="ko" className="">
        <head>
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
        <body className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
          {children}
        </body>
      </html>
    );
  }
  ```

- [ ] Create `src/components/ui/DarkModeToggle.tsx` (reference DESIGN_MIGRATION_EXAMPLES.md)

- [ ] Test dark mode toggle functionality
  - [ ] Toggle switches between light/dark
  - [ ] Preference persists in localStorage
  - [ ] No flash of unstyled content (FOUC)
  - [ ] All colors have dark mode variants

---

### Day 5: Utility Setup

- [ ] Create `src/lib/utils.ts`
  ```typescript
  import clsx, { ClassValue } from 'clsx';
  import { twMerge } from 'tailwind-merge';

  export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
  }
  ```

- [ ] Setup AOS in layout
  ```tsx
  'use client';
  import AOS from 'aos';
  import { useEffect } from 'react';

  export function AOSProvider({ children }) {
    useEffect(() => {
      AOS.init({
        duration: 800,
        easing: 'ease-out',
        once: true,
        offset: 50,
      });
    }, []);

    return <>{children}</>;
  }
  ```

- [ ] Test AOS animations on a sample page

---

## 🧩 Phase 2: Core Components (Week 2)

### Day 1: Logo & Brand Elements

- [ ] Create `src/components/ui/Logo.tsx`
  - [ ] SVG logo with gradient (teal-500 → indigo-400)
  - [ ] Responsive sizing (mobile: w-8, desktop: w-10)
  - [ ] Link to homepage

- [ ] Create gradient text utility
  ```tsx
  <span className="bg-gradient-to-r from-teal-500 to-indigo-400 bg-clip-text text-transparent">
    metaldragon
  </span>
  ```

- [ ] Test logo rendering in light/dark mode

---

### Day 2: Header/Navigation

- [ ] Redesign `src/components/layout/Header.tsx`
  - [ ] Replace Emotion `styled` with Tailwind classes
  - [ ] Add gradient logo
  - [ ] Integrate dark mode toggle
  - [ ] Desktop navigation links
  - [ ] Mobile hamburger menu (Alpine.js pattern)
  - [ ] CTA button (bg-teal-500)

- [ ] Test navigation
  - [ ] Desktop menu displays correctly
  - [ ] Mobile menu slides in/out
  - [ ] Dark mode toggle works
  - [ ] Active link highlighting
  - [ ] Keyboard navigation (Tab, Enter)

---

### Day 3: Button Component Library

- [ ] Create `src/components/ui/Button.tsx`
  - [ ] Variants: primary, secondary, outline, ghost
  - [ ] Sizes: sm, md, lg
  - [ ] Hover lift effect
  - [ ] Focus ring (teal-500)
  - [ ] Dark mode support

- [ ] Test button variants
  - [ ] All variants render correctly
  - [ ] Hover effects smooth
  - [ ] Focus states visible
  - [ ] Disabled state accessible

---

### Day 4: Card Components

- [ ] Create `src/components/ui/Card.tsx`
  - [ ] White/gray-800 background
  - [ ] Rounded corners (rounded-xl)
  - [ ] Shadow (shadow-md hover:shadow-xl)
  - [ ] Hover lift effect (-translate-y-2)

- [ ] Create `src/components/ui/FeatureCard.tsx`
  - [ ] Gradient icon badge (teal-500 → indigo-400)
  - [ ] Title, description, optional link
  - [ ] Group hover effects

- [ ] Test card components
  - [ ] Responsive layouts
  - [ ] Hover animations smooth
  - [ ] Dark mode styling

---

### Day 5: Hero Section

- [ ] Redesign `src/app/(marketing)/page.tsx` hero
  - [ ] Gradient background (light: gray-50→gray-200, dark: gray-900→gray-800)
  - [ ] Radial glow SVG (light mode only)
  - [ ] Gradient text heading
  - [ ] CTA buttons (teal-500 primary)
  - [ ] AOS fade-in animations

- [ ] Test hero section
  - [ ] Radial glow visible in light mode
  - [ ] Gradient text displays correctly
  - [ ] Animations trigger on scroll
  - [ ] Responsive text sizing

---

## 📄 Phase 3: Page Redesigns (Week 3)

### Day 1: Marketing Pages

#### Home Page (`/`)
- [ ] Hero section (already done in Phase 2)
- [ ] Features grid
  - [ ] 6 feature cards (스터디, 뉴스, 가계부, AI작품, 일정, YouTube)
  - [ ] Grid layout (1→2→3 cols)
  - [ ] AOS animations (staggered delay)

- [ ] Test home page
  - [ ] All sections render
  - [ ] Responsive layout
  - [ ] Animations smooth

#### About Page (`/about`)
- [ ] Update page structure
  - [ ] Team section with cards
  - [ ] Mission statement with gradient text
  - [ ] Image gallery (if applicable)

- [ ] Test about page
  - [ ] Content displays correctly
  - [ ] Images optimized (WebP)

#### Contact Page (`/contact`)
- [ ] Redesign contact form
  - [ ] Input fields with focus states
  - [ ] Submit button (teal-500)
  - [ ] Validation feedback (red-500 errors, green-500 success)

- [ ] Test contact form
  - [ ] Form submission works
  - [ ] Validation displays
  - [ ] Accessibility (labels, ARIA)

#### Schedule Page (`/schedule`)
- [ ] Update calendar component
  - [ ] Tailwind styling
  - [ ] Dark mode support

- [ ] Test schedule page
  - [ ] Calendar renders
  - [ ] Events display

---

### Day 2-3: Board/Content Pages

#### Board List (`/board/[category]`)
- [ ] Redesign post card component
  - [ ] Featured image with hover scale
  - [ ] Category badge (teal-600 text, teal-50 bg)
  - [ ] Title, excerpt, metadata
  - [ ] Grid layout (1→2→3 cols)

- [ ] Test board list
  - [ ] Cards display correctly
  - [ ] Pagination works
  - [ ] Filter/search functional

#### Post Detail (`/board/[category]/[id]`)
- [ ] Update post detail layout
  - [ ] Hero image (if available)
  - [ ] Content typography
  - [ ] Comment section

- [ ] Test post detail
  - [ ] Content readable
  - [ ] Comments display
  - [ ] Related posts show

#### Post Create/Edit (`/board/[category]/new`)
- [ ] Redesign form components
  - [ ] Title input
  - [ ] Rich text editor (maintain functionality)
  - [ ] Image upload with preview
  - [ ] Submit button

- [ ] Test post creation
  - [ ] Form submits
  - [ ] Images upload
  - [ ] Validation works

---

### Day 4: News, Artworks, YouTube Pages

#### News Page (`/news`)
- [ ] Redesign news feed
  - [ ] News card component
  - [ ] Auto-refresh indicator
  - [ ] Grid/List view toggle

- [ ] Test news page
  - [ ] Real-time updates work
  - [ ] Cards render correctly

#### Artworks Page (`/artworks`)
- [ ] Update gallery layout
  - [ ] Image grid (Masonry or equal)
  - [ ] Lightbox on click
  - [ ] Category filter

- [ ] Test artworks page
  - [ ] Gallery displays
  - [ ] Lightbox works
  - [ ] Filter functional

#### YouTube Page (`/youtube`)
- [ ] Redesign video grid
  - [ ] Video card with thumbnail
  - [ ] Play button overlay
  - [ ] Video metadata

- [ ] Test YouTube page
  - [ ] Videos display
  - [ ] Playback works

---

### Day 5: Testing & Fixes

- [ ] Cross-page testing
  - [ ] Navigation consistency
  - [ ] Dark mode across all pages
  - [ ] Responsive layouts

- [ ] Fix any UI bugs found
- [ ] Optimize images (WebP conversion)
- [ ] Check loading states

---

## 🔐 Phase 4: Admin Panel (Week 4)

### Day 1-2: Admin Layout & Sidebar

- [ ] Redesign `src/app/admin/layout.tsx`
  - [ ] Dark background (gray-900/950)
  - [ ] Sidebar positioning

- [ ] Redesign `src/app/admin/components/AdminSidebar.tsx`
  - [ ] Logo badge (gradient M)
  - [ ] Navigation links
  - [ ] Active state (teal-500/10 bg, teal-400 text)
  - [ ] Back to site link

- [ ] Test admin layout
  - [ ] Sidebar fixed position
  - [ ] Active link highlighting
  - [ ] Mobile responsive

---

### Day 3: Admin Dashboard & Pages

#### Dashboard (`/admin`)
- [ ] Metric cards
  - [ ] Gradient icon badges
  - [ ] Value, change percentage
  - [ ] Grid layout (2→3→4 cols)

- [ ] Recent activity feed

- [ ] Test dashboard
  - [ ] Metrics display correctly
  - [ ] Real-time updates (if applicable)

#### Post Management (`/admin/posts`)
- [ ] Data table component
  - [ ] Sortable columns
  - [ ] Search input
  - [ ] Action buttons (edit, delete)
  - [ ] Pagination

- [ ] Test post management
  - [ ] Table renders
  - [ ] Sort/search works
  - [ ] CRUD operations functional

#### Other Admin Pages
- [ ] `/admin/news` — News management
- [ ] `/admin/youtube` — YouTube management
- [ ] `/admin/finance` — Financial dashboard
- [ ] `/admin/contacts` — Contact submissions
- [ ] `/admin/about` — About page editor

---

### Day 4: Form Components

- [ ] Create reusable form inputs
  - [ ] Text input (floating label optional)
  - [ ] Textarea
  - [ ] Select dropdown (custom styled)
  - [ ] Checkbox, Radio
  - [ ] File upload with preview

- [ ] Test form components
  - [ ] All inputs functional
  - [ ] Validation states
  - [ ] Focus states visible

---

### Day 5: Polish & Optimization

- [ ] Performance optimization
  - [ ] Minimize Tailwind CSS output (PurgeCSS)
  - [ ] Code splitting (dynamic imports)
  - [ ] Image lazy loading
  - [ ] Font optimization (FOUT prevention)

- [ ] Accessibility audit
  - [ ] WCAG AA compliance check
  - [ ] Keyboard navigation test
  - [ ] Screen reader compatibility (NVDA/JAWS)
  - [ ] Color contrast verification

- [ ] Final testing
  - [ ] Lighthouse audit (target: 90+ all categories)
  - [ ] Cross-browser testing (Chrome, Firefox, Safari, Edge)
  - [ ] Mobile testing (iOS Safari, Chrome Mobile)

---

## 🧹 Cleanup & Documentation

### Code Cleanup
- [ ] Remove unused Emotion imports
  - [ ] `@emotion/react`
  - [ ] `@emotion/styled`
  - [ ] `styled` components

- [ ] Remove deprecated files
  - [ ] `src/lib/styles/tokens.ts` (replaced by Tailwind config)
  - [ ] `src/lib/styles/theme.ts` (replaced by Tailwind)
  - [ ] `src/lib/styles/rcss.ts` (replaced by utilities)

- [ ] Update `package.json`
  ```bash
  npm uninstall @emotion/react @emotion/styled
  ```

---

### Documentation
- [ ] Update component documentation
  - [ ] Usage examples in Markdown
  - [ ] Props documentation (TypeScript interfaces)
  - [ ] Dark mode guidelines

- [ ] Create design system documentation
  - [ ] Color palette reference
  - [ ] Typography scale
  - [ ] Component library guide

- [ ] Document migration learnings
  - [ ] Challenges faced
  - [ ] Solutions implemented
  - [ ] Performance improvements

---

## 🚀 Pre-Launch Checklist

### Testing
- [ ] Visual regression tests pass (Percy/Chromatic)
- [ ] Lighthouse Performance: 90+
- [ ] Lighthouse Accessibility: 95+
- [ ] Lighthouse Best Practices: 95+
- [ ] Lighthouse SEO: 95+

### Cross-browser Testing
- [ ] Chrome (latest) ✅
- [ ] Firefox (latest) ✅
- [ ] Safari (macOS) ✅
- [ ] Edge (latest) ✅
- [ ] iOS Safari (iPhone) ✅
- [ ] Chrome Mobile (Android) ✅

### Accessibility
- [ ] Keyboard navigation (Tab, Enter, Escape) ✅
- [ ] Focus indicators visible ✅
- [ ] Screen reader compatible (NVDA) ✅
- [ ] Color contrast WCAG AA (4.5:1) ✅
- [ ] ARIA labels present ✅

### Responsive Design
- [ ] Mobile (375px - 640px) ✅
- [ ] Tablet (640px - 1024px) ✅
- [ ] Desktop (1024px - 1920px) ✅
- [ ] Large screens (1920px+) ✅

### Dark Mode
- [ ] All pages support dark mode ✅
- [ ] Toggle persists in localStorage ✅
- [ ] No FOUC (flash of unstyled content) ✅
- [ ] Images/icons adapt to theme ✅

### Performance
- [ ] Images optimized (WebP, lazy loading) ✅
- [ ] Fonts optimized (`display: swap`) ✅
- [ ] Code splitting enabled ✅
- [ ] Bundle size reduced by 20%+ ✅

---

## 📝 Deployment

### Pre-deployment
- [ ] Merge feature branch to main
  ```bash
  git checkout main
  git merge feature/tailwind-redesign
  ```

- [ ] Update CHANGELOG.md
- [ ] Bump version number in package.json
- [ ] Create Git tag: `git tag v2.0.0-redesign`

### Deployment
- [ ] Deploy to staging environment
- [ ] Run smoke tests on staging
- [ ] Deploy to production
- [ ] Monitor error tracking (Sentry, etc.)
- [ ] Monitor analytics (Google Analytics, Plausible)

### Post-deployment
- [ ] Verify production site loads correctly
- [ ] Check dark mode toggle in production
- [ ] Monitor performance metrics (Core Web Vitals)
- [ ] Gather user feedback

---

## 📊 Success Metrics

### Performance Improvements
- [ ] First Contentful Paint (FCP): < 1.5s
- [ ] Largest Contentful Paint (LCP): < 2.5s
- [ ] Cumulative Layout Shift (CLS): < 0.1
- [ ] Time to Interactive (TTI): < 3.5s
- [ ] Bundle size reduction: 20%+

### Code Quality
- [ ] CSS specificity reduced (no !important)
- [ ] Component reusability: 80%+
- [ ] Dark mode coverage: 100%
- [ ] TypeScript strict mode: enabled

### User Experience
- [ ] Accessibility: WCAG AA compliant
- [ ] Mobile-first responsive: 100%
- [ ] Dark mode: fully functional
- [ ] Animation smoothness: 60fps

---

## 🐛 Known Issues & TODOs

### Known Issues
- [ ] None yet (track as you find)

### Future Enhancements
- [ ] Add more AOS animation variants
- [ ] Implement skeleton loaders
- [ ] Add page transition animations
- [ ] Create Storybook for component library
- [ ] Add E2E tests (Playwright/Cypress)

---

## 📚 Resources

### Documentation
- [UI_REDESIGN_PLAN.md](./UI_REDESIGN_PLAN.md) — Comprehensive redesign strategy
- [DESIGN_MIGRATION_EXAMPLES.md](./DESIGN_MIGRATION_EXAMPLES.md) — Before/after code examples
- [DESIGN_SPECS.md](./DESIGN_SPECS.md) — Visual design specifications

### External Resources
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [AOS Library](https://michalsnik.github.io/aos/)
- [Heroicons](https://heroicons.com/)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)

---

## ✅ Final Sign-off

### Team Approvals
- [ ] Design lead approval
- [ ] Tech lead approval
- [ ] Product owner approval
- [ ] Stakeholder approval

### Launch Readiness
- [ ] All checklist items completed
- [ ] No critical bugs
- [ ] Performance benchmarks met
- [ ] Documentation complete
- [ ] Team trained on new system

---

**Migration Version:** 1.0
**Start Date:** [Fill in]
**Target Completion:** [Fill in]
**Status:** 🔄 In Progress | ✅ Complete
