# Agent validation and repository gates

Guidance for Cursor agents and **implementation plans**. Hooks and scripts are
unchanged; this doc defines **when agents invoke them** and **how to verify approved
work**. Mandatory rules: [AGENTS.md](../AGENTS.md) **Quality gate** and **Approved work**.

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

Finish by reporting checks run, deferred repository gates, and whether the handoff is
**plan complete**, **checkpoint complete**, or an **incomplete handoff**. Update plan
frontmatter `todos` when a plan applied.

## Checkpoints (user-requested)

| Intent                      | Run                                                                                                       |
| --------------------------- | --------------------------------------------------------------------------------------------------------- |
| Commit / checkpoint         | Pre-commit hook ([`.husky/pre-commit`](../.husky/pre-commit)), then commit-msg commitlint on `git commit` |
| Push / PR / full validation | Pre-commit once, then `pnpm gate:pre-push` once (or `git push`)                                           |

Pre-commit is intentionally fast (no full affected package test suites). Broad typecheck
and collect-all affected tests since `origin/main` live in `pnpm gate:pre-push`
(`gate:ci:quality`, `test:affected:gate`).

## Plan execution

Applies whenever explicit user requirements or approved refinements define mandatory scope
and verification—not only `.cursor/plans/*.plan.md` files.

### Scope authority

| Source       | Examples                                                       |
| ------------ | -------------------------------------------------------------- |
| Formal plan  | `.cursor/plans/*.plan.md` body and frontmatter                 |
| Conversation | Accepted task list, verification boundaries, “non-negotiables” |
| Follow-up    | Remediation prompts, PR review fixes, ticket checklists        |

Those requirements override the default focused-validation finish line for scope and
verification. They do **not** authorize hooks without a user checkpoint request.

### Working checklist

Before substantive implementation:

1. List **mandatory** acceptance criteria vs **optional** improvements.
2. Note the **production boundary** per criterion (unit, `api:integration`, HTTP route,
   mounted UI, static grep, etc.).

During execution, maintain a running view (session summary table is enough). Keep
the columns distinct: implementation progress, criterion outcome, and execution
result are not interchangeable.

| Criterion | Impl        | Outcome                                                                             | Executed result                             | Notes |
| --------- | ----------- | ----------------------------------------------------------------------------------- | ------------------------------------------- | ----- |
| …         | done / open | `unmet` / `partial` / `failed` / `unverified` / `blocked` / `verified` / `deferred` | `passed` / `failed` / `errored` / `not run` |       |

**Implementation** and **verification** are independent. A commit or pre-commit
success does not mark verification done. An execution result of `failed`,
`errored`, or `not run` cannot support a `verified` outcome.

Multi-session: leave enough state in the summary and plan frontmatter so a new session
can resume without reconstructing scope only at the end.

### Completion semantics

| Handoff label           | Meaning                                                                                   |
| ----------------------- | ----------------------------------------------------------------------------------------- |
| Implementation complete | Required changes for the criteria in scope are in the tree                                |
| Verification complete   | Required checks for those criteria succeeded at the stated boundary                       |
| Checkpoint complete     | The **active boundary** gate is met; the rest of the plan may still be open               |
| Plan complete           | The **whole-plan** gate is met                                                            |
| Incomplete handoff      | The active boundary is not met, or the run stops with mandatory criteria still unresolved |

**Checkpoint complete** and **plan complete** are different labels. Closing a named
subset (a pilot, a phase, a stopping boundary) is checkpoint complete. Plan complete
applies only when every mandatory criterion in the whole plan meets the gate rule.
Honest reporting does not make the work complete.

### Status concepts

These vocabularies stay separate. Criterion outcome is the only value in a plan
matrix `Status` column. Execution result is recorded per command. Assignment
progress is recorded only in a plan `## Workflow state` section when a multi-agent
workflow is in use.

| Concept             | Where it lives       | Values                                                                                                                |
| ------------------- | -------------------- | --------------------------------------------------------------------------------------------------------------------- |
| Criterion outcome   | Plan matrix `Status` | `unmet`, `partial`, `failed`, `unverified`, `blocked`, `verified`, `deferred`                                         |
| Execution result    | Per recorded command | `passed`, `failed`, `errored`, `not run` — with the command, counts, and snapshot tree when one exists                |
| Assignment progress | Workflow state only  | `dispatched`, `returned`, `verifying`, `remediating n/limit`, `exhausted`, `awaiting decision`, `interrupted`, `done` |

**Criterion outcome** is the current state from the latest applicable evidence:

