# Class feature authoring architecture

Class features are a persisted discriminated union on `kind`:

| Kind              | Role                                                          | Grants                                       |
| ----------------- | ------------------------------------------------------------- | -------------------------------------------- |
| `custom`          | Named features with prose, tables, and authored `grantGroups` | Stored                                       |
| `asi`             | Ability Score Improvement milestones                          | Projected (`resolveClassFeatureGrantGroups`) |
| `spellcasting`    | Unlocks `Class.spellcasting` at `level`                       | None                                         |
| `subclass-choice` | Subclass milestone                                            | None                                         |

Spellcasting mechanics live only on `Class.spellcasting`. Player-facing headings for spellcasting
rows live on `feature.name` and are not rewritten when `slotProgressionId` changes.

## Authoring (dashboard)

Structured row collections share one master-detail anatomy: inline title from `rowTitle`, then
`MasterDetailDetailBody` — a single outer `FormRhythmStack` for optional leading fields, shell-owned
`StructuredFacingHostPanel`, and primary `FormItems`. Contextual notices use `contextualChrome`
(outside the rhythm stack). Detail in
[apps/dashboard/docs/master-detail-detail-body.md](../apps/dashboard/docs/master-detail-detail-body.md).

- Add menu: Custom feature, ASI, Subclass (`ClassFeatureAddMenu`).
- Spellcasting rows are created only from the Spellcasting tab (`reconcileSpellcastingOnEnable`).
- Per-kind **field lists** live in `class-feature-form-fields.ts` (`CLASS_FEATURE_KIND_FIELDS` /
  `resolveClassFeatureItemFields`). **Title policy** is `createClassFeatureRowTitleConfig` in
  `class-feature-row-title.ts`. List `kindLabel` and eyebrows stay in `class-feature-authoring.ts`.
- Class master-detail rows omit a body `name` field; subclass feature arrays keep `name` on the
  collapsible item header (`primaryField: 'name'`).
- Species traits and heritage options use `species-trait-row-title.ts` (`authored` on `name` for
  custom rows; `override` on `nameOverride` for grant and template rows).
- `FormEmbeddedMasterDetailEditor` rejects `facing` without `rowTitle` at the type level.

## Validation

`classStoredBodySchema` enforces unique feature ids, at most one `subclass-choice`, and pairing of
`Class.spellcasting` with exactly one `kind: 'spellcasting'` feature.

Content add menus may carry **encoded validation transport** on disabled lines. Decode only in
[`to-acquisition-dropdown-item.ts`](../apps/dashboard/src/features/content/lib/acquisition/to-acquisition-dropdown-item.ts)
— see [validation-messages.md § Display boundaries](../packages/contracts/docs/validation-messages.md#display-boundaries).

## Adding a kind later

1. Add a metadata entry to `CLASS_FEATURE_KIND_ENTRIES` (ids and `CLASS_FEATURE_KINDS` derive from it).
2. Add a Zod variant (and restrict subclass host if needed).
3. Branch `resolveClassFeatureGrantGroups`.
4. Add a `CLASS_FEATURE_AUTHORING` entry.
5. Add aggregate rules when cardinality or pairing applies.
6. Update factories and seeds.
