---
name: github-pr-handoff
description: >
  Rules and format for handing off a completed feature branch to GitHub as a
  Pull Request. Covers commit message format, PR title/description standards,
  required checks before opening the PR, and what the human reviewer needs.
when_to_use: >
  Use after pr-reviewer produces the PR description and all validations pass.
  Guides the final commit, push, and PR creation step.
---

# GitHub PR Handoff

## Pre-PR checklist

Before opening a PR, every item must be true:

- [ ] All tests passing: `npm test`
- [ ] Build passing: `npm run build`
- [ ] Security report: PASS or PASS WITH CONDITIONS
- [ ] PR reviewer verdict: APPROVE or REQUEST CHANGES resolved
- [ ] On a feature branch — not main
- [ ] `git diff main...HEAD --stat` shows only expected files
- [ ] No secrets, credentials, or `.env` files in the diff
- [ ] `git log --oneline main...HEAD` shows clean commits

## Commit message format (Conventional Commits)

```
{type}({scope}): {short description}

{optional body — what and why, not how}

{optional footer — references, breaking changes}
```

Types: `feat` `fix` `refactor` `test` `chore` `docs` `perf` `style`

Examples:
```
feat(auth): add JWT-based user authentication

- POST /v1/auth/register with bcrypt password hashing
- POST /v1/auth/login returning access + refresh tokens
- Rate limiting: 10 req/min on auth endpoints

Closes #12
```

```
fix(orders): enforce ownership check on order retrieval

Previously any authenticated user could read any order by ID.
Now verifies order.userId === req.user.id before returning.

Security: OWASP A01 Broken Access Control (IDOR)
```

## PR title format

```
{type}({scope}): {same as commit message first line}
```

Must be under 72 characters.

## Push and PR creation

```bash
# Push feature branch
git push origin feat/{feature-name}

# Open PR (GitHub CLI)
gh pr create \
  --title "feat(auth): add JWT-based user authentication" \
  --body-file pipeline/{feature}/10-pr-description.md \
  --base main \
  --assignee @me \
  --label "ai-pipeline"

# Or open manually: GitHub will show "Compare & pull request" banner
```

## PR description comes from pr-reviewer

The contents of `pipeline/{feature}/10-pr-description.md` is the PR body.
Copy it verbatim. Do not summarise or paraphrase.

## After PR is opened

1. Verify CI starts running automatically
2. Share PR URL with team (or in Linear ticket)
3. Wait for human review approval before merging
4. Never self-merge without at least one review (unless solo project)
5. After merge: delete the feature branch
