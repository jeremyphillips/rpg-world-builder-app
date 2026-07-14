# content / spells

Spell catalog: overview table, detail pages, and create/edit authoring for system seed + homebrew spells. Part of the [`content`](../README.md) feature; see [feature-structure.md](../../../../docs/feature-structure.md) for layout.

## Scope

- **In:** list (`useSpells`), overview table (level/school filters), detail stat rows,
  HTML description, optional cantrip scaling / higher-level slot effect prose,
  class links, tag chips, create/edit routes, form modules under
  `lib/spell-form-*.ts`, row actions.
- **Form:** tabbed shell (Basics / Casting / Resolution / Tags); class availability via
  combobox (spellcasting classes only — see below); tag vocabularies via chips.
- **Resolution (authoring only):** flattened target / method / range / damage /
  outcome preset editor; live preview via contract formatters; **not persisted**
  until `spell.resolution.persistence` lands.

### Class options

The **Classes** combobox uses `ctx.options.spellcastingClasses`: campaign-resolved
classes (system + overlay patches + homebrew) that have a `spellcasting` block.
Non-casters (Fighter, Barbarian, etc.) are omitted unless a patch or homebrew
record grants spellcasting.

API spell writes validate the same rule in the API spells feature
(`assert-spell-class-ids.ts`; `400 validation_error` when a slug is unknown or
lacks spellcasting).

**Orphan union gap (edit mode):** If a spell already lists a class that no longer
has spellcasting (e.g. a homebrew class edited to drop spellcasting), that slug is
**not** merged back into combobox options with a friendly label. The shared combobox
falls back to showing the raw slug as a removable chip until the user clears it.
Save is blocked by API validation until all invalid classes are removed.

**Future polish:** Union orphan selected slugs into options with `formatSlugAsLabel` and
a description such as “Does not have spellcasting”.

### Structured resolution (local authoring)

The **Resolution** tab authors an optional `resolution` envelope matching
`spellResolutionSchema` on the read model. Enablement is the presence of the
`resolution` object — **Add resolution** / **Remove resolution** — with no
parallel boolean flag.

| Concern        | Behavior                                                                 |
| -------------- | ------------------------------------------------------------------------ |
| Form shape     | Flattened `ResolutionFormValues` via `resolution-form-schema.ts`         |
| Normalization  | `resolutionToStored` in `resolution-form-values.ts`                      |
| Preview        | `SpellResolutionPreview` + `@rpg/contracts` resolution formatters        |
| Attack preset  | Melee/ranged method + `hit` / full damage + optional additional behavior |
| Save preset    | Saving throw + failed/full + successful/half from one damage entry       |
| Save           | **Disabled** — banner: "Resolution is not saved yet."                    |
| Legacy effects | Flat `effects[]` modules remain for catalog detail; tab replaced         |

Modules live under [`resolution/`](resolution/) (`resolution-form-fields.ts`,
`resolution-form-values.ts`, `components/spell-resolution-*.client.tsx`).

Shared roll/damage form atoms live under
[`content/lib/forms/mechanics/`](../../lib/forms/mechanics/) (`roll-value-fields`,
`damage-type-field`).

#### Persistence boundary (`spell.resolution.persistence`)

Create/update API input **omits** `resolution` today. `buildSpellCreateInput` strips
the field with a `TODO(spell.resolution.persistence)` comment alongside the existing
`effects` omission.

When persistence ships, touch these files:

| Layer       | File                                                                                        |
| ----------- | ------------------------------------------------------------------------------------------- |
| Contracts   | `packages/contracts/src/rpg/content/spell.ts` — merge `resolution` into create/update input |
| Form values | `lib/spell-form-values.ts` — remove omission; map `resolutionToStored`                      |
| Mongo model | `apps/api/.../homebrew-spell.model.ts` — `resolution: Mixed`                                |
| API mapper  | `apps/api/.../spells.config.ts` — `toHomebrewSpell`                                         |
| Patch merge | `apps/api/.../lib/deep-merge.ts` — object replace for `resolution`                          |

### Atomic effects (catalog read model)

Optional flat `effects[]` on the spell read model (`spellAtomicEffectSchema`) remains
for catalog seed data and spell detail display. Authoring UI for flat effects was
replaced by the Resolution tab; `effect-*` modules are unchanged for detail rendering
and future `spell.effect.persistence`.

### Scaling prose fields

Optional `cantripScaling` (level 0) and `higherLevelSlotEffect` (level 1–9) store
rich-text body prose for cantrip upgrades and upcast effects. Section headings
(`Cantrip Upgrade`, `Using a Higher-Level Spell Slot`) are display-owned in
`lib/spell-display.ts` — do not embed them in stored HTML.

## API

- `GET /api/campaigns/:campaignId/content/spells` → `{ spells: Spell[] }`
- `POST` / `PATCH` via shared content write endpoints (`spellWriteConfig`); system
  spells receive campaign overlay patches on edit.

## Key files

| Piece                     | Path                                                                                              |
| ------------------------- | ------------------------------------------------------------------------------------------------- |
| Display registry (detail) | `lib/spell-display.ts`                                                                            |
| Form def                  | `lib/spell-form-def.ts`                                                                           |
| Form fields               | `lib/spell-form-fields.ts`                                                                        |
| Form values               | `lib/spell-form-values.ts`                                                                        |
| Form labels               | `lib/spell-form-labels.ts`                                                                        |
| Resolution form fields    | `resolution/lib/resolution-form-fields.ts`                                                        |
| Resolution form values    | `resolution/lib/resolution-form-values.ts`                                                        |
| Resolution preview/editor | `resolution/components/spell-resolution-preview.client.tsx`, `spell-resolution-editor.client.tsx` |
| Effect display (detail)   | `lib/effect-display.ts`                                                                           |
| Effects editor (stories)  | `components/spell-effects-editor.client.tsx`                                                      |
| Seed effects audit        | `packages/catalog/src/spells/spell-effects-coverage-inventory.ts`                                 |
| Create route              | `routes/spell-create.tsx`                                                                         |
| Edit route                | `routes/spell-edit.tsx`                                                                           |

## Related docs

- [form-lib-conventions.md](../../../../docs/form-lib-conventions.md) — form module splits and inventory
