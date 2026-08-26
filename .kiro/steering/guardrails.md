# Guardrails

## Working With the Site Owner

- The site owner is not a developer — never assume familiarity with the CLI, git, npm, Firebase, or any dev tooling.
- For anything that requires the owner to act outside the codebase (signing up for a service, clicking through a console, running a terminal command, entering billing details), give an explicit numbered checklist: what to click, what to type, what to paste back. One step at a time, plain language, no jargon left unexplained.
- Before assuming a step is done, confirm it — don't chain multiple "you should now have X" assumptions together without checking in.
- This applies to every session working on this project, not just once.

## DO

- Keep all pages as standalone static HTML — no build step in deployment (Netlify serves the files as-is, no build command configured)
- Use Tailwind CSS utility classes, compiled to the committed `/styles.css` (see "Tailwind Build" below) — don't reintroduce the CDN script
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

- Don't introduce npm, webpack, vite, or any build tooling **for the site itself** — the public HTML pages stay standalone, no build step. (This does not apply to `functions/`, the Firebase Cloud Functions codebase, which is a separate Node project and normally uses npm — see "Backend / Cloud Functions" below.)
- Don't add external JS files to the site pages — keep all site scripts inline
- Don't change the Google Analytics ID (G-G0DKJDMNGL)
- Don't use colors outside the established palette (blue-600 primary, gray-50/800 backgrounds)
- Don't change the business contact details without explicit instruction
- Don't add new CDN dependencies without asking
- Don't use `!important` in styles
- Don't hardcode prices — the site provides quotes, not fixed pricing
- Don't add cookie consent banners or GDPR notices unless explicitly asked
- Don't modify `robots.txt` without explicit instruction
- Don't add login/auth features — this is a public-facing informational site
- Don't use Lorem Ipsum — write real, relevant content for Mysore phone repair
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

- Forms use inline JS for validation
- Quote/contact form submissions write to Firestore (`artifacts/{APP_ID}/public/data/quoteRequests`) via `shared.js`
- Always validate required fields client-side before submission
- Show success/error feedback inline (no `alert()` calls)

## Tailwind Build

- The site used to load Tailwind from `cdn.tailwindcss.com` (a runtime JS compiler downloaded on every page load). It now uses a compiled, committed `/styles.css` instead — same visual output, much smaller and faster, no runtime compilation in the visitor's browser.
- `tailwind.config.js` and `tailwind-input.css` at the project root define the build; `styles.css` is the generated output that every page links to (`<link rel="stylesheet" href="/styles.css" />`).
- **Whenever you add or change a Tailwind class anywhere in the HTML, you must rebuild `styles.css`, or the new class won't exist in the shipped CSS and will silently do nothing.** Run `bun run build:css` (or `npm run build:css` if npm is available) from the project root, then commit the updated `styles.css` alongside your HTML changes.
- `tailwindcss` lives in the root `devDependencies` (installed via `bun add -D`, since this environment doesn't have npm — see the Cloud Functions section below for the same bun/Windows quirks). This does not turn the site into an npm-built project — there's still no build step in Netlify's deploy; the compiled CSS is just a committed static file like any image.
- Dynamic classes built via ternary/lookup in inline JS (e.g. `` isSelected ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700" ``) are fine — Tailwind's scanner finds them as long as the *complete* class string appears literally somewhere in the file. Never build a class name by concatenating a variable into the middle of it (e.g. `` `text-${color}-600` ``) — that breaks static scanning silently.

## Backend / Cloud Functions

- The site uses Firebase (Firestore + Auth) as its backend — it is not a purely static site anymore, though every public page is still standalone HTML.
- `functions/` is a Firebase Cloud Functions codebase (Node.js, deployed separately via `firebase deploy --only functions`). It has its own `package.json` and uses npm — this is normal and expected for Cloud Functions, unlike the site pages themselves.
- New Firestore documents in `quoteRequests` trigger `notifyOnNewQuote`, which emails the business via Resend when a new lead comes in.
- Any new Cloud Function needs: the Firebase project on the Blaze (pay-as-you-go) plan, and secrets set via `firebase functions:secrets:set` rather than hardcoded keys.
- Requires the site owner to run CLI commands and manage a few external accounts (Firebase, Resend) — follow the "Working With the Site Owner" guidance above for all of it.

## Performance Considerations

- Don't add heavy libraries or large images without compression
- Keep inline JS minimal — just what's needed for the page's interactive features
- Use `loading="lazy"` on images below the fold
- Preconnect to Google Fonts (`fonts.googleapis.com`, `fonts.gstatic.com`)
