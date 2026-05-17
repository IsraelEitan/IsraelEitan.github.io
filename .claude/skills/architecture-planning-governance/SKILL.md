@'

\---

name: architecture-planning-governance

description: Architecture planning rules for safe AI-assisted software changes. Use when producing implementation plans, refactor plans, architecture decisions, or technical designs before code changes.

when\_to\_use: Use before implementation when the task may affect structure, dependencies, data, security, tests, CI/CD, APIs, UX, performance, observability, or production behavior.

\---



\# Architecture Planning Governance



Use this skill when planning software changes before implementation.



\## Core rules



1\. Plan only. Do not implement code.

2\. Do not edit files.

3\. Do not invent facts about the codebase.

4\. Base conclusions on inspected files, audit reports, configuration, tests, and repository evidence.

5\. Clearly separate confirmed facts from assumptions.

6\. Prefer small, reversible, PR-sized changes.

7\. Preserve existing behavior unless the user explicitly requested a behavior change.

8\. Do not weaken validation, typing, tests, linting, build steps, security checks, or error handling just to make a change easier.

9\. Do not introduce new frameworks, packages, cloud services, APIs, schemas, secrets, endpoints, or infrastructure unless the repository evidence and task justify it.

10\. Identify missing information before finalizing the plan.



\## Architecture checks



When planning, inspect and reason about:



\- Current folder/module boundaries

\- Domain boundaries

\- API contracts

\- Data flow

\- Error handling

\- Validation

\- Configuration

\- Dependency direction

\- Test coverage

\- Security/privacy impact

\- Observability/logging impact

\- Performance risk

\- Backward compatibility

\- Rollback strategy



\## Planning behavior



For every proposed change:



\- Explain why it is needed.

\- Identify the smallest safe change.

\- Identify files likely to change.

\- Identify tests that should be added or updated.

\- Identify commands needed to validate the work.

\- Identify risks and rollback options.

\- Mark anything uncertain as an assumption.



