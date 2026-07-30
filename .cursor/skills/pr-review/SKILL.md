---
name: pr-review
description: >-
  Structured pull-request review for this repo — SSOT violations, parallel
  paths, ownership conflicts, styling hacks, silent failures, wiring gaps, and
  regressions. Use when reviewing a branch, PR, or diff; not for Bugbot or
  security-only scans.
disable-model-invocation: true
---

# PR Review

Read-only review of **behavior introduced by the diff** — not a file inventory.
Do not modify files, commit, or push. Do not delegate to subagents unless the
user explicitly asks to combine with Bugbot or security review.

## When to use

| Use                        | Skip                       |
| -------------------------- | -------------------------- |
| Branch or PR review        | Bugbot/security-only scans |
| Uncommitted changes review | Changelog summaries        |
| Pre-push self-review       |                            |

If the user names a PR or branch, ensure it is checked out first. Stash only
with user confirmation when checkout would overwrite local changes.

## Workflow

1. Resolve target: current branch, named branch, PR head, or uncommitted only.
2. Diff via merge base: `git merge-base HEAD <base>` → `git diff <merge-base>…`
   (default base: repo default branch).
3. Read [`AGENTS.md`](../../../AGENTS.md) and touched-area docs as needed.
4. Group changes by feature and layer.
5. Trace user-visible flows; read deleted files/tests for lost guarantees.
6. **SSOT search** — grep or trace for semantic duplication (see below).
7. **Wiring gap check** — trace changed symbols through layer owners:
   contracts → API/catalog → dashboard route/query → UI export/story/test.
8. Write findings using the format below.

## Primary lenses

Review **first**. Treat concrete instances as **High by default**. Downgrade to
Medium only when duplication is intentionally bounded (explicit boundary
comment, migration shim with follow-up) or styling is strictly local and
non-reusable.

