# Agent validation and repository gates

Guidance for Cursor agents and **implementation plans**. Hooks and scripts are
unchanged; this doc defines **when agents invoke them**. Full policy:
[AGENTS.md](../AGENTS.md) **Quality gate**.

## Default (normal tasks)

```text
focused behavioral tests → targeted typecheck/lint as relevant → broader affected checks only if warranted
```

- Narrowest Vitest paths for changed behavior.
- `pnpm typecheck:affected`, `pnpm lint:affected`, or package-scoped checks when useful.
- `pnpm test:affected*` only when blast radius or shared packages warrant it.
- `pnpm test:affected:collect` is **optional** diagnostic (`.tmp/test-affected-collect.log`).

Do **not** run pre-commit, `pnpm gate:pre-push`, root `pnpm build`, or `pnpm coverage`
unless the user requests a checkpoint below.

Finish by reporting checks run and which repository gates were deferred.

## Checkpoints (user-requested)

| Intent | Run |
| ------ | --- |
| Commit / checkpoint | Pre-commit hook ([`.husky/pre-commit`](../.husky/pre-commit)) |
| Push / PR / full validation | Pre-commit once, then `pnpm gate:pre-push` once |

## Writing implementation plans

**Avoid** auto-closing every phase with:

```text
focused tests → test:affected:collect → pre-commit → gate:pre-push
```

**Prefer** per-phase validation from the default loop above, and name explicit
**commit** or **push/PR** milestones when hook sequences belong in the schedule—not
after every agent prompt or micro-phase.
