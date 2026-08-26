# Project Conventions

## Overview

This is a **static HTML website** for "fixmyPhone" — a phone repair business in Mysore, India. No build tools, no frameworks, no bundlers. All pages are standalone `.html` files served directly.

- **Site URL**: https://gofixmyphone.com
- **Business**: fixmyPhone, Mysore, Karnataka, India
- **Phone**: +91 9008419525
- **Email**: support@gofixmyphone.com
- **Address**: #2259, Bogadhi 2nd stage, Mysore 570009

## File Structure

```
/                     → Root pages (index.html, contact.html, blog.html, etc.)
/brands/              → One page per phone brand (samsung.html, apple.html, etc.)
/posts/               → Blog post pages
/sitemap.xml          → Sitemap for search engines
/robots.txt           → Crawl rules
```

## HTML Template Structure

Every page follows this order:

1. `<!DOCTYPE html>` + `<html lang="en">`
2. `<head>` with: charset, viewport, title, meta description, meta keywords, Google Analytics, compiled Tailwind stylesheet (`/styles.css`), Font Awesome CDN, Google Fonts (Inter), inline `<style>` block
3. `<body class="bg-gray-50 text-gray-800">`
4. Sticky header with nav
5. `<main>` content
6. Footer
7. Any modals (quote modal, etc.)
8. Inline `<script>` at bottom

## Navigation Pattern

### Root pages (index.html, contact.html, blog.html)
- Header links use relative paths: `index.html`, `contact.html`, `blog.html`, `repair_phone.html`
- CTA button: "Book Repair Now" or "Get a Free Quote" linking to `repair_phone.html`

### Brand pages (brands/*.html)
- Header links use `../` prefix: `../index.html`, `../contact.html`
- CTA button: "Contact Us" linking to `../contact.html`
- Include breadcrumbs: Home > Repair Mobile Phone > [Brand]

## CSS / CDN Dependencies (always in this order)

```html
<link rel="stylesheet" href="/styles.css" />
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
```

`/styles.css` is a compiled, committed Tailwind build (not the CDN script) — see `guardrails.md` → "Tailwind Build" for how to rebuild it after adding new classes.

## Google Analytics

Every page must include:

```html
<script async src="https://www.googletagmanager.com/gtag/js?id=G-G0DKJDMNGL"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag() { dataLayer.push(arguments); }
  gtag("js", new Date());
  gtag("config", "G-G0DKJDMNGL");
</script>
```

## Footer Pattern

### Root pages — full footer with 3 columns:
- Company info (brand name, tagline)
- Quick links (Services, Blog, Contact, Privacy, Terms)
- Contact info (address, phone, email) + social icons

### Brand pages — minimal footer:
```html
<footer class="bg-gray-800 text-white py-12">
  <div class="container mx-auto px-6 text-center">
    <p>&copy; 2024 fixmyPhone. All rights reserved.</p>
    <div class="mt-4">
      <a href="../privacy.html" class="hover:underline text-sm text-gray-400 mx-2">Privacy Policy</a>
      <a href="../terms.html" class="hover:underline text-sm text-gray-400 mx-2">Terms of Service</a>
    </div>
  </div>
</footer>
```

## JavaScript

- All JS is inline at the bottom of each page (no external JS files)
- No jQuery — use vanilla JS
- Mobile menu toggle, modals, form validation, and interactive UI all use vanilla DOM manipulation