| #   | Lens                             | Look for                                                                                                                                                         |
| --- | -------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | **SSOT violations**              | Same rule, inventory, label, route mapping, state classification, permission gate, or class stack in multiple places — even when code is not textually identical |
| 2   | **Parallel paths**               | Multiple implementations of the same behavior likely to drift (route matching, loading-state classification, campaign lookup, nav inventory)                     |
| 3   | **Ownership conflicts**          | Feature vs layout, dashboard vs `@rpg/ui`, contracts vs presentation, cross-package imports violating intended boundaries                                        |
| 4   | **Styling/scaffolding hacks**    | See [Styling hacks](#styling-hacks)                                                                                                                              |
| 5   | **Silent failures**              | Errors masquerading as empty data, missing entities as loading, swallowed query failures, UI hiding without server enforcement                                   |
| 6   | **Behavior or test regressions** | Changed flows, defaults, navigation, permissions, persisted state; deleted/weakened/stale tests                                                                  |
| 7   | **Wiring gaps**                  | Partial landing across layers — see below                                                                                                                        |

### SSOT rule

> Search for the same rule, inventory, label, route mapping, state classification, permission gate, or class stack elsewhere. Flag independently maintained copies even when their code is not textually identical.

When a PR introduces or extends a rule/inventory/mapping, trace for existing
owners before accepting the change.

### Wiring gap checks

When the PR adds or extends a feature, route, type, registry entry, or shared
primitive, verify downstream owners exist and still align. Flag **High by
default** when a changed layer is reachable but a required sibling is missing
or stale.

- Contract/schema change without API handler, catalog seed, or dashboard consumer
- New dashboard route/surface without query hook, barrel export, or permission gate
- Registry/manifest entry in one layer but not drift tests or sibling registries
  ([`new-content-type`](../new-content-type/SKILL.md) for catalog types)
- New `@rpg/ui` primitive without story, required test, or package export
- New env var, seed, or build/export gate omitted from setup/docs
- Feature barrel (`index.ts`) not updated when cross-feature imports would break

Downgrade to Medium when the PR is explicitly single-layer scoped with
documented follow-up (comment, ticket, or plan reference).

### Styling hacks

Flag **changed code** that:

- Overrides a semantic variant with utility classes
- Repeats an established class stack instead of using variants
- Bypasses an existing primitive
- Introduces raw color/font/spacing values where design tokens exist
- Adds one-off styling where repo convention requires CVA/variants

Do **not** flag every inline class — only when the PR introduces or expands a
pattern that defeats established scaffolding. Downgrade to Medium when styling
is strictly local (single call site, no second consumer expected).

Detail → [`packages/ui/docs/design-tokens.md`](../../../packages/ui/docs/design-tokens.md).

## Secondary lenses

Default Medium unless clearly blocking:

- Tests removed, weakened, or stale
- Documentation made stale or newly required
- Abstraction candidates with a proven second consumer

**Standard correctness checks** (one compact pass): accessibility (semantics,
labels, keyboard, axe coverage), security/authorization, performance (repeated
queries, unstable derived values), persistence (SSR-safe storage, version keys),
routing (canonical paths, unsafe prefix matching, deep links). Flag concrete
issues under High or Medium.

## Abstraction guardrail

> Do not recommend abstraction merely because two implementations look similar. Require shared semantics, compatible ownership, and a credible second consumer.

Otherwise: document duplication, defer extraction, or flag as SSOT/parallel-path risk.

## Severity

| Level      | Meaning                                                                                       |
| ---------- | --------------------------------------------------------------------------------------------- |
| **High**   | Merge-blocking correctness, silent failure, wiring gap, or meaningful SSOT/parallel-path risk |
| **Medium** | Should resolve or explicitly accept before merge                                              |
| **Low**    | Safe follow-up                                                                                |

**Product decision** is not a severity — add `**Decision needed:**` on a finding
when behavior may be intentional and requires author/product confirmation.

## Finding format

Severity lives in the heading.

```markdown
### High — Campaign lookup duplicated

**Evidence:** `a.ts:12`, `b.ts:41`
**Risk:** Missing/error semantics can drift between topbar and switcher.
**Fix:** Make one path consume the existing resolver.

### High — API route added without dashboard query

**Evidence:** `apps/api/src/routes/foo.ts` (new); no hook under `features/foo/api/`
**Risk:** Feature appears wired but UI cannot reach the endpoint.
**Fix:** Add TanStack Query hook and wire the route surface.

### Medium — Sidebar width hardcoded

**Evidence:** `w-[240px]` in `sidebar.tsx:34`; `sidebar.variants.ts` bypassed
**Risk:** Token drift; second surface will copy the magic number.
**Fix:** Move width to variants using semantic width token.
**Decision needed:** Confirm intentional one-off if keeping inline width.
```

Required: **Evidence**, **Risk**, **Fix**. Optional: **Decision needed**.

## Output structure

```markdown
# PR review: <name>

## Summary

## High priority

## Medium priority

## Safe follow-ups

## Documentation

## Merge checklist

- [ ] …

## Verdict

Not ready | Close | Ready after fixes | Ready to merge
```

Do not add informational praise, coverage summaries, or duplicate merge-blocker sections.

## Guardrails

- No speculative risks without a demonstrable code path
- Do not equate query failure with empty data
- Do not confuse UI hiding with server authorization
- Do not flag unchanged legacy unless the PR expands or relies on it
- Prefer smallest safe fix over opportunistic refactor
- Do not require stories/tests where [`AGENTS.md`](../../../AGENTS.md) does not

## Repo pointers

- [`AGENTS.md`](../../../AGENTS.md) — types, tokens, feature boundaries, auth, quality gates
- [`new-content-type`](../new-content-type/SKILL.md) — catalog type layer completeness
- [`feature-structure.md`](../../../apps/dashboard/docs/feature-structure.md)
- [`feature-conventions.md`](../../../apps/dashboard/docs/feature-conventions.md)
- [`design-tokens.md`](../../../packages/ui/docs/design-tokens.md)
