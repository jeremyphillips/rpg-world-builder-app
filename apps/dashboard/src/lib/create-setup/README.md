# Create setup

Ordered, dependent authoring for create flows (locations, Quick NPC, future consumers).

## Rule

Setup is a **sequence of decisions**. Each decision completes on selection (auto) or explicit
confirmation (compound / recommended). Completed decisions render as partial `SelectionSummaryCard`
rows from `@rpg/ui`; the active decision renders as an expanded `RadioCardField` only.

```text
sequencer  → order, visibility, visibleWhenComplete, dependsOn, active/complete, invalidation
panel      → resolved summary rows + active RadioCardField (no collapse chrome)
footer     → derived from completion semantics (Cancel-only / disabled Continue / enabled Continue / re-entry)
```

- **Array order defines presentation order** — inserting a set shifts reveal position; `summaryGroup`
  membership is declared per set, never inferred from adjacency.
- **Sequencer** (`create-setup-sequence.lib.ts`) is control-agnostic — it never imports UI.
- **Sequence model** (`useCreateSetupSequence`) is owned by the feature setup phase and passed to
  `CreateSetupPanel`, `CreateSetupFooter`, and sibling UI (e.g. Quick NPC Build card). One instance
  — no forked reopen state.
- **Panel** (`create-setup-panel-items.tsx`) renders resolved summary rows first, then the active
  `RadioCardField`. Summary rows come from `resolveSetupSummaryRows` and a per-flow registry.
  Choice-set flows use `createChoiceSetSummaryDefinitions` unless they pass their own cards.
- **`summaryGroup`** — set-level card grouping only. A group renders whenever it has ≥1 resolved
  value, including the active row and downstream values. Ungrouped resolved sets get their own
  standalone card — never join an implicit group. Grouping does not hide rows.
- **`skipLabel` / `skippedValueLabel`** — optional sets expose explicit skip; skipping emits
  `onSetupValueChange({ skipped: true, ... })` and the feature records resolved-without-value.
- **`isComplete`** on each set is caller-owned; the sequencer reads it but does not derive it from values.
- **Sequence-level `isComplete`** — all sets complete, optional sets answered or skipped, external
  decisions resolved and (when explicit) confirmed at their current revision.
- **`visibleWhenComplete`** hides a set until listed upstream sets are complete — presentation-only.
- **`dependsOn`** declares domain invalidation — the panel emits `invalidatedSetIds`; feature applicators
  clear dependents atomically.
- **Same-value reselect** — when `nextValue === set.value`, the panel dismisses reopen state and emits nothing.
- **`required: false`** — optional sets can be skipped or left incomplete when they do not gate downstream
  visibility; explicit skip completes the set for reveal purposes.

The active set is the first incomplete required set among visibility-gated sets, then the first
incomplete optional set that gates downstream visibility via `visibleWhenComplete`, then the
terminal set. Completed and optional predecessors are visible; an incomplete visible optional set
stays expanded. Reopen temporarily focuses the requested set.

## Completion modes

| Mode                         | Behavior                                                                                        |
| ---------------------------- | ----------------------------------------------------------------------------------------------- |
| Auto (radio choice)          | Selection completes the decision; final selection may fire `onSetupComplete` synchronously      |
| Explicit (external decision) | Values must be resolved (`isResolved`) then confirmed via footer Continue at current `revision` |

`onSetupComplete` fires synchronously inside the user-triggered handler when completion transitions
from false → true — no effect observation. Re-entering setup with completion already true never auto-fires.

### External decisions

Features register compound decisions (e.g. Quick NPC Build, page-session navigation):

```ts
externalDecisions: [
  {
    id: 'quickNpcBuild',
    isResolved: buildValid,
    completion: 'explicit',
    revision: quickNpcBuildRevision(values), // material input fingerprint
    completeLabel: 'Continue',
  },
]
```

Revision changes invalidate prior confirmations — the user must re-confirm before returning to authoring.

## Footer derivation

`CreateSetupFooter` derives from `CreateSetupSequenceModel`:

```text
auto-completing sequence, first pass       → [Cancel]
explicit decision unresolved               → [Cancel] [Continue disabled]
explicit decision resolved, unconfirmed    → [Cancel] [Continue]
explicit decision confirmed / auto-complete  → transition (onSetupComplete)
setup re-entered, already complete         → [Cancel] [Continue]  (re-entry; no auto-fire)
```

