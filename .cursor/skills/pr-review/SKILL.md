---
name: pr-review
description: >-
  Structured pull-request review for this repo — SSOT violations, parallel
  paths, ownership conflicts, styling hacks, silent failures, wiring gaps, and
  regressions, approved-plan completeness, implementation fidelity, and
  verification accuracy. Use when reviewing a branch, PR, or diff; not for
  Bugbot or security-only scans.
disable-model-invocation: true
---

# PR Review

Read-only review of **behavior introduced, changed, or required by the approved
scope** — not a file inventory. For plan-backed work, review both what changed
and what should have changed, including unchanged consumers that are required
for adoption or integrity.
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
   (default base: repo default branch). For initiative completion, establish the
   actual implementation range, not just the latest fix commit.
3. Read [`AGENTS.md`](../../../AGENTS.md),
   [docs/agent-validation.md](../../../docs/agent-validation.md),
   [docs/architecture-ssot.md](../../../docs/architecture-ssot.md) when ownership
   is unclear, and touched-area docs as needed.
4. **Establish approved scope.** Read the complete applicable plan and approved
   refinements; distinguish historical investigation from binding decisions.
   Build a working requirement checklist for plan-backed reviews (lens 10).
5. Group changes by feature and layer. Trace user-visible flows; read deleted
   files/tests for lost guarantees.
6. **SSOT search** — grep or trace for semantic duplication (see below).
7. **Wiring gap check** — trace changed symbols through actual production owners:
   contracts → API/catalog → dashboard route/query → UI export/story/test, as
   applicable. Follow the complete lifecycle, not merely imports or registration.
8. **Completeness sweep** — reconcile the requirement checklist and previous
   remediation findings. For each substantive finding, inspect materially
   equivalent defects in other affected consumers. Group by root cause.
9. Write findings and verdict using the format below. Qualify the verdict if
   any required review boundary remains unexamined.

## Primary lenses

Review **first**. For lenses 1–9, treat concrete instances as **High by default**.
Downgrade to Medium when duplication is intentionally bounded (explicit boundary
comment, migration shim with approved follow-up) or styling is strictly local and
non-reusable. Lens 10 uses the risk-based severity and separate acceptance status
below.

