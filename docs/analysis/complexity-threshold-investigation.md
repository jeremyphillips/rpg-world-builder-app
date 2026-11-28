# Complexity threshold investigation (2026-11)

Detailed evidence for [complexity-remediation.md](../complexity-remediation.md). Agents should load the canonical guide first; this archive supports threshold and policy decisions.

## Configuration and tooling

- **Fallow:** `^2.89` (verified CLI **2.89.0**). Thresholds in [`.fallowrc.json`](../../.fallowrc.json): `maxCyclomatic` **20**, `maxCognitive` **25**, `maxCrap` **133** (lowered from 250 in commit `66759cee9`; Fallow default CRAP is **30**).
- **No native “disable CRAP” flag.** Overrides: `--max-cyclomatic`, `--max-cognitive`, `--max-crap`. JSON findings include `exceeded`: `cyclomatic` | `cognitive` | `both` | `crap` (Fallow assigns one primary label per finding).
- **CRAP boundary:** documented as **`>= maxCrap`** (CLI reference). Cyclomatic/cognitive use Fallow’s internal comparison; gate logic reads `exceeded`, not re-derived numbers.
- **Coverage:** Without `--coverage`, CRAP uses `static_estimated` (test import graph). With Istanbul `coverage-final.json`, `coverage_source: istanbul`.

### Enforcement (before this branch)

| Checkpoint | Command | Prior behavior |
| ---------- | ------- | -------------- |
| Pre-commit | `gate:fallow-health` | Human grep for success line; **estimated CRAP-only** could block commit |
| Pre-push / CI | `gate:fallow-health:coverage` | CRAP with Istanbul after `pnpm coverage` |
| Dupes / dead-code | unchanged | separate gates |

**Policy drift:** [AGENTS.md](../../AGENTS.md) described CRAP at pre-push only, while pre-commit still failed on estimated CRAP (e.g. `handleSave` in `use-class-subclasses-tab.ts`: 15 CC, 8 cognitive, **240 CRAP** estimated — CRAP-only at commit).

### Repository distribution (production, Fallow 2.89)

~**28,041** functions; avg cyclomatic **2.5**, p90 **5**; maintainability index ~**88**. Configured maxima sit far above typical code; gate failures concentrate on outliers and CRAP-without-tests.

~**89** `fallow-ignore-next-line complexity` suppressions; **~11** include em-dash justification (good: `form-field-labels.lib.ts`, `system-overlay/*`).

## Representative modules (qualitative)

| Area | Role | Notes |
| ---- | ---- | ----- |
| `system-overlay/resolve-core.ts` | Policy tree walk, overlay merge | Inherent branching; justified suppressions; extraction would scatter precedence |
| `use-class-subclasses-tab.ts` | Save orchestration | Accidental **risk surface** via untested async branches (CRAP), not high CC/cognitive |
| `content-overview-table` (post-`86db90616`) | Table + hooks split | Reduced file mass; hook owns data/focus — **more files**, clearer boundaries |
| `campaign-settings-values.ts` (post-`b9a624764`) | Mixed outcome | `pickDefined` simplified; `resolve*Override` helpers are single-use (displaced complexity) |
| Rich text editor (post-`738390fe8`) | UI + libs + tests | Extraction aligned with test boundaries |
| `form-item-node.client.tsx` (post-`e9ae8e399`) | In-file dispatch split | Local helpers; acceptable if not exported noise |

### Refactor evaluation rubric (used for classifications above)

Beneficial only if **total** conceptual complexity, navigation, debugging, or extension cost improved—not if only Fallow scores dropped.

## Gate implementation decision

**Rejected:** `--max-crap 99999` on pre-commit (metric inflation, hides no native disable).

**Chosen:** JSON gate ([`fallow-health-gate.mjs`](../../tools/hooks/fallow-health-gate.mjs)) filters findings by `exceeded` and mode. Fallow exit **2** fails closed; exit **1** with only CRAP filtered passes pre-commit.

Regression fixtures: [`tools/hooks/__fixtures__/fallow-health-gate/`](../../tools/hooks/__fixtures__/fallow-health-gate/).

## Advisory bands (judgment only — not gates)

Relative to **`.fallowrc.json`** maxima only; no duplicate numerics here.

| Band | Signal | Expected agent response |
| ---- | ------ | ----------------------- |
| Acceptable | No Fallow finding; readable on read-through | None |
| Review | No gate trip; dense but cohesive | Optional note in PR; no metric-driven extract |
| Elevated | Gate finding or strong maintainability smell | Run [remediation tree](../complexity-remediation.md#remediation-decision-tree); tests/simplify before abstraction |
| Critical (enforced) | Pre-commit CC/cog or coverage CRAP | Remediate, test, suppress with user approval, or simplify |

## Conflicts in prior guidance

- “Pass fallow” commit culture vs AGENTS.md “use judgement.”
- Styling/docs: avoid abstraction without reuse ([semantic-css-migration.md](../../packages/ui/docs/semantic-css-migration.md)) — same principle, not linked from Fallow.
- Pre-abstraction checklist ([architecture-ssot.md](../architecture-ssot.md)) — SSOT-focused; missing complexity outcomes (leave unchanged, add tests, remove abstraction).

## Threshold change recommendation

**Retain** current `.fallowrc.json` numerics. Distribution does not justify raising cyclomatic/cognitive; CRAP at **133** is appropriate **with Istanbul only** (coverage gate).

## Document map

| Doc | Audience |
| --- | -------- |
| [complexity-remediation.md](../complexity-remediation.md) | Agents (compact) |
| This file | Investigators, policy updates |
| [tools/hooks/README.md](../../tools/hooks/README.md) | Gate mechanics |
| [tools/fallow/README.md](../../tools/fallow/README.md) | Fallow commands + link |