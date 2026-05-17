# Repository Audit Report

## 1. Executive Summary

This is a polished, zero-dependency, vanilla HTML/CSS/JS personal portfolio site for Eitan Proshizki, targeting a GitHub Pages deployment at `https://IsraelEitan.github.io`. The visual design is professional and the JavaScript is well-structured. However, the repository has a critical file corruption bug in its primary page that renders content after the closing `</html>` tag, a broken download link (the `resume.pdf` asset is missing from the repository), and several production-readiness gaps common to personal sites deployed without a build pipeline: no `.gitignore`, no CI/CD, incomplete Open Graph metadata, no SEO support files, no print stylesheet, and duplicated sidebar markup across all five HTML pages. None of these are security emergencies, but several (the broken PDF link, the duplicate HTML content in `index.html`) will directly harm a recruiter's first impression.

---

## 2. Confirmed Repository Facts

- **Branch:** `main`
- **Remote:** `https://github.com/IsraelEitan/IsraelEitan.github.io.git` (GitHub Pages repository)
- **Working tree:** Clean (confirmed by git status at conversation start)
- **Committed files (tracked by git):** `index.html`, `style.css`, `main.js`, `resume.html`, `projects.html`, `about.html`, `stats.html`, `avatar.png`, `favicon.svg`
- **Stack:** Pure HTML5 / CSS3 / ES2020 vanilla JavaScript — no npm, no bundler, no framework, no build step (self-declared in `stats.html` lines 351–353 and confirmed by absence of `package.json`, `node_modules`, or any manifest file)
- **Pages:** 5 HTML pages (`index.html`, `resume.html`, `projects.html`, `about.html`, `stats.html`)
- **Single shared CSS:** `style.css` (731 lines)
- **Single shared JS:** `main.js` (173 lines), loaded with `defer` on all pages
- **Assets present:** `avatar.png`, `favicon.svg`
- **Assets absent:** `resume.pdf` — referenced 9 times across 5 pages, not tracked in git
- **Configuration files absent:** `.gitignore`, `robots.txt`, `sitemap.xml`, `CNAME`, `netlify.toml`, `vercel.json`, `_headers`, `_redirects`
- **CI/CD files:** None (no `.github/workflows/`, no Netlify or Vercel config)
- **README:** None
- **Test files:** None
- **Recent commits (5):** All authored by Eitan Proshizki, messages suggest iterative polish ("Major polish", "Fix truncated files", "Fix avatar filename")
- **Git history concern:** Commit `a633c8f` message is "Fix truncated files — full index, JS, and CSS" — the truncation problem was partially fixed but the `index.html` still contains duplicate post-`</html>` content (see Section 3)

---

## 3. Architecture Findings

### Finding 3.1 — Critical: `index.html` contains 107 lines of valid HTML after the closing `</html>` tag

- **Severity:** Critical
- **Evidence:** `index.html`, lines 437–544. The file properly closes at line 436 (`</html>`), then from line 437 onward repeats an entire second copy of the project cards section, the CTA block, and a second `<footer>`, ending with a second `</html>` at line 543. The git commit history confirms this was partially fixed in `a633c8f` ("Fix truncated files — full index, JS, and CSS") but the duplication was not fully resolved.
- **Why it matters:** Browsers are lenient and will typically render the page correctly by ignoring post-`</html>` content, but the HTML is invalid per spec. HTML validators, crawlers, and some automated accessibility tools will flag this. More importantly, the page file is about 30% larger than it should be. This also signals the file was assembled/concatenated incorrectly by an AI tool and the result was committed without validation.
- **Recommendation:** Remove everything after and including the orphaned `fill="none" stroke="#2563EB"...` fragment at line 437 through the end of the file (lines 437–544 are entirely duplicate). Validate with the W3C validator after the fix.
- **Validation path:** Run `wc -l index.html` before and after. The correct line count should be around 437.

---

### Finding 3.2 — High: `resume.pdf` is referenced 9 times across all pages but does not exist in the repository

- **Severity:** High
- **Evidence:**
  - `index.html` lines 68, 109, 417, 524 — `href="resume.pdf"` with `download` attribute
  - `resume.html` lines 40, 56 — same
  - `projects.html` line 38 — same
  - `about.html` line 115 — same
  - `stats.html` line 131 — same
  - Glob search for `*.pdf` returns no results
  - `git ls-files` (implied by Glob output) shows no PDF in the tracked file list
