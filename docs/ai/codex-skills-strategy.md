---
title: Codex Skills Strategy
doc-type: policy
role: source-of-truth
priority: medium
canonical: docs/ai/codex-skills-strategy.md
related:
  - docs/ai/index.md
scope: codex, skills, project-context, ai-documentation
read-when:
  - changing .codex/skills
  - changing project-specific Codex instructions
  - deciding whether an AI instruction belongs in the repository
  - setting up Codex on another computer, devbox, or cloud workspace
do-not-read-when:
  - changing application code with no AI instruction impact
  - editing personal Codex preferences outside the repository
---

# Codex Skills Strategy

## Purpose

Define where Codex skills and AI operating instructions should live for this project.

This project uses repository-owned Codex instructions for project-specific context and keeps personal, private, and generic instructions outside the repository.

## Diagnosis

Keeping project-specific skills only in a shared folder outside the repository is fragile.

Problems:

- the skills do not follow the repository automatically
- the content can become stale when the project evolves
- different computers can run Codex with different instructions
- changes are not naturally reviewed in pull requests
- personal rules can mix with project rules
- rules from one project can leak into another project

That approach is acceptable for global personal behavior, but it should not be the source of truth for this project's architecture, conventions, CI/CD rules, debugging process, or review standards.

## Decision

Project-specific Codex skills should live in `.codex/skills/`.

Durable backend-specific AI-facing project documentation should live in `docs/ai/`.

Shared product, business-rule, glossary, MVP scope, and Jira planning
documentation should live in `sandicts/sandicts-docs`.

This keeps Codex behavior versioned with the code, reviewable in pull requests, reproducible across computers, and aligned with project changes.

## Repository-Owned Content

Store these in the repository:

- project-specific Codex skills
- architecture and module conventions
- API, validation, error handling, logging, and configuration rules
- CI/CD and pull request rules
- debugging workflows specific to this codebase
- backend-specific rules needed to implement backend behavior
- AI-facing backend documentation that should be shared by every backend dev and machine

When a backend rule changes, update the related skill or `docs/ai/` document in the same pull request when relevant.

When a shared product or business rule changes, update the relevant document in
`sandicts/sandicts-docs` instead of copying that rule into this repository.

## Local-Only Content

Keep these outside the repository:

- tokens, credentials, secrets, and private keys
- local absolute paths and machine-specific setup
- personal preferences
- private workflow shortcuts
- generic skills reused across many unrelated projects
- instructions that are not safe or useful for other devs to review

Rule of thumb: if another dev can safely read and use it, it can be versioned here. If it depends on one person, one machine, or a secret, keep it local.

## Project Structure

Use this structure:

```text
.codex/
  skills/
    jira-pr-commit-writer/
      SKILL.md
      agents/
        openai.yaml
    sandicts-business-rules/
      SKILL.md
      agents/
        openai.yaml
    sandicts-project-context/
      SKILL.md
      agents/
        openai.yaml

docs/
  ai/
    codex-skills-strategy.md
    index.md
    product/
      README.md
    business/
      README.md
```

Each folder under `.codex/skills/` is one Codex skill. The nested `agents/openai.yaml` file is UI/discovery metadata for that skill, not a separate agent.

Do not create placeholder skills. Add a new project skill only when it captures a repeated workflow or decision that Codex should apply consistently.

## Migration Checklist

- Inventory skills from the shared external folder.
- Classify each one as global, project-specific, or private.
- Move only project-specific, shareable skills into `.codex/skills/`.
- Remove secrets, local paths, and personal preferences before committing.
- Link project skills to the relevant backend `docs/ai/` source-of-truth documents.
- Link shared product and business-rule work to `sandicts/sandicts-docs`.
- Update `docs/ai/index.md` when adding durable project context.
- Test from the second computer or a clean clone.
- Keep the external shared folder only for global or personal skills.