| Outcome      | Meaning                                                                                         |
| ------------ | ----------------------------------------------------------------------------------------------- |
| `unmet`      | Required work is not present and no confirming evidence exists                                  |
| `partial`    | Some of the required behavior or coverage is present; the criterion is not met                  |
| `failed`     | The latest applicable evidence shows the requirement is contradicted or a required check failed |
| `unverified` | Evidence is missing, stale, or cannot be confirmed against the current tree                     |
| `blocked`    | An external constraint or a pending user decision prevents progress                             |
| `verified`   | The latest applicable evidence confirms the requirement at the stated boundary                  |
| `deferred`   | A recorded user approval excludes the criterion from the active gate                            |

### Invalidation and gate rules

- Earlier successful runs stay in the executed-result history. They do not hold the current outcome.
- Stale or unconfirmable evidence sets the outcome to `unverified` until it is reverified. Missing or stale evidence is never `verified`.
- A confirmed failure sets `failed` or `partial` and supersedes an earlier `verified`.
- `exhausted` is assignment progress. It is not an outcome. After exhaustion the outcome stays the latest evidence: `failed`, `partial`, or `unverified`.
- `blocked` names an external constraint or a pending user decision. Exhaustion alone is never `blocked`.
- `deferred` requires a recorded user approval. An agent does not defer mandatory work on its own.
- A slice is not eligible while any prerequisite criterion is not currently `verified`.

**Gate rule.** A gate closes only when every mandatory criterion in its scope is currently `verified`, is approved `deferred`, or has a recorded user waiver.

### Production boundary and equivalence

Satisfy verification at the boundary named in the approved scope. A helper or unit test
does not satisfy an integration or mounted requirement unless equivalence is demonstrated:
cite the existing test, quote assertions that establish the same guarantee, and confirm the
same boundary.

Weaker layers, weaker assertions, or deleted/skipped approved tests are not allowed
without user approval to **materially weaken or remove** a guarantee. Fixing an awkward
harness (patterns from passing co-located tests) is expected—not grounds to drop the test.

### Planned vs executed verification

| Phase                         | What to record                                                                                |
| ----------------------------- | --------------------------------------------------------------------------------------------- |
| **Planned** (authoring)       | Behavior, boundary, failure conditions—authors need not pre-specify file names or `it` titles |
| **Executed** (implementation) | Commands run, paths, results, limitations, baseline vs introduced attribution                 |

Do not score completion by test count or matrix size. Avoid redundant tests, brittle
implementation-detail assertions, test-only production APIs, and permanent evidence
documents unless the user asked for them.

### Continuation and blockers

Priority/risk order is **sequence only**. Continue through approved unblocked mandatory
work unless:

- The user requests a narrower slice or explicit stop.
- A genuine blocker prevents progress on that item.
- Continuing requires a user decision or authorization.
- Execution limits prevent more work.

When blocked on one item, preserve it, try reasonable alternatives, and continue other
unblocked items. Reporting a blocker is not permission to remove approved requirements.

### Final verification

When approved scope names explicit suites or commands, run them before claiming **plan
complete**. Plan-mandated `typecheck:affected` or Vitest paths are not hook checkpoints.

## Plan progress

When a `.cursor/plans/*.plan.md` applies:

1. Match todo `id` or `content` to the gate advanced this session.
2. Set `completed` only when that todo’s **mandatory** acceptance criteria are
   implemented **and** verified (`AGENTS.md` **Approved work**).
3. Set `in_progress` when implementation or verification remains open, including partial,
   failed, blocked, or unverified mandatory sub-criteria.
4. Hook/push todos stay `pending` until the user requests the checkpoint and it succeeds.
5. Skip plan edits when no plan applied.

In-chat TodoWrite is for the current thread only; plan frontmatter is the cross-session
record.

## Test rerun modes

| Mode           | When                                       | Scope                                                          |
| -------------- | ------------------------------------------ | -------------------------------------------------------------- |
| **Diagnostic** | Isolating a shared failure during fix      | Narrowest failing paths; may rerun only failed files after fix |
| **Regression** | After implementation or refactor           | Affected behavior, not diagnosis-only minimization             |
| **Plan final** | Approved scope lists explicit verification | Named suites/commands; diagnostic reruns do not substitute     |

Pre-existing failures: cite concrete baseline evidence (e.g. known failing path on main).
Otherwise label attribution **unresolved**. Never report a `blocked` criterion or a
`not run` / `errored` execution result as `passed` or as a `verified` outcome.

## Writing implementation plans

**Avoid** auto-closing every phase with:

```text
focused tests → test:affected:collect → pre-commit → gate:pre-push
```

**Prefer** the default validation loop per phase, plus explicit **commit** or **push/PR**
milestones when hooks belong in the schedule.

**Authoring checklist:**

- Separate **mandatory** acceptance criteria from **optional** improvements.
- Per mandatory item: observable behavior, production boundary, meaningful failure
  conditions (planned verification—not necessarily pre-known test paths).
