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

Detail and overview authoring controls (Edit, New, row actions) are gated by
[`useCanManageCampaign`](./campaign/hooks/use-can-manage-campaign.ts) — owner or
co-owner membership from `GET /api/campaigns`. Create/edit routes use
[`ContentAuthoringGate`](./lib/content-authoring-gate.tsx) for the same check.

## Master-detail abstraction

Long embedded arrays (where each row is itself a heavy form) can render as a
list + detail editor instead of a tall stack, via shared, type-agnostic pieces:

| Piece                                                                             | Role                                                                                                                  |
| --------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| [`useMasterDetailArray`](./lib/use-master-detail-array.ts)                        | Binds to a parent-form field array (`useFieldArray`); tracks selection (derived/clamped) and the delete-confirm flow. |
| [`MasterDetailListPanel`](./components/master-detail-list-panel.client.tsx)       | Sidebar: add button + selectable rows with optional eyebrow, status badge, and per-row delete control.                |
| [`MasterDetailDeleteDialog`](./components/master-detail-delete-dialog.client.tsx) | Shared `ConfirmDialog` wrapper for row removal.                                                                       |

It is presentation-only over the parent form, so global save and validation are
unchanged. The detail panel is caller-owned (typically `FormItems` for the
selected row). Consumers: the classes **Features** tab and the species **Traits**
tab. Species heritage choices remain on the inline array renderer (two-level
nesting is deferred).

Scope notes:

- The existing classes **Subclasses** tab predates this abstraction and is
  **not** migrated yet (it manages a separate API resource with its own
  drafts/active state). Migrating it is a follow-up.
- **Active in campaign** is a planned capability but has no home in this
  abstraction yet: per-row availability needs a contract + persistence target
  (subclasses have `subclassCampaignAvailabilitySchema`; embedded rows like
  class features do not). The detail panel is the intended attachment point,
  with the list item `badge` slot surfacing an "Inactive" marker.

`ContentFormCtx.entitySource` (set by the create/edit shells) lets a consumer
derive per-row delete-locking when the embedded element has no own `source`
(e.g. protecting a system class's saved features or a system species's saved
traits). The same policy applies to subclasses via `isSubclassDeletable`
(`source === 'homebrew' || isDraftId`).
