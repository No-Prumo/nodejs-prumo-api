# AI Context Index

Load additional documents only when the current task requires them.

## CI / Branch Governance
- `docs/ai/ci-cd/ci-governance.md`
  - Read when editing:
    - `.github/workflows/**`
    - branch validation scripts
    - pull request validation logic
    - merge policy
    - release flow
    - branch naming enforcement
  - Skip when:
    - changing only application business logic
    - changing only UI
    - changing backend features unrelated to CI

- `docs/ai/ci-cd/ci-operational-rules.md`
  - Read when:
    - implementing branch name validation
    - implementing pull request flow validation
    - writing regex-based CI rules
    - enforcing required pull request checks
  - Skip when:
    - changing only CI documentation
    - changing only application code unrelated to CI