- **Why it matters:** Every "Download CV" button site-wide is a broken download link. A recruiter clicking the most prominent CTA will get a 404. This is the single highest-impact usability defect on the site.
- **Recommendation:** Add `resume.pdf` to the repository root and commit it. If the PDF is large, confirm GitHub Pages file size limits are respected (100 MB max per file). After adding, verify the download works from the deployed URL.
- **Validation path:** After adding the file: `git ls-files | grep resume.pdf` should return a result. Load the deployed GitHub Pages URL and click "Download CV."

---

### Finding 3.3 — Medium: Sidebar HTML is duplicated verbatim across all 5 pages with no shared include mechanism

- **Severity:** Medium
- **Evidence:** The `<aside class="sidebar">` block (approximately 30 lines) is copy-pasted identically into `index.html`, `resume.html`, `projects.html`, `about.html`, and `stats.html`. Small differences exist between pages (e.g., the sidebar CTA label changes from "View Resume" on `index.html` to "Home" on `resume.html` and `projects.html`), confirming these are independent copies, not a shared template.
- **Why it matters:** Any change to sidebar content (phone number, bio text, a new social link) must be made in 5 places. The inconsistencies already present (different CTA labels, slightly different bio text) are evidence that drift has already begun. This is a maintainability risk that grows with every edit.
- **Recommendation:** Since the stack is zero-dependency vanilla HTML, options are: (a) migrate to a static site generator (11ty, Hugo, or Jekyll for GitHub Pages native support) that supports layouts/partials; (b) use a minimal HTML include via JavaScript fetch (adds a network request); or (c) accept the duplication but document a checklist that all 5 files must be touched for sidebar changes.
- **Validation path:** `grep -c "sidebar-avatar-wrap" *.html` — currently returns 5. After refactor, should return 1 in the template file.

---

### Finding 3.4 — Medium: Navigation duplication: desktop nav and mobile nav are both hard-coded on every page

- **Severity:** Medium
- **Evidence:** Each page contains two `<nav>` elements: `.top-nav` (desktop) and `.mobile-nav` (hidden by default). Both list all 5 page links. This is another 5×2 = 10 independent copies of the navigation list.
- **Why it matters:** Adding a new page requires editing 10 HTML blocks. Rename a page and 10 `href` attributes must change.
- **Recommendation:** Same as 3.3 — use a static site generator or JS-based include.
- **Validation path:** `grep -c "mobile-nav" *.html` returns 5 (one per page).

---

### Finding 3.5 — Low: No `CNAME` file — canonical domain will be `IsraelEitan.github.io`, not a custom domain

- **Severity:** Low
- **Evidence:** No `CNAME` file present. The `og:url` in `index.html` line 11 is `https://IsraelEitan.github.io`, confirming the intended deployment is the default GitHub Pages subdomain.
- **Why it matters:** Not a defect if a custom domain is not intended. If a custom domain is added later, the `og:url` and `og:image` absolute URLs must be updated.
- **Recommendation:** If a custom domain is eventually added, commit a `CNAME` file and update all absolute URLs.
- **Validation path:** GitHub Pages settings in the repository.

---

## 4. Code Quality / HTML / CSS / JS Findings

### Finding 4.1 — Medium: Page-specific CSS is embedded as `<style>` blocks inside `about.html` and `stats.html` rather than consolidated in `style.css`

- **Severity:** Medium
- **Evidence:**
  - `about.html` lines 13–67: 55 lines of inline CSS covering `.about-hero`, `.principles-grid`, `.principle-card`, `.philosophy-card`, `.domain-grid`, and related classes
  - `stats.html` lines 13–80: 68 lines of inline CSS covering `.stats-hero`, `.kpi-grid`, `.kpi-card`, `.career-chart-row`, `.radar-grid`, `.gh-card`, `.v2-table-wrap`
