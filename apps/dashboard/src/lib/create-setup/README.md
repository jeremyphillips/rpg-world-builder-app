# Create setup

Ordered, dependent authoring for create flows (locations, Quick NPC, future consumers).

## Rule

Setup is **ordered/dependent authoring**; controls are **pluggable**; `required` controls sequencing,
while `collapseWhenComplete` is **presentation policy**, not completion policy.

```text
sequencer  → order, visibility, visibleWhenComplete, dependsOn, active/complete, invalidation, collapse policy
panel      → kind → control (choice | number)
```

- **Array order defines presentation order** — inserting a set shifts reveal position; `summaryGroup`
  membership is declared per set, never inferred from adjacency.
- **Sequencer** (`create-setup-sequence.lib.ts`) is control-agnostic — it never imports UI.
- **Sequence model** (`useCreateSetupSequence`) is owned by the feature setup phase and passed to
  `CreateSetupPanel` and sibling UI (e.g. Quick NPC Build card). One instance — no forked reopen state.
- **Panel** (`create-setup-panel.client.tsx`) maps `kind` to `CollapsibleRadioCardField` or `NumberStepper`.
- **`summaryGroup`** — set-level semantic grouping. When every member is collapsed-complete, one quiet
  `SetupSummaryCard` renders; a single completed member stays on `ChooserSummaryCard` until the group completes.
- **`skipLabel`** — optional sets expose an explicit skip affordance; skipping emits
  `onSetupValueChange({ skipped: true, ... })` and the feature records resolved-without-value.
- **`isComplete`** is caller-owned on each set; the sequencer reads it but does not derive it from values.
- **`visibleWhenComplete`** hides a set until listed upstream sets are complete — presentation-only.
- **`dependsOn`** declares domain invalidation — the panel emits `invalidatedSetIds`; feature applicators
  clear dependents atomically. No per-set `onReset`.
- **Same-value reselect** — when `nextValue === set.value`, the panel dismisses reopen state and emits nothing.
- **`required: false`** — optional sets can be skipped or left incomplete when they do not gate downstream
  visibility; explicit skip completes the set for reveal purposes.
- **`collapseWhenComplete: false`** keeps a completed visible set expanded (e.g. Level between choice sets).

The active set is the first incomplete required set among visibility-gated sets, then the first
incomplete optional set that gates downstream visibility via `visibleWhenComplete`, then the
terminal set. Completed and optional predecessors are visible; an incomplete visible optional set
stays expanded. Reopen temporarily focuses the requested set.

## Summary model

- **Setup phase** — grouped `SetupSummaryCard` rows from set `fieldLabel` + selected label; row-level Change reopens.
- **Authoring phase** — `SetupSummaryCard` with card-level Change; rows from feature `resolveXSetupSummaryRows()`.
- **Shared renderer** — `SetupSummaryCard` / `SetupSummaryRow` for both phases.

Feature domain models stay in feature `lib/` and build `CreateSetupSet[]` for the panel.

## Consumers

- Location create setup — choice sets via `CreateSetupShell` and `buildLocationCreateSetupSets`
- Quick NPC modal setup — Title and Species via `CreateSetupPanel`; Class and Level in sibling `QuickNpcBuildCard`

**Documented exception:** Building → Organizations composer uses its own stage machine but adopts the
reveal invariant (hide downstream while editing upstream kind via `LocationConnectionKindStep`
`onExpandedChange`; same-value reselect collapses without downstream reset).

Sequenced create-modal setup must use create-setup orchestration unless listed as a documented
exception. `create-setup-parallel-path-drift.test.ts` guards direct `CollapsibleRadioCardField` /
`RadioCardField` imports in `*create*` production components.

## UX invariants

- **Progressive reveal** — downstream setup UI stays hidden until upstream choices are complete, and
  hides again while an upstream choice is being edited.
- **Same-value reselect** — re-confirming the current choice dismisses edit mode without emitting a
  value change or clearing downstream state.
- **Single mutation channel** — feature applicators own all setup transitions; the panel emits
  `onSetupValueChange` only for genuine changes.
- **Grouped summaries** — `summaryGroup` members collapse into one `SetupSummaryCard` only when every
  member is complete; a lone completed member stays on `ChooserSummaryCard`.
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
