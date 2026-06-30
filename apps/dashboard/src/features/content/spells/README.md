# content / spells

Spell catalog: overview table, detail pages, and create/edit authoring for system seed + homebrew spells. Part of the [`content`](../README.md) feature; see [feature-structure.md](../../../../docs/feature-structure.md) for layout.

## Scope

- **In:** list (`useSpells`), overview table (level/school filters), detail stat rows,
  HTML description, class links, tag chips, create/edit routes, form modules under
  `lib/spell-form-*.ts`, row actions.
- **Form:** tabbed shell (Basics / Casting / Tags); class availability via combobox
  (spellcasting classes only — see below); tag vocabularies via chips.

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

**Future polish:** Union orphan selected slugs into options with `getClassName` and
a description such as “Does not have spellcasting”.

## API

- `GET /api/campaigns/:campaignId/content/spells` → `{ spells: Spell[] }`
- `POST` / `PATCH` via shared content write endpoints (`spellWriteConfig`); system
  spells receive campaign overlay patches on edit.

## Key files

| Piece        | Path                       |
| ------------ | -------------------------- |
| Form def     | `lib/spell-form-def.ts`    |
| Form fields  | `lib/spell-form-fields.ts` |
| Form values  | `lib/spell-form-values.ts` |
| Form labels  | `lib/spell-form-labels.ts` |
| Create route | `routes/spell-create.tsx`  |
| Edit route   | `routes/spell-edit.tsx`    |

## Related docs

- [form-lib-conventions.md](../../../../docs/form-lib-conventions.md) — form module splits and inventory
