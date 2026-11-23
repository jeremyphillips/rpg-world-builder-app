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

- Add menu: Custom feature, ASI, Subclass (`ClassFeatureAddMenu`).
- Spellcasting rows are created only from the Spellcasting tab (`reconcileSpellcastingOnEnable`).
- Per-kind form fields and list `kindLabel` are centralized in `class-feature-authoring.ts` and
  `class-feature-form-fields.ts`.

## Validation

`classStoredBodySchema` enforces unique feature ids, at most one `subclass-choice`, and pairing of
`Class.spellcasting` with exactly one `kind: 'spellcasting'` feature.

## Adding a kind later

1. Add the literal to `CLASS_FEATURE_KINDS`.
2. Add a Zod variant (and restrict subclass host if needed).
3. Branch `resolveClassFeatureGrantGroups`.
4. Add a `CLASS_FEATURE_AUTHORING` entry.
5. Add aggregate rules when cardinality or pairing applies.
6. Update factories and seeds.