- **Why it matters:** The single `style.css` file is referenced on all pages, but page-specific styles are not in it. This splits styling across three locations, makes theming (especially dark mode CSS variable overrides) harder to reason about, and means `style.css` is incomplete as a single source of truth.
- **Recommendation:** Move all `<style>` block content into `style.css` under clearly labelled page-section comments.
- **Validation path:** Confirm `about.html` and `stats.html` contain no `<style>` elements after the consolidation. Run visual regression comparison before/after.

---

### Finding 4.2 — Medium: Resume page (`resume.html`) is missing CSS class definitions for several classes it uses

- **Severity:** Medium
- **Evidence:**
  - `resume.html` uses `.page-title` (line 48), `.resume-topbar` (line 50), `.resume-nav` (line 51), `.resume-section` (lines 59, 71, 147), `.edu-item` (line 61), `.edu-degree` (line 63), `.edu-school` (line 64), `.edu-detail` (line 65), `.edu-date` (line 67)
  - Searching `style.css` for these class names returns zero results for `.page-title`, `.resume-topbar`, `.resume-nav`, `.resume-section`, `.edu-item`, `.edu-degree`, `.edu-school`, `.edu-detail`, `.edu-date`
  - The only resume-related CSS in `style.css` is `.resume-section-title` (line 411)
- **Why it matters:** These elements render with no layout or typographic styling — they fall back to browser defaults. The resume page's Education section and top navigation bar are visually unstyled. This is a significant presentation defect on the most important page for a recruiter.
- **Recommendation:** Add CSS definitions for all missing classes in `style.css`. Cross-reference every class name used in `resume.html` against `style.css`.
- **Validation path:** Open `resume.html` in a browser and inspect the Education section and the Resume in-page nav. Unstyled text and missing layout confirm the gap.

---

### Finding 4.3 — Medium: `animateCounter` in `main.js` does not handle the `"1M+"` and `"12+"` data-target values correctly

- **Severity:** Medium
- **Evidence:** `main.js` lines 63–76. The function strips non-numeric characters from `data-target` via `target.replace(/[^0-9.]/g, '')`. For `"1M+"`, this yields `"1"`, not `1000000`. The counter will animate from 0 to 1 and display "1M+", not animate through realistic intermediate values. For `"12+"`, it yields `"12"`, which works correctly as a plain integer. For `"70%"`, it yields `"70"`, which works. The `"1M+"` case is the only broken one — the animation counts 0 → 1 instantly then snaps to "1M+".
- **Why it matters:** The animated counter on the hero section (`index.html` line 124) is meant to be a visual engagement element. The "Daily Transactions" counter does not animate meaningfully because the numeric target parsed is `1`, not `1000000`.
- **Recommendation:** Add special-case handling in `animateCounter` for values containing `M` (multiply extracted number by 1,000,000). Alternatively use a lookup approach: detect suffix before stripping and scale accordingly.
- **Validation path:** Load `index.html` in a browser and scroll to the stats row. Observe whether the "Daily Transactions" counter animates or immediately shows "1M+".

---

### Finding 4.4 — Low: `style.css` has one `!important` declaration and a duplicate `@media (max-width:900px)` block

- **Severity:** Low
- **Evidence:**
  - Line 541: `.nav-links a.active { background:var(--accent); color:#fff !important; font-weight:700; }` — the `!important` overrides the cascade to force white text on an active link. This was added as a fix for dark mode contrast but is a code smell.
  - There are two separate `@media (max-width:900px)` blocks in `style.css` — one at line 490 and another at line 546. These are not wrong (CSS merges them) but they indicate the stylesheet grew without organization. Maintaining two separate mobile breakpoint blocks increases the chance of conflicting rules.
- **Recommendation:** Merge the two `@media (max-width:900px)` blocks. Eliminate the `!important` by raising specificity (e.g., `.nav-links a.active:link, .nav-links a.active:visited { color:#fff; }`).
- **Validation path:** Search `style.css` for `@media` — there should be exactly 3 breakpoint blocks (900px, 700px, 600px), each appearing once.

---

### Finding 4.5 — Low: Inconsistent accessibility on interactive elements across pages

