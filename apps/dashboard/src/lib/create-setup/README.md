# Create setup

Ordered, dependent authoring for create flows (locations, Quick NPC, future consumers).

## Rule

Setup is **ordered/dependent authoring**; controls are **pluggable**; `collapseWhenComplete` is **presentation policy**, not completion policy.

```text
sequencer  → order, visibility, dependsOn, active/complete, invalidation, collapse policy
panel      → kind → control (choice | number | future)
```

- **Sequencer** (`create-setup-sequence.lib.ts`) is control-agnostic — it never imports UI.
- **Panel** (`create-setup-panel.client.tsx`) maps `kind` to `CollapsibleRadioCardField` or `NumberStepper`.
- **`isComplete`** is caller-owned on each set; the sequencer reads it but does not derive it from values.
- **`onReset`** is required when `dependsOn` is non-empty — invalidation calls `onReset()`, not value clears.
- **`collapseWhenComplete: false`** keeps a completed visible set expanded (e.g. Level between choice sets).

Feature domain models (location intent, NPC build context) stay in feature `lib/` and build `CreateSetupSet[]` for the panel.

## Consumers

- Location create setup — choice sets only via `LocationCreateSetupShell`
- Quick NPC modal setup — Species → Level → Class

Do not route setup through `FormItem` / `Form` — that layer is for tabbed authoring, not progressive create setup.
