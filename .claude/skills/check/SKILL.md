---
name: check
description: Run the pre-publish checks on the fixmyPhone site — broken links and anchors, HTML structure, inline JS syntax, JSON-LD validity, accessibility, SEO metadata, sitemap consistency, stale compiled Tailwind CSS, and content accuracy. Use before committing or pushing, after editing any page, or when asked to verify the site is sound.
---

# Pre-publish check

Run this before any commit or push, and after editing any page.

```bash
node .claude/skills/check/check.js
```

Add `--quick` to skip the Tailwind rebuild comparison (a few seconds faster,
but then it cannot tell you whether `styles.css` is stale).

Everything is read from the working tree. It never touches the live site, the
database, or the network — safe to run at any time.

## Reading the output

**MUST FIX** — blocking. The script exits `1`, so a deploy should not proceed.
These are things that are actually broken: a link to a file that doesn't exist,
unbalanced tags, a JS syntax error, invalid JSON-LD, a form field with no
label, `target="_blank"` without `rel="noopener"`, a stale `styles.css`, a
sitemap entry contradicting a `noindex`, or the old street address reappearing.

**WORTH A LOOK** — non-blocking judgement calls: an over-long title, a meta
description outside 70–160 characters, a heading level skip, an image with no
width/height, a page missing from the sitemap.

**NOTES** — informational, no action implied: how many placeholder images
remain, whether the testimonials section is still empty.

## What to do about a failure

Fix it and re-run rather than explaining it away. Two have a specific remedy:

- **`styles.css` is STALE** — rebuild and commit the result, or the new
  Tailwind classes silently do nothing in production:
  ```bash
  node node_modules/tailwindcss/lib/cli.js -i tailwind-input.css -o styles.css --minify
  ```
- **old street address / walk-in wording** — the business is pick-up and
  delivery only in Mysuru. Remove it; don't soften it.

## Known non-issues

Don't "fix" these — the checks already account for them:

- `admin.html` and `quote-confirmation.html` have no canonical tag or meta
  description on purpose; they are `noindex`, and the SEO checks skip such
  pages.
- Blog posts link to `facebook.com/sharer` — those are share buttons for
  visitors, not links to a company page (there isn't one).
- Apostrophes inside a double-quoted `content="…"` attribute are fine; the
  description length check is quote-aware.

## Scope

Static analysis only. It cannot tell you whether the Firestore rules let the
quote form write — that needs a real submission through a browser, because the
rule checks a server-resolved timestamp.