- **Severity:** Low
- **Evidence:**
  - `index.html` line 34: `theme-toggle` button has `aria-label="Toggle dark mode"`. `about.html` line 82 and `stats.html` line 98 also have it.
  - `resume.html` line 22 and `projects.html` line 20: `theme-toggle` button has NO `aria-label` attribute.
  - `resume.html` line 23 and `projects.html` line 21: `mobile-menu-btn` has NO `aria-label` and NO `aria-expanded`.
  - Social link icons in `resume.html` and `projects.html` have no `title` attribute (unlike `index.html` which includes `title="GitHub"` etc.).
- **Why it matters:** Screen reader users will hear "button" with no description on the theme toggle and hamburger menu on resume and projects pages. Icon-only buttons without accessible labels are a WCAG 2.1 Level A failure.
- **Recommendation:** Add `aria-label="Toggle dark mode"` to the theme toggle and `aria-label="Open menu"` / `aria-expanded="false"` to the mobile menu button on all pages. Add `title` attributes to social link SVG icons on all pages.
- **Validation path:** Run axe DevTools or browser accessibility audit on `resume.html` and `projects.html`.

---

## 5. Testing Findings

### Finding 5.1 — High: Zero automated tests of any kind

- **Severity:** High
- **Evidence:** No test files exist in the repository. No `package.json` (which would host a test script). No testing framework configuration. No `.spec.js`, `.test.js`, or similar files.
- **Why it matters:** For a static personal site this is expected, but there are several JavaScript behaviors that have already failed silently (the `animateCounter` edge case, the truncated HTML file). Even a minimal HTML validation step in CI would have caught the `index.html` truncation before it was published.
- **Recommendation:** At a minimum, add a W3C HTML validation step and a link checker to CI (e.g., `html-validate` or `validator.nu` via curl). For JS, a single Playwright or Puppeteer smoke test that loads each page and verifies: (a) the page title is correct, (b) the nav links resolve, and (c) the "Download CV" button links to an existing file would catch both current critical bugs.
- **Validation path:** There are currently no tests to run. After adding them, CI should show green on all 5 pages.

---

## 6. Security / Configuration Findings

### Finding 6.1 — Medium: Personal email address (`israel.e.pro@gmail.com`) is present in plaintext across all 5 pages with no obfuscation

- **Severity:** Medium (context-appropriate; this is a portfolio site where contact is desired)
- **Evidence:**
  - `index.html` lines 61, 76, 113, 413, 426 — appears 5 times in one page
  - Same pattern in all other pages
  - Appears in `mailto:` links, as visible text in the sidebar, in the footer, and in CTA buttons
- **Why it matters:** On a public GitHub repository and a public GitHub Pages site, this email is fully indexable and will be harvested by spam scrapers. This is an accepted trade-off for a portfolio, but the owner should be aware it will result in spam. For a slightly more robust approach, CSS-only obfuscation or a contact form can be used.
- **Recommendation:** Accept the trade-off as a known risk, or use a contact form service (Formspree, Netlify Forms) that proxies the email. Do not commit to encoding the email in JavaScript as that provides minimal protection and adds complexity.
- **Validation path:** Confirmed by reading each file. No action required if accepted.

---

### Finding 6.2 — Medium: Open Graph image tag is inconsistent — three different values across pages, one is a relative path

- **Severity:** Medium
- **Evidence:**
  - `index.html` line 10: `content="https://IsraelEitan.github.io/avatar.png"` — absolute URL, correct
  - `about.html` line 9: `content="avatar.png"` — relative path, will not resolve when shared on social media
  - `stats.html` line 9: `content="avatar.png"` — same broken relative path
  - `resume.html` and `projects.html`: No `og:image` tag at all
- **Why it matters:** When a recruiter shares any page except the homepage on LinkedIn or Slack, the preview card will not show the profile photo. The relative path `avatar.png` is invalid for OG tags — social crawlers require absolute URLs.
- **Recommendation:** Update all `og:image` values to `https://IsraelEitan.github.io/avatar.png` (absolute). Also add complete OG tags (`og:url`, `og:type`, `og:description`, `twitter:card`) to `resume.html` and `projects.html`.
- **Validation path:** Test with LinkedIn Post Inspector against each page URL after deployment.

---

### Finding 6.3 — Low: No Content Security Policy, X-Frame-Options, or other security headers

