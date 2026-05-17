# fix(portfolio): repair static site health issues

## Problem

The static portfolio had several health issues that made it harder to maintain and ship safely:

- `index.html` contained duplicated trailing HTML after the document close.
- Multiple pages linked to a missing `resume.pdf` file.
- Resume-page markup referenced CSS classes that were not defined.
- Homepage counters did not correctly preserve compact labels such as `1M+`.
- Resume and stats career dates were inconsistent.
- Some pages had incomplete social metadata and mobile nav accessibility gaps.
- The AI pipeline docs over-described a future full-stack app instead of clearly identifying this repository as a static portfolio.

## Solution

This PR applies Portfolio Site Mode fixes and records the handoff trail in `pipeline/portfolio-health-fixes/`.

- Removed invalid duplicated HTML from `index.html`.
- Replaced broken PDF download links with the current `Request CV` mailto flow.
- Added missing resume layout styles and mobile responsive behavior.
- Fixed compact counter parsing/formatting for `M`, `K`, `%`, and `+` suffixes.
- Kept `aria-expanded` synchronized when the mobile menu opens and closes.
- Normalized Open Graph/Twitter metadata and absolute avatar image URLs.
- Aligned the stats career chart with `resume.html` as the temporary canonical source.
- Added canonical pipeline instructions in `AGENTS.md` with Portfolio Site Mode vs Full-Stack App Template Mode.
- Updated connector language so MCPs are optional capabilities, not assumed connected tools.

## Files Changed

- `index.html` - removed duplicated trailing document content; replaced broken CV links.
- `resume.html` - added metadata, accessible nav controls, and request-PDF mailto flow.
- `projects.html` - added metadata, accessible nav controls, and request-CV flow.
- `about.html` - added fuller social metadata and request-CV flow.
- `stats.html` - added fuller social metadata, request-CV flow, and aligned career chart dates.
- `style.css` - added resume page styles and responsive overflow fixes.
- `main.js` - fixed counter suffix handling and mobile menu `aria-expanded` synchronization.
- `AGENTS.md` - defines the repo-specific AI pipeline and current static-site facts.
- `FULL-AI-PIPELINE-PLAN.md` - clarified that the full-stack stack is a future template/roadmap.
- `.codex/`, `.claude/`, `.agents/` - added/updated local agent and skill configuration for the pipeline.
- `pipeline/portfolio-health-fixes/` - added task breakdown, audit, implementation, QA, security, and PR handoff reports.

## Validation Performed

- `node --check main.js`
- Verified `index.html` has a single `</html>`.
- Verified no `resume.pdf`, empty `href`, or empty `src` references remain.
- Ran local HTML reference scan for `href` and `src` targets.
- Captured desktop screenshots for all five pages.
- Captured mobile screenshots for all five pages at `390x844`.
- Verified homepage counters after delayed render; final labels include `1M+`, `12+`, `95`, and `70%`.
- Completed static security review: `pipeline/portfolio-health-fixes/09-security-report.md`.

## Security

Security review verdict: PASS.

- No committed `.env` files found.
- No hardcoded API keys, private keys, database URLs, or service tokens found in site source.
- No dynamic HTML injection APIs found.
- No forms, fetch calls, XHR, or backend submission paths found.
- External `_blank` links use `rel="noopener"`.
- `localStorage` is limited to the theme preference.

Security hardening notes:

- Add deploy-level security headers/CSP when the target static host supports them.
- Optionally add `noreferrer` to external `_blank` links.

## PR Review

Reviewer verdict: APPROVE.

No blocking correctness, security, or regression issues were found after the final accessibility polish.

Review note: `qa-screenshots/` contains generated local QA screenshots. Do not include it in the PR unless screenshot artifacts are intentionally wanted in the repository.

## Risks

- `mailto:` CV request links need one manual interactive check to confirm the user's preferred email client opens correctly.
- The real `resume.pdf` asset is intentionally deferred for now; Linear `EIT-7` was canceled/deferred by product decision.
- Local Edge/Chrome headless became flaky after repeated captures, so the last mobile nav grid tweak was validated by CSS inspection rather than a fresh screenshot.
- `.claude/agents/architecture-planner.md` was already modified in the working tree before this pass; review it carefully if staging pipeline files.

## Rollback

Revert this branch to restore the previous static site and remove the pipeline handoff docs. The site has no database, migrations, backend, package dependencies, or deployment-side state to roll back.
