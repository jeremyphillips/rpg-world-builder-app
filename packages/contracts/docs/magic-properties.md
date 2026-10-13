# Magic properties (equipment instances)

Magic property **presets** live in `@rpg/catalog` (`loadSeedMagicProperties`, `createMagicPropertyDefinitionProvider`). Persisted instances store `{ kind: 'preset', propertyId }` only; name, description, and mechanical bonuses resolve at read time through the provider.

**Custom properties** are inline `{ kind: 'custom', customId, name, description }` and never produce mechanical effects in V1.

## Invariants

- `magical: true` is required when `magicProperties` is non-empty; magical with zero properties is valid.
- At most one **enhancement** preset per instance (validated on write via `validateEquipmentMagicProperties`).
- At most one manual `adjustments` row per `target` (`attack_roll`, `damage_roll`, `armor_class`).
- Enhancement contributions are derived from presets and must not be duplicated into `adjustments`.

## Stacks

Equipment entries are **stacks** of identically configured copies. Customizing one copy of a quantity &gt; 1 stack uses editor **scope** (`one` splits via `splitEquipmentEntry`; `all` edits in place). Picker **loadout** mode adjusts only the canonical **plain** stack (`findCanonicalPlainEntry`).

See `summarizeEquipmentStacks` in `packages/contracts/src/rpg/runtime/creature/equipment-stack.ts`.

## Warnings

Non-blocking warnings come from `resolveEquipmentEffectWarnings`. They appear only when the
relevant rules calculation supports the message:

- **Above standard enhancement (+3):** only when an applicable enhancement preset contributes to
  that target's total (not for a standalone high manual modifier alone).
- **Damage floor:** when derived minimum weapon damage can fall below 1.
- **Body armor / shield AC:** when full AC resolution confirms the piece would net-worsen AC.

## Editor UI (dashboard)

In `EquipmentInstanceEditorDrawer`, enhancement bonuses are derived from presets and are not
editable adjustment cards. When a preset and a manual adjustment share a target, a
**Combined modifiers** block lists per-target totals and names both sources.

Magic properties removed by turning **Magic item** off are dropped on **Done** (the editor
session), not on page Save.
