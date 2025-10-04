# Quick Reference Card
## Tailwind CSS Migration — metaldragon.co.kr

---

## 🎨 Color Quick Reference

### Primary Colors (Use These!)
```tsx
// Teal (Primary Brand)
bg-teal-500        // Main brand color (#3abab4)
hover:bg-teal-400  // Hover state
text-teal-500      // Text/icons
ring-teal-500      // Focus rings

// Indigo (Secondary/Gradient)
bg-indigo-400      // Gradient end (#7f9cf5)
text-indigo-500    // Accent text

// Gradient (Logo, Headings)
bg-gradient-to-r from-teal-500 to-indigo-400
```

### Grayscale (Text & Backgrounds)
```tsx
// Light Mode
bg-white           // Cards
bg-gray-50         // Page background
text-gray-900      // Primary headings
text-gray-700      // Body text
text-gray-600      // Secondary text
border-gray-200    // Borders

// Dark Mode
dark:bg-gray-900   // Page background
dark:bg-gray-800   // Cards
dark:text-gray-100 // Primary headings
dark:text-gray-300 // Body text
dark:border-gray-700 // Borders
```

---

## 🔤 Typography Quick Reference

### Font Families
```tsx
font-display       // Red Hat Display (headings)
font-sans          // Inter (body text)
```

### Font Sizes (Mobile → Desktop)
```tsx
// Responsive heading
text-4xl md:text-5xl lg:text-6xl

// Responsive body
text-base md:text-lg
```

### Common Patterns
```tsx
// Hero Title
<h1 className="font-display font-extrabold text-5xl md:text-6xl bg-gradient-to-r from-teal-500 to-indigo-400 bg-clip-text text-transparent">

// Section Title
<h2 className="font-display font-bold text-3xl text-gray-900 dark:text-gray-100">

// Body Text
<p className="text-base text-gray-700 dark:text-gray-300 leading-relaxed">
```

---

## 🔘 Button Quick Reference

### Primary Button (Teal)
```tsx
<button className="
  px-6 py-3
  bg-teal-500 hover:bg-teal-400
  text-white font-medium
  rounded-lg shadow-sm
  transition-all duration-150
  hover:-translate-y-0.5
  focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2
">
  Primary Action
</button>
```

### Secondary Button (White/Outline)
```tsx
<button className="
  px-6 py-3
  bg-white dark:bg-gray-800
  text-gray-700 dark:text-gray-300
  border-2 border-gray-300 dark:border-gray-600
  rounded-lg font-medium
  hover:border-teal-500 hover:text-teal-500
  transition-colors duration-150
">
  Secondary Action
</button>
```

### Ghost Button
```tsx
<button className="
  px-6 py-3
  text-gray-700 dark:text-gray-300
  hover:bg-gray-100 dark:hover:bg-gray-800
  rounded-lg font-medium
  transition-colors duration-150
">
  Ghost Button
</button>
```

---

## 📦 Card Quick Reference

### Basic Card
```tsx
<div className="
  bg-white dark:bg-gray-800
  rounded-xl p-8
  shadow-md hover:shadow-xl
  transition-all duration-300
  hover:-translate-y-2
  border border-gray-100 dark:border-gray-700
">
  <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
    Card Title
  </h3>
  <p className="text-gray-600 dark:text-gray-300">
    Card content
  </p>
</div>
```

### Feature Card (with Gradient Icon)
```tsx
<div className="bg-white dark:bg-gray-800 rounded-lg p-8 shadow-md hover:shadow-xl transition-shadow group">
  {/* Icon */}
  <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-indigo-400 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
    <span className="text-white text-2xl">📚</span>
  </div>

  {/* Content */}
  <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
    Feature Title
  </h3>
  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
    Feature description
  </p>
</div>
```

---

## 📝 Form Input Quick Reference

### Text Input
```tsx
<div className="mb-4">
  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
    Label
  </label>
  <input
    type="text"
    className="
      w-full px-4 py-3
      bg-white dark:bg-gray-800
      border border-gray-300 dark:border-gray-600
      rounded-lg
      text-gray-900 dark:text-gray-100
      placeholder:text-gray-400
      focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent
      transition-all duration-200
    "
    placeholder="Enter text..."
  />
</div>
```

