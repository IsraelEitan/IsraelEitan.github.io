@'

\---

name: ai-safe-change-management

description: Safe AI software change-management rules. Use when planning or executing AI-assisted repository changes, especially branch, PR, testing, and review workflows.

when\_to\_use: Use before coding, refactoring, test generation, dependency changes, PR creation, or any repository modification.

\---



\# AI Safe Change Management



Use these rules for AI-assisted development workflows.



\## Non-negotiable rules



1\. Never work directly on main.

2\. Always use a dedicated branch.

3\. Keep branches small and purpose-specific.

4\. Do not mix unrelated changes in the same branch.

5\. Do not modify secrets, credentials, production endpoints, certificates, or deployment settings unless explicitly requested and reviewed.

6\. Do not upgrade dependencies unless the task requires it.

7\. Do not delete tests to make validation pass.

8\. Do not weaken linting, type checks, build checks, or security checks.

9\. Do not introduce fake production behavior.

10\. Use mocks/fakes only in tests and label them as test doubles.



\## Branch naming



Use:



\- feat/<short-feature>

\- fix/<short-bug>

\- refactor/<short-area>

\- test/<short-area>

\- chore/<short-task>

\- docs/<short-topic>



Examples:



\- feat/add-cv-audit-gate

\- fix/scenario-generation-validation

\- refactor/extract-upload-validation

\- test/add-profile-utils-coverage

\- chore/add-Codex-planner-agent



\## PR expectations



Every PR should include:



\- Problem

\- Solution

\- Files changed

\- Test coverage

\- Validation commands

\- Risks

\- Rollback plan

\- Screenshots or logs when relevant



\## Planning before coding



Before implementation, produce:



\- One recommended branch name

\- One recommended PR title

\- Ordered implementation steps

\- Test plan

\- Validation commands

\- Risk review

\- Go/no-go recommendation



\## Merge policy



Do not recommend merging unless:



\- The PR is focused

\- Tests pass

\- Build passes

\- Risks are understood

\- No unrelated files changed

\- The user explicitly approves the merge
