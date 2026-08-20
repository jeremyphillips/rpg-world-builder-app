# content (dashboard feature)

World-building content the DM authors and reuses across campaigns. This is one
feature (one ESLint boundary element) made of several content-type sub-areas:

| Sub-area                                       | Responsibility                                      |
| ---------------------------------------------- | --------------------------------------------------- |
| [`species`](./species)                         | Playable species / ancestries                       |
| [`classes`](./classes)                         | Character classes                                   |
| [`spells`](./spells)                           | Spells and their descriptions                       |
| [`skill-proficiencies`](./skill-proficiencies) | Skills and proficiencies                            |
| [`equipment`](./equipment)                     | Unified equipment catalog (weapons, armor, gear, …) |
| [`locations`](./locations)                     | Places in the world (regions, sites, maps)          |
| [`monsters`](./monsters)                       | Monsters / statblock entries                        |

Sub-areas are folders inside this feature, not separate boundary elements, so
imports between them are unrestricted. Anything outside `content` must import
through this folder's `index.ts`.

Folder layout and the feature-boundary rule are documented in
[feature-structure.md](../../../docs/feature-structure.md) and
[feature-conventions](../../../docs/feature-conventions.md).

## `lib/`

Shared content UI and data helpers live under [`lib/`](./lib/) in concern
subfolders (see [feature-structure § Parent `content/lib/`](../../../docs/feature-structure.md#parent-contentlib-subfolders)).
Each sub-area also keeps domain UI config in its own `lib/` — overview table
column recipes (`*-overview-columns.tsx`, co-located stories) alongside stat-row
builders (`*-stat-rows.ts`).

```text
lib/
  fixtures/         # STORY_* IDs, pick*() catalog helpers
  forms/            # registry + key helpers; shells/, fields/, grants/ subfolders
  form-options/     # Level, rich-text link options
  overview/         # List shell, table config, source badge; hooks/ subfolder
  detail/           # page/, metadata/, section/, row/ — see feature-structure.md
  master-detail/    # Embedded array editor infra
  list/             # List API/query factories, content client
  entity/           # Entity anatomy; catalog/, disclosure/ surface splits
  relationship/     # Cross-content relationship UI; drawer/, list/, picker/, location-connection/
  campaign-access/  # Campaign availability; overview/ row chrome; bulk/ actions
  entity-replacement/  # Shared Current→New drawer chrome
  delete/           # Deletion blocked dialog + usage-blocked list
  demotion/         # Demotion blocked dialog
  duplication/      # Duplicate-content dialog
  usage/            # Entry usage references section
  utils/            # title-case, sortable-array-move, other small helpers
```

Root-level files are limited to cross-type vocabulary (`content-type-labels.ts`,
`labels.ts`) and the public entity facade (`content-entity-card.client.tsx`).

Catalog list
fetching for top-level content types (classes, species, weapons, etc.) is wired
through [`createContentListApi`](./lib/list/create-content-list.ts) and
[`createContentQueryHook`](./lib/list/create-content-list.ts) — each sub-area's
`api/*-api.ts` and `hooks/use-*.ts` pair delegates to those factories. Nested
resources (e.g. subclasses under a class) stay hand-written until a second
nested list pattern appears.

Create/update mutations use [`createContentMutationHooks`](./lib/list/use-content-mutations.ts)
the same way: each sub-area's `hooks/use-*.ts` exports aliased
`useCreate*` / `useUpdate*` hooks at module level. Generic create/edit shells
call [`useContentWriteMutation`](./lib/list/use-content-mutations.ts) with the
registered `ContentFormDef` (including optional `invalidateQueryKeys` — classes
also refresh skill proficiencies). [`locations/`](./locations) and future sub-areas
(`monsters/`) follow the same list + mutation factory pattern in their
`hooks/use-*.ts`.

Class [`FeatureItem`](./classes/lib/feature-item.tsx) rows render level + name headings inline
via local `featureHeading()` (no separate formatter module); stored feature
descriptions are body-only HTML (`<p>`, `<strong>` subsections).

## Tabbed create/edit forms

Class and species create/edit shells use [`TabbedForm`](../../../packages/ui/docs/forms.md)
when a `ContentFormDef` exposes `buildTabs`. Form `lib/` file naming, split
rules, and per-type alignment status:
[form-lib-conventions.md § Inventory](../../../docs/form-lib-conventions.md#content-catalog-inventory).
Other content types still use a single-page `<Form>`. See the TabbedForm validation note in `forms.md` if Save
fails without a visible error — check inactive tabs.

Detail and overview authoring controls (Edit, New, row actions) are gated by
[`useCanManageCampaign`](./campaign/hooks/use-can-manage-campaign.ts) — owner or
co-owner membership from `GET /api/campaigns`. Create/edit routes use
[`ContentAuthoringGate`](./lib/forms/shells/content-authoring-gate.tsx) for the same check.

## Master-detail abstraction

Campaign-derived inactive state (badges + alerts) →
[availability.md](../../../docs/availability.md).

Long embedded arrays (where each row is itself a heavy form) can render as a
list + detail editor instead of a tall stack, via shared, type-agnostic pieces:

| Piece                                                                                                        | Role                                                                                                                                                                                    |
| ------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [`useMasterDetailArray`](./lib/master-detail/use-master-detail-array.ts)                                     | Binds to a parent-form field array (`useFieldArray`); tracks selection (derived/clamped), delete-confirm flow, row reorder, and validation surfacing.                                   |
| [`MasterDetailListPanel`](./components/master-detail/master-detail-list-panel.client.tsx)                    | Sidebar: add button + selectable rows with optional eyebrow, status badge, per-row delete, and drag-to-reorder (keyboard-accessible handle).                                            |
| [`MasterDetailEditorPanel`](./components/master-detail/master-detail-editor-panel.client.tsx)                | Detail column: validation banner, selected row `FormItems`, or empty-selection hint.                                                                                                    |
| [`MasterDetailDeleteDialog`](./components/master-detail/master-detail-delete-dialog.client.tsx)              | Shared `ConfirmDialog` wrapper for row removal.                                                                                                                                         |
| [`MasterDetailValidationBanner`](./components/master-detail/master-detail-validation-banner.client.tsx)      | Post-submit alert when unselected list rows have validation errors.                                                                                                                     |
| [`buildEmbeddedMasterDetailListItem`](./lib/master-detail/build-embedded-master-detail-list-item.ts)         | Builds a list row with source badges and `deletable`.                                                                                                                                   |
| [`resolveEmbeddedRowMeta`](./lib/master-detail/resolve-embedded-row-meta.ts)                                 | Derives system/homebrew source, delete-lock, and badge set for embedded rows.                                                                                                           |
| [`isEmbeddedRowSystemLocked`](./lib/master-detail/is-embedded-row-system-locked.ts)                          | Shared delete-lock policy when embedded rows have no per-row `source`.                                                                                                                  |
| [`content-campaign-availability`](./lib/master-detail/content-campaign-availability.ts)                      | Shared row-key helpers for master-detail lists.                                                                                                                                         |
| [`FormEmbeddedMasterDetailEditor`](./components/master-detail/form-embedded-master-detail-editor.client.tsx) | Composite wiring for form-embedded arrays: list + detail + delete dialog over the parent form. Optional `leadingContent` for fields above the grid (uses `fieldGroupFlexStackClasses`). |

It is presentation-only over the parent form, so global save and validation are
unchanged. Use `FormEmbeddedMasterDetailEditor` for the standard traits/features
pattern. Pass `leadingContent` when a tab needs extra fields above the list (e.g.
species **Heritage** scalar header, classes **Character creation** choose count).
Compose the lower-level pieces directly only when you need layout that does not
fit this composite.

`useMasterDetailArray` resolves validation errors for nested dot paths (e.g.
`heritage.options`) so error badges and auto-select work on inner lists.

`FormEmbeddedMasterDetailEditor` defaults: sortable list, delete controls, and
System/Homebrew badges. Pass
`ContentFormCtx.embeddedSeedRowIds` (populated on edit via
`ContentFormDef.extractEmbeddedSeedRowIds`) so only seed rows lock on system
entities; newly added rows show Homebrew and remain deletable.

Scope notes:

- Embedded array rows (class features, species traits/heritage) inherit campaign
  access from their parent content type — no per-row campaign access UI yet.
- Subclass campaign access is persisted via the shared `ContentCampaignAccessModel`
  and edited in the subclass panel through `CampaignAccessSection` (availability +
  visibility, with availability-off blocker preflight). Top-level edit shells coordinate
  body + access dirty state through a unified save session — see
  [campaign-access/README.md](lib/campaign-access/README.md).

`ContentFormCtx.entitySource` (set by the create/edit shells) plus
`embeddedSeedRowIds` lets the editor derive per-row delete-locking when the
embedded element has no own `source` (e.g. protecting a system class's saved
features, starting equipment packages, species traits, or heritage options). The same
policy applies to subclasses via `isSubclassDeletable`
(`source === 'homebrew' || isDraftId`).
