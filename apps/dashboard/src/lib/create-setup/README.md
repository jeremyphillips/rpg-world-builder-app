# Create setup

Ordered, dependent authoring for create flows (locations, Quick NPC, future consumers).

## Rule

Setup is a **sequence of decisions**. Each decision completes on selection (auto) or explicit
confirmation (compound / recommended). Completed decisions render as partial `SetupSummaryCard`
rows; the active decision renders as an expanded `RadioCardField` only.

```text
sequencer  → order, visibility, visibleWhenComplete, dependsOn, active/complete, invalidation
panel      → active RadioCardField + partial summary rows (no collapse chrome)
footer     → derived from completion semantics (Cancel-only / disabled Continue / enabled Continue / re-entry)
```

- **Array order defines presentation order** — inserting a set shifts reveal position; `summaryGroup`
  membership is declared per set, never inferred from adjacency.
- **Sequencer** (`create-setup-sequence.lib.ts`) is control-agnostic — it never imports UI.
- **Sequence model** (`useCreateSetupSequence`) is owned by the feature setup phase and passed to
  `CreateSetupPanel`, `CreateSetupFooter`, and sibling UI (e.g. Quick NPC Build card). One instance
  — no forked reopen state.
- **Panel** (`create-setup-panel-items.client.tsx`) maps active sets to `RadioCardField` with
  reselect opt-in; completed non-active sets render partial rows in declared `summaryGroup` cards
  (or standalone single-row cards when ungrouped).
- **`summaryGroup`** — set-level semantic grouping. A group renders whenever it has ≥1 completed
  non-active row. Ungrouped completed sets get their own standalone card — never join an implicit group.
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

## Summary model

- **Setup phase** — partial `SetupSummaryCard` rows from completed decisions; row-level Change reopens.
  Active/reopened sets are omitted from summary rows.
- **Authoring phase** — `SetupSummaryCard` with card-level Change; rows from feature `resolveXSetupSummaryRows()`.
- **Shared renderer** — `SetupSummaryCard` / `SetupSummaryRow` for both phases.

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

**Building → Organizations composer** — feature-owned stage machine (`intent → discovery → review | branch`) with `SetupSummaryCard` partial rows and `RadioCardField` for active relationship kind. Entity discovery, nested org create, draft plan, and composite commit stay local. The `branch` stage is the active create-org control — not a completed placeholder organization row. A second create-modal draft relationship tab should copy these primitives rather than extracting a generic composer until a second identical consumer exists.

Sequenced create-modal setup must use create-setup orchestration unless listed as a documented
exception. `create-setup-parallel-path-drift.test.ts` guards `CollapsibleRadioCardField` and
`ChooserSummaryCard` in create-modal decision sequences; `RadioCardField` is allowed for active
decisions. Relationship drawers keep `LocationConnectionKindStep` (collapsing kind chrome).

Create-modal radio cards represent **active decisions only**; completed setup decisions render through
`SetupSummaryCard` partial rows.

## UX invariants

- **Progressive reveal** — downstream setup UI stays hidden until upstream choices are complete, and
  hides again while an upstream choice is being edited.
- **Same-value reselect** — re-confirming the current choice dismisses edit mode without emitting a
  value change or clearing downstream state.
- **Single mutation channel** — feature applicators own all setup transitions; the panel emits
  `onSetupValueChange` only for genuine changes.
- **Partial summaries** — completed decisions only; no placeholder rows for unresolved sets.
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
