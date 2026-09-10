#!/usr/bin/env node
/**
 * Pre-publish checks for the fixmyPhone site.
 *
 * Static-only: it reads the files in the working tree and never touches the
 * live site or the database. Safe to run any time.
 *
 *   node .claude/skills/check/check.js            all checks
 *   node .claude/skills/check/check.js --quick    skip the Tailwind rebuild
 *
 * Exits 1 if anything in the FAIL tier is found, so it can gate a deploy.
 */

const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");
const os = require("os");

const ROOT = process.cwd();
const QUICK = process.argv.includes("--quick");

if (!fs.existsSync(path.join(ROOT, "index.html"))) {
  console.error(`Run this from the project root (no index.html in ${ROOT}).`);
  process.exit(2);
}

const fails = [];   // block a deploy
const warns = [];   // worth a look, not blocking
const notes = [];   // informational

const fail = (check, msg) => fails.push({ check, msg });
const warn = (check, msg) => warns.push({ check, msg });
const note = (check, msg) => notes.push({ check, msg });

function walkHtml(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (["node_modules", ".git", ".firebase", ".claude", ".kiro"].includes(e.name)) continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walkHtml(p, out);
    else if (e.name.endsWith(".html")) out.push(p);
  }
  return out;
}

const files = walkHtml(ROOT).sort();
const rel = (f) => path.relative(ROOT, f).replace(/\\/g, "/");

/** Reads an attribute value, respecting whichever quote character opened it. */
function attrValue(html, re) {
  const m = html.match(re);
  if (!m) return null;
  return m[2] !== undefined ? m[2] : m[3];
}

// ---------------------------------------------------------------- 1. links
{
  const ids = new Map();
  for (const f of files) {
    const set = new Set();
    for (const m of fs.readFileSync(f, "utf8").matchAll(/\bid\s*=\s*["']([^"']+)["']/g)) set.add(m[1]);
    ids.set(path.resolve(f), set);
  }

  for (const f of files) {
    const html = fs.readFileSync(f, "utf8");
    const dir = path.dirname(f);
    for (const m of html.matchAll(/\b(?:href|src)\s*=\s*["']([^"']+)["']/g)) {
      const url = m[1].trim();
      if (!url || /^(https?:|data:|mailto:|tel:|javascript:|#)/i.test(url)) continue;
      if (url.includes("${")) continue; // JS template literal, not a real path

      const [p, hash] = url.split("#");
      const target = p === ""
        ? f
        : p.startsWith("/") ? path.join(ROOT, p) : path.resolve(dir, p);

      if (!fs.existsSync(target)) {
        fail("links", `${rel(f)} -> ${url} (file does not exist)`);
        continue;
      }
      if (hash) {
        const set = ids.get(path.resolve(target));
        if (set && !set.has(hash)) fail("links", `${rel(f)} -> ${url} (no element with that id)`);
      }
    }
  }
}

// ------------------------------------------------- 2. structure + inline JS
{
  const CONTAINERS = ["html", "head", "body", "header", "footer", "main", "nav",
                      "section", "div", "form", "table", "ul", "ol", "li", "a",
                      "button", "select", "textarea", "article"];
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "fmp-check-"));

  for (const f of files) {
    const html = fs.readFileSync(f, "utf8");
    const clean = html
      .replace(/<script[\s\S]*?<\/script>/gi, "")
      .replace(/<style[\s\S]*?<\/style>/gi, "")
      .replace(/<!--[\s\S]*?-->/g, "");

    for (const tag of CONTAINERS) {
      const open = (clean.match(new RegExp(`<${tag}(?=[\\s>])`, "gi")) || []).length;
      const close = (clean.match(new RegExp(`</${tag}\\s*>`, "gi")) || []).length;
      if (open !== close) fail("structure", `${rel(f)}: <${tag}> ${open} open vs ${close} close`);
    }

    let i = 0;
    for (const m of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)) {
      const [, attrs, code] = m;
      if (/\bsrc\s*=/i.test(attrs) || !code.trim()) continue;

      if (/application\/ld\+json/i.test(attrs)) {
        try {
          const obj = JSON.parse(code);
          for (const n of Array.isArray(obj) ? obj : [obj]) {
            if (!n["@context"]) warn("schema", `${rel(f)}: @type=${n["@type"]} has no @context`);
            if (JSON.stringify(n).includes("placehold.co"))
              warn("schema", `${rel(f)}: @type=${n["@type"]} references a placeholder image`);
          }
        } catch (e) {
          fail("schema", `${rel(f)}: invalid JSON-LD — ${e.message}`);
        }
        continue;
      }

      const isModule = /type\s*=\s*["']module["']/i.test(attrs);
      const jf = path.join(tmp, `${rel(f).replace(/[\/.]/g, "_")}_${++i}.${isModule ? "mjs" : "js"}`);
      fs.writeFileSync(jf, code);
      try {
        execFileSync(process.execPath, ["--check", jf], { stdio: "pipe" });
      } catch (e) {
        fail("js", `${rel(f)} script #${i}: ${String(e.stderr).split("\n")[1] || "syntax error"}`);
      }
    }
  }
  fs.rmSync(tmp, { recursive: true, force: true });
}

