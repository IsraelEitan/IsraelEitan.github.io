---
name: ai-safe-change-management
description: >
  Safe AI software change-management rules. Use when planning or executing
  AI-assisted repository changes, especially branch, PR, testing, and review workflows.
when_to_use: >
  Use before coding, refactoring, test generation, dependency changes,
  PR creation, or any repository modification.
---

# AI Safe Change Management

## Non-negotiable rules

1. **Never work on `main` or `master`** — always use a feature branch.
2. **Never commit secrets** — no API keys, tokens, passwords, or connection strings in code.
3. **Never force push** — do not rewrite shared branch history.
4. **Never merge without review** — all merges require a PR and at least the pr-reviewer agent.
5. **Never invent facts** — if something is not verified from files or tools, say it is unknown.
6. **Never run destructive commands** — no `DROP TABLE`, `rm -rf`, `git reset --hard` without explicit user confirmation.
7. **Never bypass validation** — do not skip tests, lint, or type checks to make a build pass.

## Branch naming

```
feat/{feature-slug}      # new features
fix/{bug-slug}           # bug fixes
refactor/{area}          # refactoring
test/{area}              # test additions
chore/{task}             # maintenance
docs/{topic}             # documentation only
```

## Before any file edit

1. `git branch --show-current` — confirm you are NOT on main/master.
2. `git status --short` — confirm working tree is clean or expected.
3. State the scope of what you are about to change.

## Commit conventions

Follow Conventional Commits:

```
feat(scope): short description
fix(scope): short description
refactor(scope): short description
test(scope): short description
chore(scope): short description
docs(scope): short description
```

- Subject line: imperative mood, ≤72 characters, no period.
- Body (optional): explain WHY, not what.
- No emoji in commit messages unless the project already uses them.

## What agents may do without explicit user confirmation

- Read files, run grep/glob searches
- Run read-only git commands (`git log`, `git diff`, `git status`, `git branch`)
- Write new files on a feature branch
- Edit files on a feature branch
- Run tests, lint, type checks, build

## What agents must NOT do without explicit user confirmation

- `git add` + `git commit` — must confirm scope first
- `git push` — must confirm branch and remote
- Open a PR — must confirm PR title and description
- Run database migrations
- Delete files or branches
- Install new packages
- Modify `.env` files or any secrets store

## PR expectations

Every PR must include:
- Clear problem statement
- Solution summary
- List of files changed
- Validation performed (tests run, build status)
- Security/configuration notes
- Known risks or manual follow-up steps

## Merge policy

- Do not merge your own PR without a second review (human or pr-reviewer agent).
- All CI checks must pass before merge.
- Squash or merge commit — never rebase onto main after PR is open.
