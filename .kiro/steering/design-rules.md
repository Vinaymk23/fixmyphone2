# Design Rules

## Color Palette (Tailwind classes)

| Role | Class | Hex |
|------|-------|-----|
| Primary | `blue-600` | #2563EB |
| Primary hover | `blue-700` | #1D4ED8 |
| Primary light bg | `blue-50`, `blue-100` | |
| Primary text on light | `text-blue-600` | |
| Body background | `bg-gray-50` | |
| Body text | `text-gray-800` | |
| Secondary text | `text-gray-600` | |
| Muted text | `text-gray-400`, `text-gray-500` | |
| Card background | `bg-white` | |
| Footer background | `bg-gray-800` | |
| Footer text | `text-white`, `text-gray-400` | |
| Discount banner | `bg-yellow-400` | |
| Icon accent | `text-blue-500` | |

## Typography

- **Font family**: Inter (Google Fonts) — set via `font-family: "Inter", sans-serif` on body
- **Font weights used**: 400, 500, 600, 700
- **Headings**: `font-extrabold` (h1), `font-bold` (h2, h3)
- **Body text**: default weight (400)

### Heading sizes:
- Hero h1: `text-4xl lg:text-6xl`
- Page h1: `text-4xl lg:text-5xl`
- Section h2: `text-3xl lg:text-4xl` or `text-3xl font-bold`
- Sub-heading h3: `text-xl font-semibold`

## Layout Patterns

### Container:
```html
<div class="container mx-auto px-6">
```

### Section spacing:
- Sections: `py-16 md:py-24` or `py-20`
- Main content: `pt-12 pb-20` or `py-12 md:py-20`

### Grid patterns:
- Services: `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8`
- Brand model grid: `grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6`
- Two-column layout: `grid grid-cols-1 lg:grid-cols-2 gap-12`
- Three-column (with sidebar): `grid grid-cols-1 lg:grid-cols-3 gap-12`

## Component Patterns

### Primary CTA Button:
```html
<a href="..." class="bg-blue-600 text-white font-semibold py-2 px-4 rounded-full shadow-md hover:bg-blue-700 transition-colors duration-200">
  Button Text
</a>
```

For larger hero CTAs add: `font-bold py-3 px-8 rounded-full shadow-lg hover:bg-blue-700 transition-all duration-300 transform hover:scale-105 animated-button`

### Secondary/Outline Button:
```html
<button class="bg-transparent border-2 border-blue-600 text-blue-600 font-bold py-3 px-8 rounded-full shadow-lg hover:bg-blue-600 hover:text-white transition-all duration-300">
```

### Cards:
```html
<div class="bg-white p-8 rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-300 text-center">
```

### Form inputs:
```html
<input class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-gray-400" />
```

### Modal pattern:
- Backdrop: `fixed inset-0 bg-black bg-opacity-60 z-50 opacity-0 invisible`
- Content: `bg-white p-8 rounded-xl shadow-lg w-full max-w-lg mx-4`
- Toggle via JS: add/remove `invisible` and `opacity-0` classes

## Responsive Breakpoints

Follow Tailwind defaults:
- `sm:` → 640px
- `md:` → 768px (hide mobile menu, show desktop nav)
- `lg:` → 1024px (wider grids, larger text)

### Mobile menu:
- Hidden on `md:` and up via `hidden md:flex`
- Hamburger button: `md:hidden`
- Animated with `max-height` transition

## Icons

Use Font Awesome 6.4 classes:
- Services: `fas fa-mobile-alt`, `fas fa-battery-half`, `fas fa-charging-station`, `fas fa-tint`
- Navigation: `fas fa-bars` (hamburger), `fas fa-times` (close)
- Breadcrumbs: `fas fa-chevron-right`
- Social: `fab fa-facebook-f`, `fab fa-instagram`, `fab fa-twitter`

Icon containers: `flex items-center justify-center h-16 w-16 bg-blue-100 text-blue-600 rounded-full`

## Animations & Transitions

- Hover lift: `transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out`
- Fade-in on scroll: `.fade-in` class with JS intersection observer adding `.is-visible`
- Modal: opacity + visibility transition (0.3s)
- Mobile menu: `max-height` transition (0.3s)
- Buttons: `transition-colors duration-200` or `transition-all duration-300`
