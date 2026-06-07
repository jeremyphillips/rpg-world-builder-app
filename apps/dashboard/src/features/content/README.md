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
