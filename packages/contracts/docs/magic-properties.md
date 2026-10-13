# Magic properties (equipment instances)

Magic property **presets** live in `@rpg/catalog` (`loadSeedMagicProperties`, `createMagicPropertyDefinitionProvider`). Persisted instances store `{ kind: 'preset', propertyId }` only; name, description, and mechanical bonuses resolve at read time through the provider.

**Custom properties** are inline `{ kind: 'custom', customId, name, description }` and never produce mechanical effects in V1.

## Invariants

- `magical: true` is required when `magicProperties` is non-empty; magical with zero properties is valid.
- At most one **enhancement** preset per instance (validated on write via `validateEquipmentMagicProperties`).
- At most one manual `mechanicalEffects` row per `target` (`attack_roll`, `damage_roll`, `armor_class`).
- Enhancement contributions are derived from presets and must not be duplicated into `mechanicalEffects`.

## Stacks

Equipment entries are **stacks** of identically configured copies. Customizing one copy of a quantity &gt; 1 stack uses editor **scope** (`one` splits via `splitEquipmentEntry`; `all` edits in place). Picker **loadout** mode adjusts only the canonical **plain** stack (`findCanonicalPlainEntry`).

See `summarizeEquipmentStacks` in `packages/contracts/src/rpg/runtime/creature/equipment-stack.ts`.

## Warnings

Non-blocking warnings come from `resolveEquipmentEffectWarnings` (totals above +3, damage floor, armor/shield AC sanity).
