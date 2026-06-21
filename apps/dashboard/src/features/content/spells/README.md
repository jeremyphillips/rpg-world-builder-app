# content / spells

Read-only spell catalog: overview table and detail pages for system seed + homebrew
spells. Part of the [`content`](../README.md) feature; see
[feature-conventions](../../../../docs/feature-conventions.md) for layout.

## Scope

- **In:** list (`useSpells`), overview table (level/school filters), detail stat rows,
  HTML description, class links, tag chips.
- **Out (deferred):** create/edit routes, `spell-form-def.ts`, row actions.

## API

`GET /api/campaigns/:campaignId/content/spells` → `{ spells: Spell[] }`

Write endpoints (`POST`/`PATCH`) are registered via `spellWriteConfig` but have no
dashboard UI in this pass.
