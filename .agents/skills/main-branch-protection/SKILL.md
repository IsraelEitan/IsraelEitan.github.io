---
name: main-branch-protection
description: >
  Rules for protecting the main/master branch during AI-assisted development.
  Defines pre-flight checks before any file edit, branch verification commands,
  and what to do if on a protected branch.
when_to_use: >
  Use before any file edit or code change. Every implementation agent must
  verify branch before touching code. This is the first check in every session.
---

# Main Branch Protection

## Rule: Verify branch BEFORE every edit session

```bash
git branch --show-current    # must NOT be main or master
git status --short           # must be clean or only expected changes
```

## If on main or master — STOP

Do not edit any file. Instead:
1. Ask the user for a feature branch name if not provided
2. Create the branch: `git checkout -b feat/{feature-name}`
3. Confirm branch with `git branch --show-current`
4. Only then proceed with implementation

## Branch naming

```
feat/{feature-slug}      new features
fix/{bug-slug}           bug fixes
refactor/{area}          refactors without behaviour change
test/{area}              adding tests only
chore/{task}             maintenance, dependency updates
docs/{topic}             documentation only
```

## What to never do on main/master

- Never: `git add . && git commit` on main
- Never: Edit production config files on main without a PR
- Never: Run database migrations from main directly
- Never: `git push --force` on any branch

## What is allowed on main

- Reading files (Glob, Grep, Read)
- Running build/test commands to understand the state
- Creating a new branch from main: `git checkout -b feat/my-feature`
