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

Canonical production: [`LocationChildrenSection`](../../locations/components/hierarchy/location-children-section.client.tsx)
(story: `locations/components/hierarchy/location-children-section.stories.tsx`).

## Relationship collection body

Typed-edge sections use `RelationshipList` inside the same panel shell:

```text
RelationshipList.Root
└── RelationshipList.Group
    └── RelationshipList.Row
        └── CrossContentRelationshipRow
            └── DetailEntityRow
```

Canonical production:

- [`OrganizationMembersSection`](../../organizations/components/members/organization-members-section.client.tsx)
- [`LocationPeopleAndOrganizationsSection`](../../locations/components/connected-parties/location-people-and-organizations-section.client.tsx)
- [`OrganizationLocationConnectionsSection`](../../organizations/components/location-connections/organization-location-connections-section.client.tsx)

Organizations stay **Relationship-first** — do not re-scaffold them onto
`DetailCollectionGroup` / `DetailCollectionRowList` for parity with Locations.

## Shared collection-body chrome (style contract)

[`collection/detail-collection-chrome.variants.ts`](collection/detail-collection-chrome.variants.ts)
exports group header layout and record list separators. Both grouped collection body
and `RelationshipList.Group` import this file — an explicit cross-grammar contract,
not accidental DRY through private component variants.

`RelationshipList` must **not** import `detail-collection-group.variants.ts` or
`detail-collection-row-list.variants.ts` directly.

## Entity row grammar (separate)

```text
DetailEntityRow
└── EntityAnatomy
    ├── optional disclosure
    └── trailing (EntityAnatomyTrailing)
```

Companion primitives (composed by features, not imported by `DetailEntityRow` itself):

| Primitive                | Role                                                                                                        |
| ------------------------ | ----------------------------------------------------------------------------------------------------------- |
| `DetailEntityRowActions` | Layout-only trailing control cluster                                                                        |
| `DetailOverflowMenu`     | Detail-surface compact overflow menu ([`detail-overflow-menu.client.tsx`](detail-overflow-menu.client.tsx)) |

`DetailOverflowMenu` also appears on `ContentEntityCard` in building-orgs create — a
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
Runtime companions (`*.client.tsx`, `*.variants.ts`, …) stay directly visible beside their
semantic owner. Tests and stories move into `__tests__/` and `__stories__/` so the production
hierarchy is easier to scan at a glance.

This is currently a **DetailCollection-local** convention. Do not copy it elsewhere without
evaluating the pilot — global feature-structure docs are unchanged.

## Admission

Use `DetailCollectionPanel` when the primary body is a collection/list of related
records or entities (optionally divided into semantic groups).

**Do not use for:** prose blocks, stat/metadata rows, forms, metric grids,
single-value fields, arbitrary card layouts, spell-resolution slot editors.

## Do not build another…

- No generic `DetailSection` or universal `ContentDetailSection`
- No wrapper over `DetailCollectionPanel` that only re-exposes its props
- No feature-local copy of Group/RowList layout anatomy
- No moving `EntityAnatomy` ownership into `collection/`
- No forcing RelationshipList surfaces through `DetailCollectionGroup` / `DetailCollectionRowList`

## Guards

[`detail-collection-grammar.guard.test.ts`](detail-collection-grammar.guard.test.ts) —
typed-edge relationship sections use `RelationshipList` for subgroup/list anatomy, not
grouped collection body components.