- **Severity:** Low (standard for GitHub Pages static sites)
- **Evidence:** No `_headers` file (Netlify) or equivalent configuration. GitHub Pages does not support custom HTTP headers natively.
- **Why it matters:** For a read-only portfolio site this poses minimal risk. No user data is collected, no forms submit to a backend, no sensitive content is served. The site is vulnerable to being embedded in an iframe (`X-Frame-Options: DENY` is absent) but no attack vector exists via that mechanism here.
- **Recommendation:** If the site is ever migrated to Netlify or Vercel, add a `_headers` or `vercel.json` with standard security headers. Not urgent for the current use case.
- **Validation path:** Check response headers via `curl -I https://IsraelEitan.github.io` after deployment.

---

### Finding 6.4 — Low: No `.gitignore` file

- **Severity:** Low
- **Evidence:** Glob for `.gitignore` returns no results. The `.git/info/exclude` file exists (default Git structure) but is empty by convention.
- **Why it matters:** Without `.gitignore`, OS-level files (`.DS_Store` on macOS, `Thumbs.db` on Windows), editor files (`.vscode/`, `.idea/`), and temporary files can be accidentally committed. This repository is on Windows (evidenced by the path) where `Thumbs.db` is particularly common.
- **Recommendation:** Add a `.gitignore` covering at minimum: `Thumbs.db`, `.DS_Store`, `*.log`, `.vscode/` (already a `.claude/` directory is tracked — that is intentional).
- **Validation path:** `git status` should show no untracked junk files after adding `.gitignore`.

---

## 7. CI/CD / DevOps Findings

### Finding 7.1 — High: No CI/CD pipeline of any kind

- **Severity:** High
- **Evidence:** No `.github/workflows/` directory exists. No `netlify.toml`. No `vercel.json`. No CI configuration of any type.
- **Why it matters:** Every push to `main` is deployed directly to GitHub Pages with zero validation. The truncated `index.html` and the broken PDF link are live (or will be upon next push) because there is no automated gate. A broken HTML validator would have caught Finding 3.1 before it ever reached the remote.
- **Recommendation:** Add a minimal GitHub Actions workflow at `.github/workflows/validate.yml` that runs on push to `main`:
  1. HTML validation using `html-validate` (npm) or `nu-html-checker`
  2. Dead link check using `lychee` or `htmltest` (will catch the missing `resume.pdf`)
  3. (Optional) Lighthouse CI for performance regression detection
  The site deploys to GitHub Pages automatically via the Pages setting — no deployment step is needed in CI, only a quality gate.
- **Validation path:** After adding the workflow, a push with the broken `index.html` or a missing `resume.pdf` link should fail CI before deployment.

---

### Finding 7.2 — Medium: No `robots.txt` or `sitemap.xml`

- **Severity:** Medium
- **Evidence:** Glob searches for `robots.txt` and `sitemap.xml` return no results.
- **Why it matters:** Without `robots.txt`, search engines will crawl freely (acceptable) but there is no opportunity to signal preferred crawl behavior. Without `sitemap.xml`, Google and Bing may not discover all 5 pages, particularly the inner pages like `stats.html` and `about.html` which have no inbound links from external sites. For a recruiter-facing site where Google discoverability matters (the owner may wish their name to appear in search results), this is a real gap.
- **Recommendation:** Add `robots.txt` with `User-agent: * / Allow: /` and a `Sitemap:` directive pointing to the sitemap URL. Add `sitemap.xml` listing all 5 pages with their last-modified dates and priority hints (`index.html` priority 1.0, others 0.8).
- **Validation path:** After adding both files, submit the sitemap to Google Search Console.

---

### Finding 7.3 — Low: Google Fonts loaded without `preconnect` hint

- **Severity:** Low
- **Evidence:** `style.css` line 5: `@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500&display=swap');`
- Note: The URL includes `display=swap` at the end of the query string, which is the correct `font-display: swap` parameter for Google Fonts CSS. This is correct.
- However, there is no `<link rel="preconnect" href="https://fonts.googleapis.com">` in any HTML `<head>`. Without a DNS preconnect hint, the browser must complete a full DNS + TCP + TLS handshake to `fonts.googleapis.com` before it can even request the CSS that triggers the font download.
- **Why it matters:** On a slow connection this adds 100–300ms to font load time before text renders. The `font-display: swap` in the Google Fonts URL is correctly set, so text will be visible in a fallback font while loading, but the swap can cause FOUT (flash of unstyled text) — a minor LCP impact.
- **Recommendation:** Add to the `<head>` of all pages: `<link rel="preconnect" href="https://fonts.googleapis.com">` and `<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>`.
- **Validation path:** Lighthouse performance audit — check "Eliminate render-blocking resources" and "Preconnect to required origins" diagnostics.

