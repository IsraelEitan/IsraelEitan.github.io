@'

\---

name: planning-output-contract

description: Required output format for implementation plans. Use when a planner agent produces a plan, roadmap, architecture plan, refactor plan, or PR breakdown.

when\_to\_use: Use whenever the output must become a safe, reviewable implementation plan before coding starts.

\---



\# Planning Output Contract



Every plan must use the following structure.



\## 1. Planning Summary



Provide a short summary of what should be done and why.



\## 2. Evidence Used



List the concrete evidence used:



\- Audit report path

\- Files inspected

\- Config files inspected

\- Tests inspected

\- Relevant commands or repository signals



Do not claim evidence that was not inspected.



\## 3. Confirmed Facts



List only things confirmed from repository evidence.



\## 4. Assumptions



List assumptions separately.



Each assumption must include how to verify it.



\## 5. Scope



Define what is included.



\## 6. Out of Scope



Define what must not be touched in this plan.



\## 7. Recommended Branch Name



Use one branch name only.



Naming examples:



\- chore/add-planner-agent

\- fix/validation-error-handling

\- refactor/extract-cv-generation-services

\- test/add-upload-validation-coverage

\- feat/add-audit-gate



\## 8. Recommended PR Title



Use one PR title only.



Format examples:



\- chore: add architecture planner agent

\- fix: handle invalid generated scenario payloads

\- refactor: extract CV validation services

\- test: add upload validation coverage



\## 9. Implementation Plan



Break the work into small ordered steps.



Each step must include:



\- Goal

\- Files likely to change

\- Exact change description

\- Reason

\- Risk

\- Validation required



\## 10. Test Plan



Include:



\- Unit tests

\- Integration tests

\- Manual checks

\- Regression checks

\- Edge cases



If tests do not exist, propose where they should be added.



\## 11. Validation Commands



List concrete commands to run.



Examples:



\- npm test

\- pnpm test

\- pnpm lint

\- pnpm build

\- dotnet test

\- dotnet build

\- git status

\- git diff --check



Only include commands that make sense for the repository.



\## 12. Risk Review



Cover:



\- Security risk

\- Data/privacy risk

\- Production behavior risk

\- Breaking-change risk

\- Performance risk

\- Maintainability risk



\## 13. Rollback Plan



Explain how to safely revert if the change fails.



\## 14. Open Questions



Ask only questions that block safe implementation.



Do not ask questions that can be answered by reading the repo.



\## 15. Go / No-Go Recommendation



End with one of:



\- GO: safe to proceed to implementation

\- GO WITH CAUTION: proceed only after resolving listed risks

\- NO-GO: do not implement yet



Explain the reason.



