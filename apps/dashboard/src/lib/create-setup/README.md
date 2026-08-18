# Create setup

Ordered, dependent authoring for create flows (locations, Quick NPC, future consumers).

## Rule

Setup is **ordered/dependent authoring**; controls are **pluggable**; `required` controls sequencing,
while `collapseWhenComplete` is **presentation policy**, not completion policy.

```text
sequencer  → order, visibility, visibleWhenComplete, dependsOn, active/complete, invalidation, collapse policy
panel      → kind → control (choice | number | note)
```

- **Sequencer** (`create-setup-sequence.lib.ts`) is control-agnostic — it never imports UI.
- **Panel** (`create-setup-panel.client.tsx`) maps `kind` to `CollapsibleRadioCardField`, `NumberStepper`, or read-only note copy.
- **`isComplete`** is caller-owned on each set; the sequencer reads it but does not derive it from values.
- **`visibleWhenComplete`** hides a set until listed upstream sets are complete — presentation-only; does not call `onReset`.
- **`dependsOn`** triggers upstream invalidation via `onReset()` — use only for real reset boundaries.
  Quick NPC setup is an exception: species→class invalidation lives in
  `applyQuickNpcSetupValueChange` (functional `setState`), so its Class set omits `dependsOn`.
- **`required: false`** makes a set pass-through: it remains visible/editable but does not block the
  next required set or Continue. Authors do not need a negative sentinel choice merely to advance.
- **`onReset`** is required when `dependsOn` is non-empty — invalidation calls `onReset()`, not value clears.
- **`collapseWhenComplete: false`** keeps a completed visible set expanded (e.g. Level between choice sets).

The active set is the first incomplete required set among visibility-gated sets, then the first
incomplete optional set that gates downstream visibility via `visibleWhenComplete`, then the
terminal set. Completed and optional predecessors are visible; an incomplete visible optional set
stays expanded. A controlled reopen still temporarily focuses the requested set and preserves the
existing Change/dependency behavior.

Feature domain models (location intent, NPC build context) stay in feature `lib/` and build `CreateSetupSet[]` for the panel.

## Consumers

- Location create setup — choice sets via `CreateSetupShell` and `buildLocationCreateSetupSets`
- Quick NPC modal setup — Title → Species → Recommended build (when present) → Level → Class

Do not route setup through `FormItem` / `Form` — that layer is for tabbed authoring, not progressive create setup.