---

## 8. Maintainability / Naming / Folder Structure Findings

### Finding 8.1 — Medium: All assets are in the root directory — no subdirectory organization

- **Severity:** Medium
- **Evidence:** All 8 tracked files (`index.html`, `resume.html`, `projects.html`, `about.html`, `stats.html`, `style.css`, `main.js`, `avatar.png`, `favicon.svg`) are in the repository root.
- **Why it matters:** For a 5-page site this is currently manageable. However, adding images, a second JS file, or any additional page will quickly create a cluttered root. The `resume.pdf` (when added) will also land in the root.
- **Recommendation:** Consider a `/assets/` subdirectory for images (`avatar.png`, `favicon.svg`, future images) and `/css/`, `/js/` for stylesheets and scripts. This is a cosmetic improvement at current scale but establishes good habits.
- **Validation path:** Count of files in root via `git ls-files | grep -v "/" | wc -l`. Currently 8 (excluding the `.claude/` subfolder item).

---

### Finding 8.2 — Medium: Employment timeline dates in `resume.html` and `stats.html` are inconsistent

- **Severity:** Medium (content quality, not code quality — relevant for a portfolio)
- **Evidence:**
  - `resume.html` line 79: Matrix / FinTech Division — `2020 – Present`
  - `stats.html` line 194: Matrix / FinTech — `4 yrs` with `2022–now`
  - `resume.html` line 97: NCR Corporation — `2017 – 2020`
  - `stats.html` line 198: NCR Corporation — `3 yrs` with `2019–2022`
  - `resume.html` line 116: Infinity Labs — `2015 – 2017`
  - `stats.html` line 203: Infinity Labs R&D — `1.5 yrs` with `2017–2019`
  - `resume.html` line 128: Sela Systems & Uniterra — `2012 – 2015`
  - `stats.html` line 209: Uniterra — `2 yrs` with `2015–2017`; and separately Sela Systems `2013–2015`
- **Why it matters:** A recruiter who reads both `resume.html` and `stats.html` will see inconsistent date ranges. For example, Matrix starts in 2020 on the resume but 2022 on the stats chart. Infinity Labs is 2015–2017 on the resume but 2017–2019 on the chart. This appears to be a data integrity error that a technical recruiter would notice and may question the accuracy of other claims.
- **Recommendation:** Decide on canonical dates and propagate consistently. The resume dates should be treated as authoritative.
- **Validation path:** Cross-compare every company's dates in `resume.html` and `stats.html` side-by-side after correction.

---

### Finding 8.3 — Low: `about.html` uses a mix of Unicode numeric character references and UTF-8 emoji directly

- **Severity:** Low
- **Evidence:**
  - `about.html` line 59: `<span class="sidebar-location">&#128205; Ramat Gan, Israel</span>` — numeric entity
  - `index.html` line 59: `<span class="sidebar-location">📍 Ramat Gan, Israel</span>` — direct UTF-8 emoji
  - `about.html` line 145: `<span class="principle-icon">&#127959;&#65039;</span>` — numeric entities
  - `about.html` line 164: `<span class="principle-icon">🤖</span>` — direct UTF-8
- **Why it matters:** Mixed approach increases maintenance friction. Both work correctly in modern browsers with `<meta charset="UTF-8">`, but consistency is preferable.
- **Recommendation:** Standardize on direct UTF-8 emoji throughout (simpler, more readable). All files declare `charset="UTF-8"` so there is no encoding risk.
- **Validation path:** Visual inspection after standardization.

---

## 9. Missing Information

The following could not be verified from the repository alone:

1. **Whether the site is live at `https://IsraelEitan.github.io`** — the remote exists but whether GitHub Pages is enabled in repository settings is not visible without repository access.
2. **`resume.pdf` content or existence outside the repo** — the file is not tracked. It may exist locally or may not exist at all.
3. **Whether the avatar image on GitHub profile matches `avatar.png` in the repo** — `stats.html` describes the avatar as coming from GitHub CDN but `index.html` serves it as a local file. Only a live browser test can confirm they are in sync.
4. **Browser compatibility** — no browserslist config, no transpilation. The code uses `IntersectionObserver`, `localStorage`, `window.matchMedia`, and CSS custom properties. These are supported in all modern browsers (Chrome 58+, Firefox 55+, Safari 12.1+) but IE11 would fail. Whether IE11 support matters is unknown (assumption: it does not for 2026 targets).
5. **LinkedIn profile `https://linkedin.com/in/eitan-pro`** — linked throughout but not verifiable without network access. If the LinkedIn handle has changed, all 5 pages need updating.
6. **GitHub profile `@IsraelEitan`** — referenced in `stats.html` as having 11 public repos and a latest commit of "Nov 2025." This data is hardcoded and will become stale.

---

## 10. Prioritized Backlog

- **P0 — Must fix immediately (blocks credibility of the live site):**
  - P0-1: Add `resume.pdf` to the repository root and push. Every CTA on the site is broken without it.
  - P0-2: Remove the duplicate HTML content in `index.html` from line 437 to line 544 (everything after the first `</html>`).

- **P1 — Should fix before next recruiter outreach:**
  - P1-1: Add CSS definitions for `.page-title`, `.resume-topbar`, `.resume-nav`, `.resume-section`, `.edu-item`, `.edu-degree`, `.edu-school`, `.edu-detail`, `.edu-date` so the resume page renders with correct styling.
  - P1-2: Fix all `og:image` values on `about.html` and `stats.html` from `avatar.png` to the absolute URL `https://IsraelEitan.github.io/avatar.png`. Add full OG tags to `resume.html` and `projects.html`.
  - P1-3: Resolve employment date inconsistencies between `resume.html` and `stats.html` (Matrix, NCR, Infinity Labs dates conflict).
  - P1-4: Fix `animateCounter` in `main.js` to handle `"1M+"` — the current parsed numeric value is `1`, not `1000000`.

- **P2 — Should fix to improve quality:**
  - P2-1: Add a GitHub Actions workflow with HTML validation and dead-link checking.
  - P2-2: Add `.gitignore` covering OS-specific files.
  - P2-3: Move page-specific CSS from `<style>` blocks in `about.html` and `stats.html` into `style.css`.
  - P2-4: Add `aria-label` to the theme toggle and mobile menu button on `resume.html` and `projects.html`. Add `title` attributes to icon-only social links on those pages.
  - P2-5: Add `robots.txt` and `sitemap.xml`.
  - P2-6: Add `<link rel="preconnect" href="https://fonts.googleapis.com">` and `<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>` to all pages' `<head>`.

- **P3 — Nice to have:**
  - P3-1: Consolidate duplicated sidebar and nav markup using a static site generator or JS include.
  - P3-2: Organize files into subdirectories (`/assets/`, `/css/`, `/js/`).
  - P3-3: Merge the two `@media (max-width:900px)` blocks in `style.css` and remove the single `!important` by increasing specificity.
  - P3-4: Standardize emoji representation (direct UTF-8 vs numeric HTML entities) across all pages.
  - P3-5: Add hardcoded GitHub stats refresh strategy (stats in `stats.html` show `Nov 2025` latest commit; these will become stale and look like an inactive profile).

---

## 11. Recommended Next Agent

The next step should be **coding**, not planning. The P0 items are both small, concrete, and directly harmful:

- P0-1 (`resume.pdf`) is an asset that must be provided by the human — it cannot be generated. The agent should prompt the user to supply the file, then commit it.
- P0-2 (`index.html` truncation) is a straightforward deletion of lines 437–544 from `index.html`.
- P1-1 (missing CSS classes for resume page) is a well-scoped CSS addition to `style.css`.

A coding agent should address P0-2, P1-1, P1-2, P1-3, P1-4, and P2-2 in a single session. The `resume.pdf` (P0-1) requires human input first.