### Textarea
```tsx
<textarea className="
  w-full px-4 py-3
  bg-white dark:bg-gray-800
  border border-gray-300 dark:border-gray-600
  rounded-lg
  text-gray-900 dark:text-gray-100
  focus:outline-none focus:ring-2 focus:ring-teal-500
  transition-all duration-200
  resize-none
" rows={4} />
```

### Select Dropdown
```tsx
<select className="
  w-full px-4 py-3
  bg-white dark:bg-gray-800
  border border-gray-300 dark:border-gray-600
  rounded-lg
  text-gray-900 dark:text-gray-100
  focus:outline-none focus:ring-2 focus:ring-teal-500
  transition-all duration-200
">
  <option>Option 1</option>
  <option>Option 2</option>
</select>
```

---

## 🏷️ Badge/Tag Quick Reference

### Category Badge
```tsx
<span className="
  inline-block px-3 py-1
  text-xs font-medium
  text-teal-600 dark:text-teal-400
  bg-teal-50 dark:bg-teal-900/20
  rounded-full
">
  Category
</span>
```

### Status Badge (Success)
```tsx
<span className="
  inline-flex items-center px-3 py-1
  text-xs font-medium
  text-green-700 dark:text-green-400
  bg-green-50 dark:bg-green-900/20
  rounded-full
">
  ✓ Active
</span>
```

---

## 🌓 Dark Mode Quick Reference

### Toggle Component
```tsx
'use client';
import { useEffect, useState } from 'react';

export function DarkModeToggle() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const darkMode = localStorage.getItem('dark-mode') === 'true';
    setIsDark(darkMode);
    if (darkMode) document.documentElement.classList.add('dark');
  }, []);

  const toggle = () => {
    setIsDark(!isDark);
    localStorage.setItem('dark-mode', String(!isDark));
    document.documentElement.classList.toggle('dark');
  };

  return (
    <button onClick={toggle} className="relative w-11 h-6 bg-gray-200 dark:bg-gray-700 rounded-full">
      <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white dark:bg-gray-900 rounded-full transition-transform ${isDark ? 'translate-x-5' : ''}`} />
    </button>
  );
}
```

### Dark Mode Patterns
```tsx
// Background
bg-white dark:bg-gray-900

// Card Background
bg-gray-50 dark:bg-gray-800

// Primary Text
text-gray-900 dark:text-gray-100

// Body Text
text-gray-700 dark:text-gray-300

// Border
border-gray-200 dark:border-gray-700

// Hover Background
hover:bg-gray-100 dark:hover:bg-gray-800
```

---

## 📐 Layout Quick Reference

### Container
```tsx
<div className="max-w-6xl mx-auto px-4 sm:px-6">
  Content
</div>
```

### Grid Layout (Responsive)
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {items.map(item => <Card key={item.id} />)}
</div>
```

### Flexbox (Centered)
```tsx
<div className="flex items-center justify-center min-h-screen">
  Centered content
</div>
```

### Flexbox (Space Between)
```tsx
<div className="flex items-center justify-between">
  <div>Left</div>
  <div>Right</div>
</div>
```

---

## 🎬 Animation Quick Reference

### Hover Effects
```tsx
// Lift on hover
hover:-translate-y-2 transition-transform duration-300

// Shadow on hover
hover:shadow-xl transition-shadow duration-300

// Scale on hover
hover:scale-105 transition-transform duration-300

// Color on hover
hover:text-teal-500 transition-colors duration-150
```

### AOS (Animate On Scroll)
```tsx
// Fade up
<div data-aos="fade-up">Content</div>

// Fade up with delay
<div data-aos="fade-up" data-aos-delay="100">Content</div>

// Zoom in
<div data-aos="zoom-in">Content</div>

// Slide from left
<div data-aos="fade-right">Content</div>
```

### Group Hover
```tsx
<div className="group">
  <img className="group-hover:scale-105 transition-transform" />
  <h3 className="group-hover:text-teal-500 transition-colors">Title</h3>
</div>
```

---

## 📱 Responsive Quick Reference

### Breakpoints
```
sm:  640px   (Tablet)
md:  768px   (Tablet/Laptop)
lg:  1024px  (Laptop)
xl:  1280px  (Desktop)
2xl: 1536px  (Large Desktop)
```

### Responsive Text
```tsx
text-2xl sm:text-3xl md:text-4xl lg:text-5xl
```

