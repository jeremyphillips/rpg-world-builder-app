# Drawer outlier decisions

Interim record of Phase 4 ownership verdicts from the
[drawer architecture audit](../../.cursor/plans/final_drawer_architecture_audit_5823f7da.plan.md).
Phase 5 folds these into `drawer-architecture.md`.

## Resolved

### `location-connected-party-character-options.lib`

**Verdict: split along natural ownership.**

| Slice                                                                   | Owner     | Module                                                                                               |
| ----------------------------------------------------------------------- | --------- | ---------------------------------------------------------------------------------------------------- |
| Generic character picker transport + entity summary/search helpers      | character | `features/character/lib/picker/character-picker-option.lib.ts`                                       |
| Connected-party slotting (merge campaign PCs + NPCs into sorted lookup) | locations | `features/content/locations/lib/connected-parties/location-connected-party-character-options.lib.ts` |

Organization member picker imports the character slice directly. Location consumers
keep the locations module, which re-exports the generic helpers under their prior
connected-party names for local call sites.

## Deferred (semantic triggers)

### Nested-create modal registry

Revisit when hard-coded create intents create an ownership problem: a create intent
owned by a feature the content lib cannot legitimately import, or a nested-create host
outside the relationship family. A merely-arbitrary third intent is **not** a trigger.

### Mobile bottom sheet

Explicit capability gap at the `@rpg/ui` primitive layer, outside the current drawer
grammar contract. Not scheduled.

### `Sheet.FooterActions` parity

Revisit when repeated footer implementations share the same semantics **and** layout;
call-site count is supporting evidence only. Not scheduled.
