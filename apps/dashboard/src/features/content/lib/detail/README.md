# Detail surface composition (`content/lib/detail`)

Shared presentation for **collection-oriented** detail regions on catalog read routes.
Not a universal wrapper for all detail content — see [Admission](#admission) and
[Do not build another…](#do-not-build-another).

Deeper relationship policy: [cross-content-relationship-ui.md](../../../../docs/cross-content-relationship-ui.md).
Page shell and stat rows live in sibling folders (`page/`, `metadata/`).

## Collection container — `DetailCollectionPanel`

Reusable outer chrome when a detail surface is a headed container whose primary body
is a collection or list of related records/entities:

```text
DetailCollectionPanel
├── heading / headingId / helper / headingAs
├── optional action (panel-header control)
└── collection body  ← grammar chosen by domain
```

The panel does **not** require `DetailCollectionGroup` or `DetailCollectionRowList`
children. Pick one collection-body grammar below.

## Grouped collection body

Location-validated today; domain-neutral primitives (`collection/group/detail-collection-group.*`,
`collection/row-list/detail-collection-row-list.*`):

```text
DetailCollectionGroup
└── DetailCollectionRowList
    └── domain row
        └── DetailEntityRow
```

Canonical production: [`LocationChildrenSection`](../../locations/components/hierarchy/location-children-section.tsx)
(story: `locations/components/hierarchy/location-children-section.stories.tsx`).

## Relationship collection body

Typed-edge sections use `EntityRowList` inside the same panel shell:

```text
EntityRowList.Root
└── EntityRowList.Group
    └── EntityRowList.Row
        └── EntityRowList.Row
            └── DetailEntityRow
```

Canonical production:

- [`OrganizationMembersSection`](../../organizations/components/members/organization-members-section.tsx)
- [`LocationPeopleAndOrganizationsSection`](../../locations/components/connected-parties/location-people-and-organizations-section.tsx)
- [`OrganizationLocationConnectionsSection`](../../organizations/components/location-connections/organization-location-connections-section.tsx)

Organizations stay **Relationship-first** — do not re-scaffold them onto
`DetailCollectionGroup` / `DetailCollectionRowList` for parity with Locations.

## Shared collection-body chrome (style contract)

[`collection/detail-collection-chrome.variants.ts`](collection/detail-collection-chrome.variants.ts)
exports group header layout and record list separators. Both grouped collection body
and `EntityRowList.Group` import this file — an explicit cross-grammar contract,
not accidental DRY through private component variants.

`EntityRowList` must **not** copy `DetailCollectionGroup` body classes or import
`detail-collection-row-list.variants.ts` directly.

## Entity row grammar (separate)

```text
DetailEntityRow
└── EntityAnatomy
    ├── optional leadingMedia (ReactNode — project domain art upstream)
    ├── optional disclosure
    └── trailing (EntityAnatomyTrailing)
```

`EntityRowList.Row` forwards the same **`leadingMedia`** contract. Do not pass
`ContentDisplayImage` into list rows — use `buildEntitySurfaceLeadingMediaNode` or
`DetailRowLeadingMedia` in feature projection code first.

**Geometry rule:** pass **fill-only** projected media (`anatomyFill` via
`projectEntitySurfaceIdentityToSummaryModel`) or a pre-wrapped
[`DetailRowLeadingMedia`](row/detail-row-leading-media.tsx) / avatar shell.
[`EntityAnatomy`](../../entity/anatomy/entity-anatomy.tsx) applies the density-owned
`.ui-anatomy-leading-media` shell (`--ui-anatomy-leading-size`: 40px compact/comfortable,
60px spacious) when the node is not already shell-owned. Search `startSlot` rows wrap with
`DetailRowLeadingMedia` directly. Fixed `size` on `DetailRowLeadingMedia` is for non-anatomy
exceptions only. User avatars: [`DetailRowLeadingAvatar`](row/detail-row-leading-avatar.tsx).

Companion primitives (composed by features, not imported by `DetailEntityRow` itself):

| Primitive                | Role                                                                                          |
| ------------------------ | --------------------------------------------------------------------------------------------- |
| `DetailEntityRowActions` | Layout-only trailing control cluster                                                          |
| `DetailOverflowMenu`     | Detail-surface compact overflow menu ([`detail-overflow-menu.tsx`](detail-overflow-menu.tsx)) |

`DetailOverflowMenu` also appears on `EntityCardStaticRenderer` in building-orgs create — a
documented cross-surface reuse of detail overflow chrome, not entity-surface ownership.

## Folder layout

```text
detail/
  detail-overflow-menu.*
  detail-collection-grammar.guard.test.ts
  collection/
    detail-collection-chrome.variants.ts
    panel/
      detail-collection-panel.*
      __tests__/
      __stories__/
    group/
      detail-collection-group.*
      __tests__/
      __stories__/
    row-list/
      detail-collection-row-list.*
      __tests__/
      __stories__/
  row/entity/
    detail-entity-row.*
    detail-entity-row-actions.*
  page/       # detail page shell — not collection grammar
  metadata/   # stat rows — not collection grammar
```

### Artifact subfolder pilot (DetailCollection only)

`DetailCollection` is piloting artifact subfolders under `collection/{panel,group,row-list}/`.
Runtime companions (`*.tsx`, `*.variants.ts`, …) stay directly visible beside their
semantic owner. Tests and stories move into `__tests__/` and `__stories__/` so the production
hierarchy is easier to scan at a glance.

This is currently a **DetailCollection-local** convention. Do not copy it elsewhere without
evaluating the pilot — global feature-structure docs are unchanged.

## Admission

Use `DetailCollectionPanel` when the primary body is a collection/list of related
records or entities (optionally divided into semantic groups).

Use [`ContentDetailSection`](page/content-detail-section.tsx) on **catalog detail**
routes for headed body regions (prose, lists, tables, relationship rosters). It
defaults to subtle header + faint body and registers with the layout scroll-spy nav.

**Composition path:** one section shell + one content primitive (`ContentStatList`,
`RichTextContent` with [`contentDetailProseProps`](page/content-detail-prose.ts),
domain tables, badge lists, …). Navigable flush item stacks share
[`DetailNavFlushStack`](collection/item-stack/detail-nav-flush-stack.tsx) — not a
section wrapper; the parent owns heading, empty hide, and loading.

- Array item headings: `ContentDetailSectionItem` (`Heading variant="group"`, `as="h3"`).
- Detail HTML: spread `contentDetailProseProps` (`size: 'sm'`; default tone).
- Class proficiencies: [`ClassProficienciesSection`](../../classes/components/detail/class-proficiencies-section.tsx) owns the sole proficiencies `ContentDetailSection`. Granted and choice groups are subheadings without anchors.
- Monster **Details** metadata: `ContentStatList` inside the Details section. The section heading is the nav target. Metadata rows are not anchors.

**Do not use `DetailCollectionPanel` directly for:** prose blocks, stat/metadata rows,
forms, metric grids, single-value fields, arbitrary card layouts — prefer
`ContentDetailSection` on detail routes.

## Do not build another…

- No feature-local copy of `ContentDetailSection` props without domain reason
- No wrapper over `DetailCollectionPanel` that only re-exposes its props
- No feature-local copy of Group/RowList layout anatomy
- No moving `EntityAnatomy` ownership into `collection/`
- No forcing EntityRowList surfaces through `DetailCollectionGroup` / `DetailCollectionRowList`

## Guards

[`detail-collection-grammar.guard.test.ts`](detail-collection-grammar.guard.test.ts) —
typed-edge relationship sections use `EntityRowList` for subgroup/list anatomy, not
grouped collection body components.
