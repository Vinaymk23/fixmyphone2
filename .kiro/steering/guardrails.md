# Guardrails

## DO

- Keep all pages as standalone static HTML — no build step, no bundling
- Use Tailwind CSS utility classes via CDN for all styling
- Include Google Analytics snippet on every page
- Match the existing page structure and component patterns when adding new pages
- Use `container mx-auto px-6` for all content wrappers
- Keep all JavaScript inline at the bottom of each HTML file
- Use vanilla JS only — no jQuery, no frameworks
- Use Font Awesome icons from the existing CDN link
- Use placeholder images from `https://placehold.co/` when real images aren't available
- Keep the mobile-first responsive approach (base → sm → md → lg breakpoints)
- Use semantic HTML elements (`<header>`, `<main>`, `<footer>`, `<nav>`, `<section>`, `<article>`)
- Include breadcrumbs on brand pages and blog posts
- Maintain consistent header/footer structure across all pages
- Use `novalidate` on forms (validation is handled via JS)
- Update `sitemap.xml` when adding or removing pages
- Use Inter font for all text content
- Keep the brand name exactly as "fixmyPhone" (camelCase with lowercase 'f')

## DON'T

- Don't introduce npm, webpack, vite, or any build tooling
- Don't add external JS files — keep all scripts inline
- Don't change the Google Analytics ID (G-G0DKJDMNGL)
- Don't use colors outside the established palette (blue-600 primary, gray-50/800 backgrounds)
- Don't replace Tailwind CDN with a local install or PostCSS setup
- Don't change the business contact details without explicit instruction
- Don't add new CDN dependencies without asking
- Don't use `!important` in styles
- Don't hardcode prices — the site provides quotes, not fixed pricing
- Don't add cookie consent banners or GDPR notices unless explicitly asked
- Don't modify `robots.txt` without explicit instruction
- Don't add login/auth features — this is a public-facing informational site
- Don't use Lorem Ipsum — write real, relevant content for Mysore phone repair
- Don't create server-side logic or API endpoints — forms use mailto or third-party services
- Don't introduce new fonts beyond Inter
- Don't change the favicon or brand identity elements

## When Adding a New Brand Page

1. Copy an existing brand page (e.g., `samsung.html`) as template
2. Update the title, meta description, meta keywords
3. Update breadcrumbs to show the new brand name
4. Update the inline JS `models` array with correct phone models for that brand
5. Update the inline JS `services` array if brand-specific services differ
6. Add the new brand to `sitemap.xml`
7. Add a link to the new brand on `repair_phone.html`

## When Adding a New Blog Post

1. Create file in `posts/` with a URL-friendly slug filename
2. Use the existing blog post template structure
3. Include proper meta tags (title, description, keywords)
4. Add a card for the post in `blog.html`
5. Add the URL to `sitemap.xml`

## Form Handling

- Forms currently use inline JS for validation
- Quote/contact form submissions should be handled via a third-party service (e.g., Formspree, EmailJS) or `mailto:` link
- Always validate required fields client-side before submission
- Show success/error feedback inline (no `alert()` calls)

## Performance Considerations

- Don't add heavy libraries or large images without compression
- Keep inline JS minimal — just what's needed for the page's interactive features
- Use `loading="lazy"` on images below the fold
- Preconnect to Google Fonts (`fonts.googleapis.com`, `fonts.gstatic.com`)