### Responsive Padding
```tsx
px-4 sm:px-6 lg:px-8
py-8 md:py-12 lg:py-16
```

### Hide/Show
```tsx
// Hide on mobile, show on desktop
hidden md:block

// Show on mobile, hide on desktop
block md:hidden
```

---

## ♿ Accessibility Quick Reference

### Focus States
```tsx
focus:outline-none
focus:ring-2
focus:ring-teal-500
focus:ring-offset-2
```

### ARIA Labels
```tsx
<button aria-label="Close menu">
  <svg>...</svg>
</button>
```

### Semantic HTML
```tsx
<nav>, <header>, <main>, <section>, <article>, <footer>
```

### Keyboard Support
```tsx
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

## 🛠️ Utility Functions

### className Merger (cn)
```tsx
// src/lib/utils.ts
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Usage
<div className={cn(
  'px-4 py-2',
  isActive && 'bg-teal-500',
  className
)} />
```

---

## 📋 Common Patterns Cheat Sheet

### Hero Section
```tsx
<section className="relative min-h-[80vh] flex items-center justify-center px-4 bg-gradient-to-br from-gray-50 to-gray-200 dark:from-gray-900 dark:to-gray-800">
  <div className="max-w-4xl mx-auto text-center">
    <h1 className="font-display font-extrabold text-5xl md:text-6xl bg-gradient-to-r from-teal-500 to-indigo-400 bg-clip-text text-transparent mb-6">
      Hero Title
    </h1>
    <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
      Subtitle
    </p>
    <div className="flex gap-4 justify-center">
      <button className="btn bg-teal-500 hover:bg-teal-400 text-white">CTA</button>
    </div>
  </div>
</section>
```

### Feature Grid
```tsx
<section className="max-w-6xl mx-auto px-4 py-16">
  <h2 className="text-3xl font-bold text-center mb-12">Features</h2>
  <div className="grid md:grid-cols-3 gap-8">
    {features.map(feature => (
      <div key={feature.id} className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md hover:shadow-xl transition-shadow">
        <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-indigo-400 rounded-lg flex items-center justify-center mb-4">
          <span className="text-white text-2xl">{feature.icon}</span>
        </div>
        <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
        <p className="text-gray-600 dark:text-gray-300">{feature.description}</p>
      </div>
    ))}
  </div>
</section>
```

### Admin Sidebar
```tsx
<aside className="fixed left-0 top-0 h-screen w-72 bg-gray-900 dark:bg-gray-950 border-r border-gray-800 overflow-y-auto">
  <div className="p-6">
    <div className="flex items-center gap-3 mb-8">
      <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-indigo-400 rounded-lg flex items-center justify-center text-white font-bold">
        M
      </div>
      <span className="text-white font-bold text-xl">Admin</span>
    </div>

    <nav>
      <ul className="space-y-2">
        {links.map(link => (
          <li key={link.href}>
            <Link
              href={link.href}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors',
                isActive ? 'bg-teal-500/10 text-teal-400' : 'text-gray-400 hover:bg-gray-800'
              )}
            >
              <span className="text-2xl">{link.icon}</span>
              <span>{link.label}</span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  </div>
</aside>
```

---

## 🔍 Debugging Tips

### Tailwind Not Working?
1. Check `tailwind.config.ts` content paths
2. Restart dev server
3. Verify `@import 'tailwindcss'` in `globals.css`

### Dark Mode Flicker?
Add blocking script in `layout.tsx`:
```tsx
<script dangerouslySetInnerHTML={{
  __html: `if (localStorage.getItem('dark-mode') === 'true') document.documentElement.classList.add('dark');`
}} />
```

### Text Cut Off?
Add padding to gradient text:
```tsx
<h1 className="bg-gradient-to-r from-teal-500 to-indigo-400 bg-clip-text text-transparent py-2">
  Title
</h1>
```

---

## 📚 Essential Links

- [Tailwind Docs](https://tailwindcss.com/docs)
- [Heroicons](https://heroicons.com/)
- [AOS Library](https://michalsnik.github.io/aos/)
- [Full Redesign Plan](./UI_REDESIGN_PLAN.md)
- [Migration Examples](./DESIGN_MIGRATION_EXAMPLES.md)
- [Design Specs](./DESIGN_SPECS.md)
- [Migration Checklist](./MIGRATION_CHECKLIST.md)

---

**Print this card or keep it open while coding!** 🚀
