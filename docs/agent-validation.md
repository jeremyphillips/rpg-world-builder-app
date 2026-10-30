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
- `pnpm test:affected:local` (fail-fast) when the affected graph warrants it during work.
- `pnpm test:affected:collect` is **optional** diagnostic (`.tmp/test-affected-collect.log`).
  It is **not** a mandatory step before push or before `test:affected:gate`.

Do **not** run pre-commit, `pnpm gate:pre-push`, root `pnpm build`, or `pnpm coverage`
unless the user requests a checkpoint below.

Finish by reporting checks run and which repository gates were deferred. When work
followed a `.cursor/plans/*.plan.md`, update that plan’s frontmatter `todos` in the same
turn (see [Plan progress](#plan-progress)).

## Checkpoints (user-requested)

| Intent                      | Run                                                                                                       |
| --------------------------- | --------------------------------------------------------------------------------------------------------- |
| Commit / checkpoint         | Pre-commit hook ([`.husky/pre-commit`](../.husky/pre-commit)), then commit-msg commitlint on `git commit` |
| Push / PR / full validation | Pre-commit once, then `pnpm gate:pre-push` once (or `git push`)                                           |

Pre-commit is intentionally fast (no full affected package test suites). Broad typecheck
and collect-all affected tests since `origin/main` live in `pnpm gate:pre-push`
(`gate:ci:quality`, `test:affected:gate`).

## Writing implementation plans

**Avoid** auto-closing every phase with:

```text
focused tests → test:affected:collect → pre-commit → gate:pre-push
```

**Prefer** per-phase validation from the default loop above, and name explicit
**commit** or **push/PR** milestones when hook sequences belong in the schedule—not
after every agent prompt or micro-phase.

**Authoring:** define checkpoint progress only in frontmatter `todos` (stable `id`, human
`content`, `status`). Use the plan body for scope, inventory, and verification lists—not
a second checklist agents must keep in sync.

## Plan progress

When executing work scoped to a plan file:

1. Match todo `id` or `content` to the checkpoint or gate the session finished (or
   advanced).
2. Set `status: completed` for gates whose scoped work and focused validation are done.
   Set `status: in_progress` for the gate actively in flight. Leave unrelated todos
   unchanged.
3. Do not mark a todo `completed` when its gate is only partially done—use
   `in_progress` and note remaining work in the chat summary, not a long plan edit.
4. Todos tied to **push/PR** or hook checkpoints stay `pending` until the user requests
   that checkpoint and it succeeds (same rule as [Checkpoints](#checkpoints-user-requested)).
5. Skip plan edits when no plan applied to the session.

In-chat TodoWrite items are for the current thread only; plan frontmatter overrides them
for checkpoint status across sessions.