// -------------------------------------------------------- 3. a11y + SEO
{
  for (const f of files) {
    const html = fs.readFileSync(f, "utf8");
    const clean = html.replace(/<script[\s\S]*?<\/script>/gi, "").replace(/<style[\s\S]*?<\/style>/gi, "");
    const noindex = /content=["'][^"']*noindex/i.test(html);

    if (!/<html[^>]+lang=/i.test(html)) fail("a11y", `${rel(f)}: <html> has no lang attribute`);
    if (!/name=["']viewport["']/i.test(html)) fail("a11y", `${rel(f)}: no viewport meta`);

    for (const m of clean.matchAll(/<img\b[^>]*>/gi)) {
      if (!/\balt\s*=/i.test(m[0])) fail("a11y", `${rel(f)}: <img> without alt — ${m[0].slice(0, 70)}`);
      if (!/\bwidth\s*=/i.test(m[0])) warn("perf", `${rel(f)}: <img> without width/height (layout shift)`);
    }

    const labelled = new Set([...clean.matchAll(/<label[^>]+for\s*=\s*["']([^"']+)["']/gi)].map((m) => m[1]));
    for (const m of clean.matchAll(/<(input|select|textarea)\b[^>]*>/gi)) {
      const type = (m[0].match(/type\s*=\s*["']([^"']+)["']/i) || [])[1] || "text";
      if (["hidden", "submit", "button", "reset"].includes(type.toLowerCase())) continue;
      const id = (m[0].match(/\bid\s*=\s*["']([^"']+)["']/) || [])[1];
      if (!/aria-label/i.test(m[0]) && !(id && labelled.has(id)))
        fail("a11y", `${rel(f)}: form field with no label — ${m[0].slice(0, 70)}`);
    }

    for (const m of clean.matchAll(/<a\b[^>]*target\s*=\s*["']_blank["'][^>]*>/gi))
      if (!/rel\s*=\s*["'][^"']*noopener/i.test(m[0]))
        fail("security", `${rel(f)}: target="_blank" without rel="noopener"`);

    const heads = [...clean.matchAll(/<h([1-6])\b/gi)].map((m) => +m[1]);
    if (heads.filter((h) => h === 1).length !== 1)
      warn("a11y", `${rel(f)}: ${heads.filter((h) => h === 1).length} <h1> tags (expected 1)`);
    for (let i = 1; i < heads.length; i++)
      if (heads[i] - heads[i - 1] > 1) { warn("a11y", `${rel(f)}: heading jumps h${heads[i-1]} -> h${heads[i]}`); break; }

    if (noindex) continue; // the checks below only matter for indexable pages

    const title = (html.match(/<title>([\s\S]*?)<\/title>/i) || [])[1];
    if (!title) fail("seo", `${rel(f)}: no <title>`);
    else if (title.trim().replace(/\s+/g, " ").length > 60)
      warn("seo", `${rel(f)}: title is ${title.trim().replace(/\s+/g," ").length} chars, Google truncates near 60`);

    const desc = attrValue(html, /name=["']description["']\s*\n?\s*content=("([^"]*)"|'([^']*)')/i);
    if (!desc) warn("seo", `${rel(f)}: no meta description`);
    else {
      const n = desc.replace(/\s+/g, " ").trim().length;
      if (n > 160 || n < 70) warn("seo", `${rel(f)}: meta description is ${n} chars (aim 70-160)`);
    }

    if (!/rel=["']canonical["']/i.test(html)) warn("seo", `${rel(f)}: no canonical link`);
    if (/og:image[\s\S]{0,80}placehold\.co/i.test(html))
      fail("seo", `${rel(f)}: og:image is still a placeholder`);
  }
}

// ------------------------------------------------------------- 4. sitemap
{
  const smPath = path.join(ROOT, "sitemap.xml");
  if (!fs.existsSync(smPath)) fail("sitemap", "sitemap.xml is missing");
  else {
    const sm = fs.readFileSync(smPath, "utf8");
    const urls = [...sm.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
    for (const u of urls) {
      let p = u.replace(/^https?:\/\/[^/]+/, "");
      if (p === "" || p === "/") p = "/index.html";
      const target = path.join(ROOT, p);
      if (!fs.existsSync(target)) fail("sitemap", `lists ${u} but the file does not exist`);
      else if (/content=["'][^"']*noindex/i.test(fs.readFileSync(target, "utf8")))
        fail("sitemap", `lists ${u} but that page is marked noindex — contradictory`);
    }
    for (const f of files) {
      const r = rel(f);
      if (/content=["'][^"']*noindex/i.test(fs.readFileSync(f, "utf8"))) continue;
      if (r === "404.html") continue;
      const listed = urls.some((u) => u.endsWith(r) || (r === "index.html" && /\/$/.test(u)));
      if (!listed) warn("sitemap", `${r} is indexable but missing from sitemap.xml`);
    }
  }
}

// ------------------------------------------------- 5. is styles.css stale?
if (!QUICK) {
  const cli = path.join(ROOT, "node_modules/tailwindcss/lib/cli.js");
  if (!fs.existsSync(cli)) {
    note("tailwind", "tailwindcss not installed — skipped the stale-CSS check");
  } else {
    const tmpOut = path.join(os.tmpdir(), `fmp-styles-${Date.now()}.css`);
    try {
      execFileSync(process.execPath, [cli, "-i", "tailwind-input.css", "-o", tmpOut, "--minify"],
                   { cwd: ROOT, stdio: "pipe" });
      const built = fs.readFileSync(tmpOut, "utf8");
      const committed = fs.existsSync(path.join(ROOT, "styles.css"))
        ? fs.readFileSync(path.join(ROOT, "styles.css"), "utf8") : "";
      if (built !== committed)
        fail("tailwind", "styles.css is STALE — rebuild it or new classes will do nothing in production");
      else note("tailwind", "styles.css matches the markup");
      fs.unlinkSync(tmpOut);
    } catch (e) {
      note("tailwind", `could not run the Tailwind build (${String(e.message).slice(0, 60)})`);
    }
  }
}

// ------------------------------------------------------ 6. content smells
{
  let placeholders = 0;
  for (const f of files) placeholders += (fs.readFileSync(f, "utf8").match(/placehold\.co/g) || []).length;
  if (placeholders) note("content", `${placeholders} placehold.co placeholder images still in use`);

  const idx = path.join(ROOT, "index.html");
  if (fs.existsSync(idx)) {
    const html = fs.readFileSync(idx, "utf8");
    if (/<!--\s*Testimonials Section\s*-->\s*<!--/.test(html))
      note("content", "the testimonials section on index.html is still empty");
    if (/Visit Our Store|visit our store/.test(html))
      fail("content", "index.html implies a walk-in store — the business is pick-up/delivery only");
  }
  for (const f of files) {
    if (/#\s*2259|Bogadhi 2nd stage/.test(fs.readFileSync(f, "utf8")))
      fail("content", `${rel(f)}: contains the old street address (business takes no walk-ins)`);
  }
}

// ------------------------------------------------------------------ report
const group = (arr) => {
  const by = new Map();
  for (const { check, msg } of arr) {
    if (!by.has(check)) by.set(check, []);
    by.get(check).push(msg);
  }
  return by;
};

function print(title, arr, mark) {
  if (!arr.length) return;
  console.log(`\n${title} (${arr.length})`);
  for (const [check, msgs] of group(arr)) {
    console.log(`  ${check}`);
    const shown = msgs.slice(0, 12);
    shown.forEach((m) => console.log(`    ${mark} ${m}`));
    if (msgs.length > shown.length) console.log(`    … and ${msgs.length - shown.length} more`);
  }
}

console.log(`fixmyPhone pre-publish check — ${files.length} pages`);
print("MUST FIX", fails, "x");
print("WORTH A LOOK", warns, "!");
print("NOTES", notes, "-");

console.log("");
if (fails.length) {
  console.log(`FAILED — ${fails.length} blocking issue(s), ${warns.length} warning(s).`);
  process.exit(1);
}
console.log(`PASSED — no blocking issues${warns.length ? `, ${warns.length} warning(s) worth a look` : ""}.`);
