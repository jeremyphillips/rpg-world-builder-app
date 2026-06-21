# content (dashboard feature)

> Scaffold only — no implementation yet.

World-building content the DM authors and reuses across campaigns. This is one
feature (one ESLint boundary element) made of several content-type sub-areas:

| Sub-area                                     | Responsibility                             |
| -------------------------------------------- | ------------------------------------------ |
| [`species`](./species)                       | Playable species / ancestries              |
| [`classes`](./classes)                       | Character classes                          |
| [`spells`](./spells)                         | Spells and their descriptions              |
| [`skillProficiencies`](./skillProficiencies) | Skills and proficiencies                   |
| [`equipment`](./equipment)                   | Weapons, armor, gear, magic items          |
| [`locations`](./locations)                   | Places in the world (regions, sites, maps) |
| [`monsters`](./monsters)                     | Monsters / statblock entries               |

Sub-areas are folders inside this feature, not separate boundary elements, so
imports between them are unrestricted. Anything outside `content` must import
through this folder's `index.ts`.

Folder layout and the feature-boundary rule are documented in
[feature-conventions](../../../docs/feature-conventions.md).

## `lib/`

Shared content UI and data helpers live under [`lib/`](./lib/). Catalog list
fetching for top-level content types (classes, species, weapons, etc.) is wired
through [`createContentListApi`](./lib/create-content-list.ts) and
[`createContentQueryHook`](./lib/create-content-list.ts) — each sub-area's
`api/*-api.ts` and `hooks/use-*.ts` pair delegates to those factories. Nested
resources (e.g. subclasses under a class) stay hand-written until a second
nested list pattern appears.

Class and subclass [`FeatureItem`](./lib/feature-item.tsx) rows compose SRD-style
headings at render time via [`formatFeatureHtml`](./lib/format-feature-html.ts);
stored feature descriptions are body-only HTML (`<p>`, `<strong>` subsections).

## Tabbed create/edit forms

Class and species create/edit shells use [`TabbedForm`](../../../packages/ui/docs/forms.md)
when a `ContentFormDef` exposes `buildTabs`. Other content types still use a
single-page `<Form>`. See the TabbedForm validation note in `forms.md` if Save
fails without a visible error — check inactive tabs.
