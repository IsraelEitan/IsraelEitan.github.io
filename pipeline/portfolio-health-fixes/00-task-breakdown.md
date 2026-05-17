# Portfolio Health Fixes - Task Breakdown

**Mode**: Portfolio Site Mode
**Date**: 2026-05-17
**Status**: Draft, ready for repo-auditor/architecture-planner review

## Goal

Fix the highest-impact credibility and quality issues in the static portfolio site without changing the site's product direction or introducing a framework.

## Confirmed Scope

This work targets the current static site:

- `index.html`
- `resume.html`
- `projects.html`
- `about.html`
- `stats.html`
- `style.css`
- `main.js`
- root-level static assets

## Out Of Scope

- Migrating to Next.js, React, or another framework
- Adding backend APIs
- Adding a database
- Adding authentication
- Adding Docker/Kubernetes deployment
- Reorganizing the whole repository into `/assets`, `/css`, `/js`
- Rewriting visual identity or content strategy

## Acceptance Criteria

1. `index.html` contains one complete HTML document and no duplicated content after the first closing `</html>`.
2. `resume.pdf` handling is resolved:
   - either the file exists at repository root, or
   - all download CTAs are changed to a non-broken fallback until the PDF is provided.
3. `resume.html` visual structure is styled; classes used by the page have matching CSS in `style.css`.
4. Career date ranges are consistent between `resume.html` and `stats.html`.
5. `main.js` counter logic handles compact values such as `1M+` correctly.
6. Open Graph image metadata uses absolute image URLs on all relevant pages.
7. Icon-only buttons on all pages have accessible names and correct menu state attributes.
8. Static validation has a repeatable path:
   - HTML structure check
   - broken-link check or documented manual equivalent
   - browser smoke check for all five pages

## Recommended Agent Route

1. `repo-auditor`
   - Read `docs/audits/repo-audit-initial.md`.
   - Confirm whether the findings are still current.
   - Write or update `pipeline/portfolio-health-fixes/01-audit-report.md`.

2. `architecture-planner`
   - Use Portfolio Site Mode.
   - Decide whether each fix is direct implementation or needs a small plan.
   - No API contract or ADR is required unless the scope changes.

3. `frontend-builder`
   - Implement HTML/CSS/JS fixes only.
   - Keep the zero-build static-site architecture.

4. `e2e-tester` or `test-writer`
   - Add or document static validation.
   - If adding tooling, keep it minimal and justified.

5. `security-agent`
   - Review static-site exposure, metadata, external links, and contact-info tradeoffs.

6. `pr-reviewer`
   - Review the final diff and write PR notes.

7. `docs-agent`
   - Update any audit/readme/changelog docs that need to reflect the fixes.

## Risks

- `resume.pdf` requires a real file from the site owner unless the CTAs are temporarily changed.
- Career dates are content facts. If the repo has conflicting dates, the owner should confirm canonical values.
- Adding validation tooling may require a package manager; this should be a deliberate decision, not an accidental framework migration.

## Suggested First Implementation Batch

Batch 1 should be small and credibility-focused:

1. Remove duplicated trailing HTML from `index.html`.
2. Fix or disable broken `resume.pdf` links.
3. Add missing resume-page CSS.
4. Fix accessible labels/menu attributes on pages missing them.
5. Fix `1M+` counter parsing.

Batch 2 can handle polish:

1. Normalize Open Graph tags.
2. Align career dates after owner confirmation.
3. Add `robots.txt` and `sitemap.xml`.
4. Add minimal CI/link validation.
