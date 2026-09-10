# fixmyPhone — gofixmyphone.com

Static HTML site for a phone repair business in Mysuru, Karnataka, India,
with a Firebase backend. 29 pages, no build step for the site itself.

## Read this first

- **No walk-in store.** The business is pick-up and delivery only, within
  Mysuru. Never add a street address, "visit us", or "our store" wording, and
  never use a schema type implying a storefront. This was corrected across the
  site on 2026-09-07 — don't reintroduce it.
- **Pushing publishes.** Netlify auto-deploys on every push to `main`. There is
  no staging. Treat `git push` as "make this live".
- **The owner is not a developer.** For anything outside the codebase — a
  console, a signup, a terminal command — give a numbered, plain-language
  checklist: what to click, what to type, what to paste back. Confirm each step
  landed before assuming the next.
- **Don't commit or push unless explicitly asked.** Batch work up; the owner
  says when.

## The build step people miss

Tailwind is **compiled** to a committed `/styles.css`; the CDN script is gone.
If you add or change any Tailwind class in any HTML file, rebuild or the class
silently does nothing in production:

```bash
node node_modules/tailwindcss/lib/cli.js -i tailwind-input.css -o styles.css --minify
```

`npm` is not available in this environment — `bun` is, so `bun run build:css`
also works. Commit the regenerated `styles.css` alongside the HTML change.

Never build a class name by concatenating a variable (`` `text-${c}-600` ``) —
Tailwind's scanner can't see it. A complete literal class string, including
inside a JS ternary, is fine.

## Layout

```
*.html            29 standalone pages (root, brands/, posts/)
shared.js         Firebase config + form submission helpers
styles.css        compiled Tailwind output (committed, do not hand-edit)
firestore.rules   database security rules
functions/        Firebase Cloud Functions (Node + npm, deployed separately)
netlify.toml      security headers only — deliberately no [build] section
.kiro/steering/   detailed conventions (NOT auto-loaded; read when relevant)
```

All page JavaScript is inline at the bottom of each file, vanilla only — no
frameworks, no external site JS, no bundler.

## Backend

- Firestore collection:
  `artifacts/fixmyphone-website-889b5/public/data/quoteRequests`
- Both the quote forms and the contact form write there (contact messages carry
  a `message` field instead of `device`/`services`).
- New documents trigger the `notifyOnNewQuote` Cloud Function, which emails the
  business through Resend.
- `admin.html` — auth-gated dashboard. `track.html` — public lookup by Quote ID.

### Security rules (deployed 2026-09-07)

| Operation | Who |
|---|---|
| `create` | anyone — the public forms, validated, `status` pinned to `"New"` |
| `get` | anyone — the tracker needs it; IDs are random 20-char strings |
| `list` / `update` / `delete` | signed-in accounts only |

This closed a real leak: the collection was previously world-readable. Two
things must stay true — Firebase **self-signup stays off**, and the create rule
requires `submittedAt == request.time`, which only resolves correctly through
the Firebase SDK in a browser (a raw REST call will fail even when the rule is
correct, so don't "fix" it based on a REST test).

Deploy with `firebase deploy --only firestore:rules`. The CLI's bin shim is
broken under bun on Windows; run it as
`node node_modules/firebase-tools/lib/bin/firebase.js`.

## Conventions

- `container mx-auto px-6` for content wrappers; mobile-first breakpoints.
- Inter font, `blue-600` primary, `gray-50`/`gray-800` grounds. No new fonts,
  no new CDN dependencies without asking, no `!important`.
- Brand name is exactly `fixmyPhone`.
- Google Analytics `G-G0DKJDMNGL` on every page — don't change the ID.
- Update `sitemap.xml` when adding or removing a page.
- Contact: +91 9008419525 (WhatsApp), support@gofixmyphone.com. WhatsApp is the
  only social channel — there is no Instagram or Facebook page yet.

See `.kiro/steering/` for page templates, the new-brand-page checklist, and the
new-blog-post checklist.

## Known open items

- 82 `placehold.co` placeholder images still need real photographs.
- The testimonials section in `index.html` is an empty comment.
- Resend still sends from its sandbox address, so lead emails land in spam;
  verifying the domain fixes it.
- The quote form's write path has not been confirmed since the rules deploy.
- No spam protection on the public form — Firebase App Check would fix it.
- Font Awesome ships 102 KB for 43 icons; self-hosting a subset would save
  ~95 KB per page.

## Stale documentation

`.kiro/steering/project-conventions.md` still lists the old street address and
footer social icons. Both were removed from the site (2026-09-07 and -09-08).
Trust this file over that one where they disagree.