- Frontmatter `todos`: cohesive gates; one todo may cover several related criteria.
- A **completion gate** section listing open mandatory conditions before “done.”
- **Continuation rule** for readers: priority orders work; it does not shrink scope.
- Progress in frontmatter only (`id`, `content`, `status`); use the body for scope and
  verification intent—not a second status system.

## Evidence identity

Applies when work is recorded against a git snapshot (multi-agent workflow or any
plan that cites an evidence tree). **HEAD is not identity** for uncommitted work.
The workflow does not auto-commit.

### Snapshot

The orchestrator owns snapshots. The shell sequence (copy the index, stage into
that copy, `git write-tree`, delete the copy) lives with the orchestration
reference. The rules here are the authority for what a snapshot means:

1. Copy the real index (`git rev-parse --git-path index`) to a unique temporary index. Never write the real index.
2. Stage into that copy only (`git add -A` with `GIT_INDEX_FILE` set to the copy).
3. `git write-tree` on the copy. The resulting tree is the identity.
4. Delete the copy on success and on failure (`trap`).

The tree covers committed, staged, dirty, and untracked non-ignored content.
Ignored paths, including `.cursor/` plan files, do not change it.

**Snapshot failure.** A non-zero exit or empty output means the snapshot is
unavailable. Nothing may be recorded as `verified` against it: checkpoint, set
the affected outcomes to `unverified`, and report.

**Historical trees.** Confirm a recorded tree with `git cat-file -e <tree>^{tree}`.
If the object is missing (unreachable trees can be pruned by `git gc`), evidence
tied to it becomes `unverified` and is reverified conservatively. There are no
permanent snapshot refs.

### Scopes

- **Implementation diff scope:** `git diff --name-only <pre-tree> <post-tree>`. Paths already dirty at dispatch are pre-existing and are not attributed to the agent.
- **Verification dependency scope:** declared per criterion, with a confidence note. It is an approximation, not a dependency graph. It includes the changed files, traced production consumers (including newly introduced ones), executed test files, shared contracts and common runtime infrastructure the behavior relies on, and the package and test configuration. When coverage is uncertain, broaden to the owning package directory or invalidate conservatively.
- **Conservative rule:** any change to root or package configuration (`package.json`, `pnpm-lock.yaml`, tsconfig, Vitest config) invalidates evidence for the affected packages.

### Staleness

Compare with `git diff --name-only <evidence-tree> <current-tree> -- <dependency paths>`.
A non-empty result sets the criterion to `unverified`. Sweep after every
implementation, on resume, before final verification, and at every gate.

Snapshot before and after each verification dispatch. If the dependency paths
differ between those trees, discard the result as `unverified`. Final
verification evaluates cross-slice effects regardless of earlier dependency
inventories.

**Uncaptured inputs:** ignored files (`.env*`, generated output, `node_modules`),
external service and database state, and browser state. Evidence that relies on
them says so and depends on a fresh rerun.

### Protected-work check

Workflow state may list protected paths with blob hashes, plus a protected diff
set. At every phase or checkpoint boundary, confirm each hash with
`git hash-object` and confirm the snapshot diff from the protected baseline
touches no protected path. `git status` or a dirty-path list is not sufficient.

## Verifying CI failure propagation

The [CI workflow](../.github/workflows/ci.yml) runs affected typecheck and lint,
duplication, and coverage as individual required steps. The repository’s
`analyze` script is advisory.

When changing these steps, parse the workflow and run each step command with its
mapped [package script](../package.json) and a controlled failing child process.
The required commands should preserve the child’s nonzero exit status. The
advisory script should exit successfully even when its analysis child fails.
This probe verifies command propagation without running the full check suite.

## Scenario reference

Read-through aid when changing this guidance—not automated enforcement. Intended agent
response under [AGENTS.md](../AGENTS.md) **Approved work** and sections above:

| Scenario                               | Intended response                                                            |
| -------------------------------------- | ---------------------------------------------------------------------------- |
| Only highest-priority phase done       | **Incomplete handoff**; continue unblocked mandatory items; priority ≠ scope |
| Mounted test replaced by helper-only   | Reject unless equivalence proven at same boundary; else incomplete           |
| Required test fails (harness)          | Fix harness; do not delete requirement or stop solely for awkward setup      |
| Commit succeeds; criteria open         | Report incomplete handoff; todos stay `in_progress`                          |
| Regression suite blocked (infra)       | Report blocked criterion; continue other work; do not claim verify pass      |
| Existing test already covers guarantee | Cite assertions + boundary; plan complete only if mandatory list satisfied   |
| Abstraction only for tests/metrics     | Do not add; follow [complexity-remediation.md](complexity-remediation.md)    |
| Ad hoc small task                      | Default focused validation; no extra artifacts                               |