| #   | Lens                             | Look for                                                                                                                                                         |
| --- | -------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | **SSOT violations**              | Same rule, inventory, label, route mapping, state classification, permission gate, or class stack in multiple places — even when code is not textually identical |
| 2   | **Parallel paths**               | Multiple implementations of the same behavior likely to drift (route matching, loading-state classification, campaign lookup, nav inventory)                     |
| 3   | **Ownership conflicts**          | Feature vs layout, dashboard vs `@rpg/ui`, contracts vs presentation, cross-package imports violating intended boundaries                                        |
| 4   | **Styling/scaffolding hacks**    | See [Styling hacks](#styling-hacks)                                                                                                                              |
| 5   | **Silent failures**              | Errors masquerading as empty data, missing entities as loading, swallowed query failures, UI hiding without server enforcement                                   |
| 6   | **Behavior or test regressions** | Changed flows, defaults, navigation, permissions, persisted state; deleted/weakened/stale tests                                                                  |
| 7   | **Wiring gaps**                  | Partial landing across layers — see below                                                                                                                        |
| 8   | **New form slots**               | A new production `kind: 'slot'` that `display`, `visibility`, `optionsResolve`, `hint.resolve`, `derivedMeta`, `valueSyncs`, `dependent`, or `optionalDisclosure` could express. A new or renamed identity must update the [slot register](../../../apps/dashboard/docs/form-slot-register.md) and `form-slot-literal-baseline.json`. Confirm-gated multi-path writes stay feature controllers plus `ConfirmDialog`. Reject raw `<input>`, `<select>`, or `<textarea>` in `components/form/slots/**` (see [.cursor/rules/form-slots.mdc](../../../.cursor/rules/form-slots.mdc)). |
| 9   | **Metric-only complexity refactors** | Splits/extracts whose only stated goal is passing Fallow; new single-use `*.lib.ts`, pass-through helpers, or extra files without semantic boundary — see [complexity-remediation.md](../../../docs/complexity-remediation.md). Favor simplify-in-place, meaningful tests, consolidate/remove dubious abstractions. |
| 10  | **Plan compliance and verification** | When approved scope is inferable (PR description, commits, linked plan): missing/incorrect implementation, missing boundary verification, inaccurate “done” claims, weaker test substitution — policy in [AGENTS.md § Approved work](../../../AGENTS.md#approved-work) and [agent-validation.md § Plan execution](../../../docs/agent-validation.md#plan-execution). |

### Plan compliance (lens 10)

When approved scope is available, plan compliance is a **mandatory review pass**,
not an incidental finding category. Use the approved requirements as the review
checklist. Follow [AGENTS.md § Approved work](../../../AGENTS.md#approved-work)
and [agent-validation.md § Plan execution](../../../docs/agent-validation.md#plan-execution).

#### Completeness and implementation fidelity

- Read the full approved plan, authoritative decisions, acceptance criteria, and
  approved refinements. Establish phase dependencies, the intended review range,
  and any explicitly deferred workflows. Do not treat historical investigation,
  completed todos, or post-implementation docs as amendments to approved scope.
- Account for every mandatory requirement: implementation, negative cases,
  production adoption, measurable guarantees, phase gates, enforcement, cleanup,
  and documentation. Include requirements that may be entirely absent from the diff.
- Trace each requirement to the actual production entry point and owning code.
  Verify intended semantics, defaults, and failure behavior, not terminology or
  file structure alone. A helper, registry entry, adapter, renamed wrapper, or
  test is not proof of production adoption.
- Verify the intended authority is actually used, and that superseded paths are
  removed or confined to approved exceptions. Inspect specialized consumers and
  alternative operation modes; do not infer adoption from a common import.
- Check for unauthorized scope reductions, substituted architectures, skipped
  phase gates, and weakened acceptance criteria. Identify genuine approved
  deviations separately. If scope cannot be established, say what is unknown;
  do not invent requirements or silently declare them satisfied.

Classify findings when relevant:

| Kind | Focus |
| ---- | ----- |
| Missing implementation | Mandatory behavior absent from the resulting implementation |
| Incorrect implementation | Behavior contradicts stated criteria |
| Missing required verification | No adequate evidence at the required boundary |
| Inaccurate completion claims | Summary/todos/matrix assert done while mandatory criteria open |
| Optional improvement | Non-mandatory gap |

**Severity:** By risk (data integrity, correctness, security, user-facing impact),
not automatic High for every missing test. State separately whether the finding
**blocks approved-plan acceptance** within the reviewed scope.

#### Verification accuracy

Inspect test bodies, fixtures, assertions, and production wiring. Verify that the
fixture reaches the claimed behavior, that assertions would fail if the guarantee
were broken, and that mocks do not replace the boundary being verified. Inspect
removed or weakened tests for lost guarantees. Confirm enforcement checks detect
representative prohibited behavior, and that exemptions or allowlists do not hide
incomplete adoption.

Distinguish structural inspection, inspected behavioral coverage, author-reported
execution, freshly executed verification, and unverified requirements. File presence,
source-text checks, or narrow unit success do not establish required mounted,
integration, or browser guarantees. Verify the relevance of prior results to the
reviewed revision. Require concrete evidence for claimed baseline failures.

Run relevant read-only verification where permitted by repository guidance; do not
modify tracked files, tests, snapshots, or plans. Respect checkpoint restrictions.
Report exact commands/results and explain missing required verification. Never
claim an unexecuted check passed.

#### Acceptance assessment

Track implementation and verification separately. Account for every applicable
mandatory criterion using:

| Status | Meaning |
| ------ | ------- |
| Satisfied | Required implementation and verification established |
| Partial | Some required implementation or coverage incomplete |
| Failed | Implementation contradicts the requirement or required verification fails |
| Unverified | Required evidence unavailable or not established |
| Deferred | Explicitly excluded by an approved scope decision |

Group criteria with shared evidence; expand gaps individually. Do not independently
defer mandatory work or declare the approved scope complete while mandatory
requirements remain partial, failed, or unverified. If review scope is intentionally
narrow, do not imply acceptance of the entire initiative.

### SSOT rule

> Search for the same rule, inventory, label, route mapping, state classification, permission gate, or class stack elsewhere. Flag independently maintained copies even when their code is not textually identical.

Classify findings as duplicate authority (**A**), missing integration (**B**), orphaned export (**C**), or inconsistent domain messages (**D**) per [architecture-ssot.md](../../../docs/architecture-ssot.md). For **D**: flag new plain rule constants, inline `addCustomRefinementIssue` literals for reusable rules, or validation transport rendered without the documented display adapter ([validation-messages.md](../../../packages/contracts/docs/validation-messages.md#display-boundaries)).

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

**Barrels:** in-repo only — do not flag `index.ts` churn as semver/breaking
change; flag missing wiring only (bullets above). → [AGENTS.md § Project stage](../../../AGENTS.md#project-stage).

Downgrade to Medium when the PR is explicitly single-layer scoped with
an approved deferred follow-up (comment, ticket, or plan reference). This does
not excuse missing mandatory adoption in a plan that claims full completion.

### Boundary completeness

For changed shared contracts, representations, policies, or primitives, trace the
applicable lifecycle: construction → validation → transformation → consumption →
persistence → reload. Inspect actual call sites, including unchanged consumers
that rely on the changed contract. Look for:

- Missing, empty, malformed, stale, and unsupported inputs.
- Async completion, reset, replacement, and context changes.
- Partial success, rejected writes, destructive operations, and authorization scope.
- Information or identity lost between layers; silent no-ops and misleading fallbacks.
- Presentation guards that leave underlying operations unsafe.
- New infrastructure coexisting with the authority it was intended to replace.

Trace the earliest boundary where a guarantee fails and inspect other consumers
for the same failure pattern. Revisit previous remediation findings for their
underlying guarantees, not merely their named fixes. Use representative cases for
materially distinct behaviors; do not require exhaustive Cartesian test matrices
or speculate beyond a demonstrable code path.

### Styling hacks

Flag **changed code** that:

- Overrides a semantic variant or `ui-*` / `dash-*` class with ad-hoc utility stacks
- Repeats an established chrome or typography stack instead of the shared primitive,
  semantic class, or `Text` / `text-style-*` role
- Bypasses an existing primitive (`Card`, `Panel`, `Alert`, entity surfaces, field chrome)
- Introduces raw color/font/spacing values where design tokens exist
- Adds a new `*.variants.ts` (or equivalent) that only hides static Tailwind with no
  meaningful variant axis
- Duplicates styling ownership that [ui-architecture.md](../../../packages/ui/docs/ui-architecture.md)
  assigns to `@rpg/ui` or dashboard shared surfaces

Do **not** flag every inline class — layout utilities (`flex`, `gap-*`, grid tracks)
in JSX are expected per [AGENTS.md](../../../AGENTS.md#styling-conventions). Flag only
when the PR introduces or expands a pattern that defeats established scaffolding.
Downgrade to Medium when styling is strictly local (single call site, no second consumer
expected).

Detail → [AGENTS.md § Styling conventions](../../../AGENTS.md#styling-conventions),
[ui-architecture.md](../../../packages/ui/docs/ui-architecture.md),
[semantic-style-layers.md](../../../packages/ui/docs/semantic-style-layers.md),
[design-tokens.md](../../../packages/ui/docs/design-tokens.md) (color and surfaces).

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
For plan-related findings, include **Plan requirement** (section or criterion),
**Kind** (lens 10), and **Blocks acceptance** (yes/no). State root cause, affected
consumers, and the necessary regression proof when relevant. Group equivalent
findings rather than repeating symptoms.

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

For plan-backed reviews, include a compact **Plan acceptance** section before
the verdict:

| Requirement or phase | Implementation evidence | Verification evidence | Status |
| -------------------- | ----------------------- | --------------------- | ------ |

Account for all mandatory criteria, grouping shared evidence without concealing
individual gaps. Include a concise **Verification** section with executed commands,
results, required checks not run, and any blockers or intentionally deferred gates.
Distinguish inspected evidence and author-reported runs from fresh execution.

The verdict distinguishes merge readiness from approved-plan acceptance. A branch
with no confirmed merge-blocking production defect may still fail plan acceptance
or have verification blocked. Identify unreviewed scope and limitations explicitly.
Do not use “Ready to merge” to imply complete acceptance when mandatory criteria
remain open.

Do not add informational praise, generic coverage summaries, or duplicate
merge-blocker sections. Do not repeat findings in the acceptance matrix.

## Guardrails

- No speculative risks without a demonstrable code path
- Do not equate query failure with empty data
- Do not confuse UI hiding with server authorization
- Do not flag unrelated unchanged legacy. Inspect unchanged consumers where the PR
  expands, relies on, or was required to migrate them.
- Do not stop after the first several findings. Reconcile the approved checklist
  and complete the equivalent-pattern sweep before issuing a verdict.
- Do not recommend fixes that contradict approved architectural or product
  decisions. Documentation, defensive fallbacks, and renamed APIs are not
  substitutes for required behavior.
- If scope or evidence is incomplete, report the unreviewed boundaries and qualify
  acceptance rather than asserting closure.
- Prefer smallest safe fix over opportunistic refactor
- Do not require stories/tests unless required by [`AGENTS.md`](../../../AGENTS.md),
  approved work, or necessary to substantiate a concrete finding

## Repo pointers

- [`AGENTS.md`](../../../AGENTS.md) — types, feature boundaries, auth, quality gates;
  [§ Styling conventions](../../../AGENTS.md#styling-conventions) for semantic CSS, CVA, and tokens
- [`ui-architecture.md`](../../../packages/ui/docs/ui-architecture.md) — component ownership and reuse
- [`semantic-style-layers.md`](../../../packages/ui/docs/semantic-style-layers.md) — layer policy (cards, rows, controls)
- [`design-tokens.md`](../../../packages/ui/docs/design-tokens.md) — color layers, surfaces, field chrome (not full styling policy)
- [`new-content-type`](../new-content-type/SKILL.md) — catalog type layer completeness
- [`feature-structure.md`](../../../apps/dashboard/docs/feature-structure.md)
- [`feature-conventions.md`](../../../apps/dashboard/docs/feature-conventions.md) — includes [§ Styling](../../../apps/dashboard/docs/feature-conventions.md#styling)
- [`card-guide.md`](../../../apps/dashboard/docs/card-guide.md) — card vs row vs entity surface selection
