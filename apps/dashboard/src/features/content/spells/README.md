# content / spells

Spell catalog: overview table, detail pages, and create/edit authoring for system seed + homebrew spells. Part of the [`content`](../README.md) feature; see [feature-conventions](../../../../docs/feature-conventions.md) for layout.

## Scope

- **In:** list (`useSpells`), overview table (level/school filters), detail stat rows,
  HTML description, class links, tag chips, create/edit routes, `spell-form-def.ts`,
  row actions.
- **Form:** tabbed shell (Basics / Casting / Tags); class availability via combobox;
  tag vocabularies via chips.

## API

- `GET /api/campaigns/:campaignId/content/spells` → `{ spells: Spell[] }`
- `POST` / `PATCH` via shared content write endpoints (`spellWriteConfig`); system
  spells receive campaign overlay patches on edit.

## Key files

| Piece         | Path                              |
| ------------- | --------------------------------- |
| Form def      | `lib/spell-form-def.ts`           |
| Field helpers | `lib/spell-form-field-helpers.ts` |
| Create route  | `routes/spell-create.tsx`         |
| Edit route    | `routes/spell-edit.tsx`           |
