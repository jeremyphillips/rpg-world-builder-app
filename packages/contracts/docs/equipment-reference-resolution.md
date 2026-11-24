# Equipment reference resolution and display

Contracts boundary for persisted equipment references: **identity → scoped catalog → typed outcome → display policy → layout**.

Spell reference depth: [spell-reference-resolution.md](./spell-reference-resolution.md). Shared lifecycle: [`catalog-lifecycle.ts`](../src/rpg/content/lib/catalog-lifecycle.ts). Validation: [`catalog-reference-issues`](../src/rpg/content/lib/catalog-reference-issues.ts) (`monsterEquipmentEdge`).

## Identity (two persisted shapes)

| Shape      | Persisted field                          | Match                                                          |
| ---------- | ---------------------------------------- | -------------------------------------------------------------- |
| Bare slug  | `equipmentSlug`, pool `equipmentSlugs[]` | `equipmentBySlug.get(slug)` when catalog is ready and in scope |
| Content id | `equipmentId` on inventory rows          | `equipmentById.get(id)` only                                   |

Do not use `resolveEquipmentByReference` or `${rulesetId}:${slug}` synthesis for **presentation**. Runtime builders may keep flexible matchers.

## Authoritative catalog scope (authoring)

Dashboard authoring builds **`ContentFormCtx.equipmentCatalogById`** from the campaign equipment list (`useEquipment`). Keys are `equipment.id`; the map includes drafts visible to the viewer.

| Source                             | Use                                  |
| ---------------------------------- | ------------------------------------ |
| `equipmentCatalogById`             | **Presentation and resolution**      |
| `options.equipment.forReference()` | **New selection** in comboboxes only |

**Not in a picker does not mean unresolved:** a persisted grant slug may resolve from `equipmentCatalogById` while omitted from `forReference()`.

## Catalog lifecycle (presentation)

| `AuthoringEquipmentCatalogStatus` | `EquipmentCatalogLoadState` | Before lookup     |
| --------------------------------- | --------------------------- | ----------------- |
| `pending`                         | `loading`                   | `catalog-loading` |
| `error`                           | `error`                     | `catalog-error`   |
| `ready`                           | `ready`                     | slug / id lookup  |

Helpers: [`equipment-catalog-context.ts`](../src/rpg/content/equipment/equipment-catalog-context.ts).

## Display policy (contracts-owned)

[`EQUIPMENT_REFERENCE_DISPLAY_MESSAGES`](../src/rpg/content/equipment/equipment-catalog-context.ts):

| Semantic reason                                                    | Message                         |
| ------------------------------------------------------------------ | ------------------------------- |
| `unknown-equipment` / `ambiguous-equipment`                        | Equipment reference unavailable |
| `catalog-loading`                                                  | Loading Equipment…              |
| `catalog-error` / `catalog-unavailable` / `catalog-scope-mismatch` | Could not load Equipment.       |

Consumers must not use `formatContentReferenceLabel`, slug title-case, raw ids, or `FieldOption[]` labels for persisted equipment reference display.

## Third content type integration checklist

1. Alias shared lifecycle helpers from `catalog-lifecycle.ts`.
2. Define persisted key and exact lookup; add scope only if the key is not globally unique.
3. Add domain not-found reason; reuse lifecycle reasons.
4. Add `present*ReferenceDisplayName` with content-type terms for loading/error.
5. Wire persisted-reference display; keep `forReference()` on comboboxes only.
6. Add adversarial tests (loading ≠ missing, picker bypass, identity).

Skills are the likely next adopter (`skillCatalogBySlug`).
