\---

name: architecture-planning-methodology

description: Use this skill to convert audit findings, feature requests, or architecture concerns into a safe implementation plan before coding.

allowed-tools: Read, Grep, Glob

\---



\# Architecture Planning Methodology



Use this skill when creating a technical plan before implementation.



The goal is to convert an audit report or feature request into a clear, safe, testable, implementation-ready plan.



\## Hard rules



\- Do not edit files.

\- Do not write code.

\- Do not create branches.

\- Do not commit.

\- Do not push.

\- Do not open pull requests.

\- Do not run migrations.

\- Do not install packages.

\- Do not invent missing requirements.

\- If information is missing, mark it as an open question.

\- Prefer small, reversible changes.

\- Prefer existing project conventions over generic patterns.

\- Do not propose large rewrites unless there is clear evidence they are necessary.

\- Do not weaken tests, validation, error handling, security, or observability to make implementation easier.



\## Planning principles



A good plan must be:



1\. Evidence-based

2\. Small enough for one focused PR

3\. Testable

4\. Reversible

5\. Aligned with current architecture

6\. Explicit about risks

7\. Clear enough for an implementation agent to follow without guessing



\## Required planning flow



1\. Read the audit report or user request.

2\. Identify the highest-priority problem.

3\. Confirm the affected area of the repository.

4\. Determine whether the change is:

&#x20;  - documentation-only

&#x20;  - test-only

&#x20;  - small code fix

&#x20;  - normal feature/fix

&#x20;  - architecture-sensitive change

&#x20;  - security-sensitive change

5\. Define non-goals.

6\. Define exact implementation steps.

7\. Define files likely to change.

8\. Define validation commands.

9\. Define rollback plan.

10\. Define PR scope and PR title.



\## Priority handling



Use this priority model:



\- P0: blocks safe development, broken build, severe security/config risk, or direct risk to production

\- P1: important architecture/testability/maintainability issue that should be fixed soon

\- P2: useful improvement but not blocking

\- P3: cleanup or nice-to-have



\## Required output format



\# Implementation Plan



\## 1. Goal



What should be achieved?



\## 2. Source Evidence



What audit finding, file, or repo evidence triggered this plan?



\## 3. Scope



What is included?



\## 4. Non-Goals



What must not be changed in this PR?



\## 5. Risk Level



Low / Medium / High



Explain why.



\## 6. Proposed Approach



Explain the technical approach.



\## 7. Files Likely to Change



List expected files or folders.



\## 8. Step-by-Step Implementation Plan



Use numbered steps.



\## 9. Test Plan



List unit, integration, manual, or build checks.



\## 10. Validation Commands



List exact commands the implementation agent should run.



\## 11. Rollback Plan



How can the change be safely reverted?



\## 12. PR Plan



Include:

\- branch name

\- PR title

\- PR description outline

\- expected checklist



\## 13. Open Questions



List anything that must be clarified before coding.



\## 14. Recommendation



Say one of:

\- READY\_FOR\_IMPLEMENTATION

\- NEEDS\_USER\_CLARIFICATION

\- BLOCKED\_BY\_MISSING\_EVIDENCE
