# Content Guidelines

## SEO Requirements

### Every page must have:
- Unique `<title>` — format: `[Page Topic] | fixmyPhone` or `[Page Topic] - fixmyPhone`
- `<meta name="description">` — 150–160 chars, include location "Mysore" and primary keyword
- `<meta name="keywords">` — 5–8 relevant keywords, comma-separated

### index.html additionally has:
- JSON-LD structured data (`@type: LocalBusiness`) with address, phone, hours, services
- Open graph image placeholder: `https://placehold.co/1200x630/E0E7FF/1E40AF?text=fixmyPhone`

### Brand pages SEO:
- Title format: `[Brand] Phone Repair - fixmyPhone`
- Description must mention the brand name, "repair", "Mysore", and specific services

## Brand Page Template

Each brand page under `brands/` follows this structure:

1. **Header** — sticky nav with logo + "Contact Us" CTA
2. **Progress bar** — 4-step visual wizard (Select Brand → Choose Repairs → Your Details → Confirmation)
3. **Breadcrumbs** — Home > Repair Mobile Phone > [Brand Name]
4. **Model Selection** (Step 1) — grid of phone models (injected by JS) with manual entry option
5. **Repair Selection + Summary** (Steps 2-3) — two-column layout:
   - Left: available repairs list with manual service entry
   - Right: sticky repair summary sidebar with "Get Quote" button
6. **Quote Modal** — form collecting name, phone, email, device, issue
7. **Footer** — minimal version
8. **Inline JS** — handles model data, UI interactions, form submission

### Model data format (in inline JS):
```javascript
const models = [
  { name: "Galaxy S24 Ultra", image: "https://placehold.co/..." },
  // ...
];
```

### Services data format:
```javascript
const services = [
  { name: "Screen Replacement", icon: "fa-mobile-screen", description: "..." },
  // ...
];
```

## Blog Post Template

Posts under `posts/` follow:
1. Header with nav
2. Article with `<h1>` title, publish date, author
3. Structured content with headings (h2, h3), paragraphs, lists
4. CTA section at end (link to repair_phone.html or contact.html)
5. Footer

## Content Rules

### Tone & Voice:
- Friendly, professional, and approachable
- Write for local Indian customers in Mysore
- Use simple English — avoid jargon
- Emphasize convenience (free pickup & delivery), affordability, and trust

### Business-specific content:
- Opening hours: Mon–Sat, 9:00 AM – 7:00 PM
- USP: Free pick-up and delivery within Mysore
- Discount code: FIX10 (10% off first repair) — shown in dismissible banner on index.html
- Copyright year: 2024

### Phone numbers and contact:
- Always display phone as: +91 8310061934
- Email: gofixmyphone@gmail.com
- Never fabricate alternative contact details

## Sitemap

When adding new pages, update `sitemap.xml` with the new URL. Format:
```xml
<url>
  <loc>https://gofixmyphone.com/[page-path]</loc>
  <lastmod>[YYYY-MM-DD]</lastmod>
</url>
```
