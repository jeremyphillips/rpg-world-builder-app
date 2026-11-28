# Complexity remediation (agents)

**Primary directive:** Fallow complexity findings are signals to investigate—not orders to extract, split files, or add abstractions. Optimize **total cognitive burden** (read, debug, extend, test), not individual metric scores. A lower score that adds indirection is a regression.

**When to read this:** A Fallow complexity finding, a refactor motivated by metrics, or a proposed helper/registry/wrapper. Full audit evidence: [complexity-threshold-investigation.md](./analysis/complexity-threshold-investigation.md).

## Enforced vs advisory

| Layer | Source | Behavior |
| ----- | ------ | -------- |
| **Enforced numerics** | [`.fallowrc.json`](../.fallowrc.json) `health` only | Authoritative thresholds; do not copy conflicting numbers into other docs. |
| **Pre-commit gate** | [`fallow-health-gate.mjs`](../tools/hooks/fallow-health-gate.mjs) | Fails on findings where `exceeded` is `cyclomatic`, `cognitive`, or `both`. **Estimated CRAP-only findings do not fail commit.** |
| **Coverage gate** | Same script with Istanbul `coverage-final.json` | Fails on **any** finding including CRAP (`exceeded: crap` or combined). Missing coverage file **fails closed** (exit 2). |
| **Dupes / dead-code** | Existing `gate:fallow-*` | Unchanged. |
| **Advisory judgment** | This doc | Band labels below are **not gates**. Below enforced maxima, **no** refactor or suppress is required for the score alone. |

Fallow 2.89: CRAP uses **`>= maxCrap`**. Static complexity bounds use Fallow’s `exceeded` field (see investigation doc for inclusivity notes). Raw `fallow health --format human` without the gate script **does not** match pre-commit policy when only estimated CRAP is over threshold.

## Remediation decision tree

Start every finding by classifying **complexity kind**:

| Kind | Meaning | Typical response |
| ---- | ------- | ---------------- |
| **Inherent** | Branching required by domain (closed unions, overlay walks, validators) | Simplify if possible; else tests, cohesion check, or narrow exception—not automatic extract |
| **Accidental** | Redundant state, duplicate branches, dead paths | Simplify or delete branches first |
| **Displaced** | Score lowered by extraction but behavior harder to follow | **Remove or consolidate** abstractions; prefer one readable unit |

**Outcomes (many require no production change):**

1. **Leave unchanged** — below gate, or above gate but cohesive; document in PR if reviewers ask.
2. **Add meaningful behavioral tests** — especially when CRAP flags untested branches (coverage gate).
3. **Simplify in place** — fewer branches, early returns, drop redundant state.
4. **Remove unnecessary abstraction** — pass-through helpers, single-use libs, config for trivial behavior.
5. **Consolidate fragmented responsibilities** — merge misleading splits that obscure one workflow.
6. **Reuse an existing primitive** — SSOT helpers, shared UI/form surfaces ([architecture-ssot.md](./architecture-ssot.md)).
7. **Extract a cohesive semantic boundary** — hook, lib module, policy function with a stable name and consumer.
8. **Introduce a justified abstraction** — only when acceptance criteria below pass.
9. **Request user approval** — inline `// fallow-ignore-next-line complexity — <reason>` or `.fallowrc.json` change (existing AGENTS.md policy).

Prefer that order when evidence is neutral; skip steps when the codebase shows a clearer win.

## Abstraction acceptance (+ / −)

Worth adding or **keeping** when it delivers meaningful semantic ownership, reuse, architectural enforcement, type safety, testability, or simpler consumer APIs.

**Challenge** (new or existing) helpers, registries, factories, adapters, interfaces, and config layers that: increase file hops, hide control flow, duplicate one call site, or only relocate complexity. SSOT and canonical ownership **do not** automatically justify another layer—prefer derive/exhaustive `Record` at the owner.

## Exceptions

- No blanket `ignorePatterns` or threshold inflation to hide problems.
- Suppression: `// fallow-ignore-next-line complexity — <why further change hurts maintainability>`; **consult the user** before config-wide ignores (AGENTS.md).
- Inherent patterns (exhaustive `switch`, schema walkers, formatters, save orchestration) **may** qualify after contextual review: still cohesive, discoverable, and testable?
- Revisit suppressions when touching the function or when coverage improves.

## DX checklist (before landing a refactor)

Can a developer read the full behavior, find the authority, debug, and extend without extra configuration? Did file count and navigation cost go **down** for the same feature?

## Examples (illustrative)

| Outcome | Reference |
| ------- | --------- |
| Simplify in place | [`campaign-settings-values.ts`](../apps/dashboard/src/features/campaign/lib/campaign-settings-values.ts) `pickDefined` pattern — investigation § refactors |
| Meaningful extraction + tests | Rich text `*.lib.ts` + tests — investigation § refactors |
| Metric-only fragmentation | Single-use `resolve*Override` chain (same investigation) |
| Justified suppress | [`form-field-labels.lib.ts`](../packages/ui/src/form/form-field-labels.lib.ts), [`resolve-core.ts`](../packages/contracts/src/rpg/content/lib/system-overlay/resolve-core.ts) |

**Related:** [Pre-abstraction checklist](./architecture-ssot.md#pre-abstraction-checklist-agents-and-reviewers), [tools/fallow/README.md](../tools/fallow/README.md), [hooks README](../tools/hooks/README.md).