Extra setup footer actions (e.g. Quick NPC Preview) declare `CreateSetupFooterAction` entries with
`visibility: 'always' | 'final-set'`. `resolveCreateSetupFooterActions` filters them using the
**registered** sequence (`resolveCreateSetupSequenceSetIds`) and the active sequence id
(`resolveCreateSetupActiveSequenceSetId`), not progressive `visibleSetIds` — the latter is only for
editor reveal.

## Summary model

`resolveSetupSummaryRows(state, registry)` lists every definition whose `resolveValue` is non-empty,
in registry order. It does not look at the active step, and it does not decide whether a dependent
value is still valid. Applicators clear or replace invalid values first; the next resolve describes
the resulting state.

- **Resolved value** — render the row.
- **No resolved value** — omit the row.
- **Open editor** — render the row and omit Change (`targetSetId === activeTargetId`).
- **Any other row** — render Change, which navigates to `targetSetId`.
- **Order** — registry order, not completion history. Navigating backward does not hide downstream rows.
- **Editors** — downstream controls still hide while an earlier set is the open editor.
- **Authoring phase** — the same rows, with `activeTargetId` null so every row keeps Change.

Feature domain models stay in feature `lib/` and build `CreateSetupSet[]` for the panel.

## Consumers

- **Location create modal** — Site/Settlement/Region auto-advance on final selection; Building Form → Facility
  with skip row copy; authoring summary via `CreateModalShell.setupSummary`.
- **Location create page sessions** — same choice-set model via `CreateSetupShell`; navigation is an explicit
  external decision (Continue, never auto-navigate on radio click). **Deferred product decision:** whether
  settlement/site/region page entries fold into `LocationCreateModal` and retire `CreateSetupShell` is
  intentionally undecided — do not treat page sessions as a permanent parallel architecture without review.
- **Quick NPC modal setup** — Title and Species via `CreateSetupPanel`; Build as explicit external decision;
  Class and Level in sibling `QuickNpcBuildCard`.

**Building → Organizations composer** — feature-owned stage machine
(`intent → discovery → review | branch`) with `CreateCompositionSummary` completed
decisions and `RadioCardField` for active relationship kind. Entity discovery,
nested org create, draft plan, composite commit, and child footer semantics stay
local. The `branch` stage is the active create-org control — not a completed
placeholder organization row. Shared structural presentation lives in
`@/lib/create-flow` (`CreateComposition*`); see
[create-flow.md](../../docs/create-flow.md#nested-composition-presentation).

Sequenced create-modal setup must use create-setup orchestration unless listed as a documented
exception. Relationship sequenced Add drawers import `SelectionSummaryCard` from `@rpg/ui` directly —
they are **not** create-setup consumers. `create-setup-parallel-path-drift.test.ts` and
`sequenced-relationship-drawer-drift.test.ts` guard against collapse chrome and deleted kind-step
wrappers. `RadioCardField` is allowed for active decisions.

Create-modal radio cards represent **active decisions only**; completed setup decisions render through
`SelectionSummaryCard` partial rows from `@rpg/ui`.

## UX invariants

- **Progressive reveal** — downstream editors stay hidden until upstream choices are complete, and
  hide again while an upstream choice is being edited. Summary rows for values that are still
  resolved stay visible.
- **Same-value reselect** — re-confirming the current choice dismisses edit mode without emitting a
  value change or clearing downstream state.
- **Single mutation channel** — feature applicators own all setup transitions; the panel emits
  `onSetupValueChange` only for genuine changes.
- **Resolved summaries** — rows describe current values only; no placeholder rows for unresolved sets.
- **Optional sets** — explicit skip completes the set for reveal; optional sets never auto-pass-through
  to the next question.

Do not route setup through `FormItem` / `Form` — that layer is for tabbed authoring, not progressive create setup.

## Event contract

```ts
onSetupValueChange({
  setId,
  previousValue,
  nextValue,
  invalidatedSetIds,
  skipped?: boolean,
})
```

Feature applicators are the only mutation point. Sequenced create-modal setup must use create-setup
orchestration unless listed as a documented exception (see **Consumers** above).
