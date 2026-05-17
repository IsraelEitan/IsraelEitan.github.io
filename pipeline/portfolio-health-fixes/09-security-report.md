# Portfolio Health Fixes - Security Report

**Mode**: Portfolio Site Mode
**Date**: 2026-05-17
**Reviewer**: security-agent
**Verdict**: PASS - no CRITICAL or HIGH findings. Safe for PR review.

## Scope

Static security/configuration review for the portfolio health fixes.

Reviewed:

- Static HTML, CSS, and vanilla JavaScript only.
- External links and `target="_blank"` handling.
- Secrets and environment file exposure.
- Dynamic script surfaces.
- Local storage usage.
- Static-hosting security header readiness.

Not applicable in this repository:

- Authentication and authorization.
- Backend routes.
- Database access.
- Dependency CVE audit, because there is no package manager or dependency manifest.
- CORS, rate limiting, server-side logging, SSRF, or API validation.

## Commands Run

```powershell
git ls-files .env .env.local .env.production .env.development
rg --files -g '.env*' -g '!node_modules' -g '!vendor'
rg -n '<script|innerHTML|insertAdjacentHTML|eval\(|new Function\(|document\.write|localStorage|sessionStorage' -S -g '*.html' -g 'main.js' .
rg -n 'target="_blank"|rel=|mailto:|tel:|href="http|src="http' -S -g '*.html' .
rg -n 'api[_-]?key|secret|token|password|DATABASE_URL|SUPABASE|OPENAI|GITHUB|LINEAR|PRIVATE KEY|BEGIN RSA' -S .
rg --files -g '_headers' -g 'netlify.toml' -g 'vercel.json' -g '.htaccess' -g 'staticwebapp.config.json' -g 'web.config'
```

## Positive Results

- No committed `.env` files were found.
- No hardcoded API keys, private keys, database URLs, or service tokens were found in site source.
- No `eval`, `new Function`, `document.write`, `innerHTML`, or `insertAdjacentHTML` usage was found in the site code.
- No forms, `fetch`, `XMLHttpRequest`, `sendBeacon`, or backend submission paths were found.
- All reviewed external `target="_blank"` links include `rel="noopener"`, which mitigates reverse-tabnabbing.
- `localStorage` usage is limited to the theme preference key in `main.js`; no personal or sensitive data is stored.

## Findings

### [LOW] Missing Static Hosting Security Headers

- **File**: repository root configuration is absent; no `_headers`, `netlify.toml`, `vercel.json`, `.htaccess`, `staticwebapp.config.json`, or `web.config` file was found.
- **Related code**: `stats.html:373` contains an inline script, which would need to be moved or accounted for before enforcing a strict CSP.
- **Description**: The site does not currently define deployment-level hardening headers such as `Content-Security-Policy`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, or frame restrictions. For GitHub Pages this may require platform support, a proxy/CDN layer, or a different static host.
- **Impact**: Low for this read-only portfolio because it has no user input, no backend, no auth, and no sensitive browser storage. Headers would still reduce impact from future script additions, framing, MIME sniffing, and referrer leakage.
- **Remediation**:

  If hosting on Netlify or another static host that supports `_headers`, add:

  ```text
  /*
    Content-Security-Policy: default-src 'self'; img-src 'self' https://avatars.githubusercontent.com data:; script-src 'self'; style-src 'self' 'unsafe-inline'; object-src 'none'; base-uri 'self'; frame-ancestors 'none'
    X-Content-Type-Options: nosniff
    Referrer-Policy: strict-origin-when-cross-origin
    Permissions-Policy: camera=(), microphone=(), geolocation=()
  ```

  Before enabling `script-src 'self'`, move the inline chart animation script from `stats.html` into `main.js` or add a CSP hash for that exact inline script.

- **Reference**: OWASP A05:2021 - Security Misconfiguration

### [INFO] External Links Do Not Use `noreferrer`

- **File**: examples include `index.html:70`, `resume.html:49`, `projects.html:47`, `about.html:121`, and `stats.html:137`.
- **Description**: External links use `target="_blank"` with `rel="noopener"` but not `noreferrer`.
- **Impact**: `noopener` already addresses the main reverse-tabnabbing issue. Adding `noreferrer` is optional privacy hardening to avoid sending the portfolio URL as the referrer to external sites.
- **Remediation**:

  ```html
  <a href="https://github.com/IsraelEitan" target="_blank" rel="noopener noreferrer">GitHub</a>
  ```

- **Reference**: OWASP A05:2021 - Security Misconfiguration

## Accepted Tradeoffs

- Public email exposure is intentional for a personal portfolio. It may increase spam risk, but it is not treated as a security blocker.
- `mailto:` CV request links are safe for a static site, but they should be clicked manually in an interactive browser to confirm the user's preferred email client opens.
- Inline SVG icon markup is static and does not process user input.

## Final Verdict

PASS - no CRITICAL or HIGH findings. Safe for PR review.
