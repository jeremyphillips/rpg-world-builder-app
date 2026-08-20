# Cross-content relationship UI

Dashboard surfaces that show **typed edges** between catalog entities (organization ↔ location, character ↔ location, …) share presentation primitives under `apps/dashboard/src/features/content/lib/relationship/`. Domain copy, eligibility, and mutations stay in feature modules.

## Entity vs edge

| Surface                                        | Primitive                                                                   | Example                        |
| ---------------------------------------------- | --------------------------------------------------------------------------- | ------------------------------ |
| Pick an entity in a drawer                     | Embedded `EntityItem` or `DisclosureEntityCard` + catalog selection actions | Choose an organization to link |
| Show a persisted relationship on a detail page | `CrossContentRelationshipRow`                                               | The Monarchy                   |

Do **not** use `ContentEntityCard` as the default relationship row. Kind labels belong in slot/collection headings or optional row classification — not as entity badges duplicating the slot.

## Cardinality: dedupe vs UI slots

Two independent concepts must not be conflated:

| Concept                                                    | Meaning                                                          | Drives                                   |
| ---------------------------------------------------------- | ---------------------------------------------------------------- | ---------------------------------------- |
| **Per-subject dedupe** (per org + location + kind)         | One subject cannot link the same kind twice to the same location | Edge validation, picker disabled reasons |
| **Target-global slot** (`maxSubjectsPerLocation` in vocab) | At most N subjects of this kind at one location across all orgs  | **Location-detail singleton slots only** |

| Kind                              | `maxSubjectsPerLocation` | Location detail | Organization detail |
| --------------------------------- | ------------------------ | --------------- | ------------------- |
| `governs`, `controls`             | 1                        | Singleton slot  | Collection          |
| `claims`                          | unlimited                | Collection      | Collection          |
| Site / presence / character kinds | null                     | Collection      | Collection          |

Only `maxSubjectsPerLocation === 1` on the **fixed location endpoint** creates a singleton slot (Territorial Authority governs/controls). Organization forward always uses **family → kind → collection**, even for territorial kinds.

## Populated row anatomy

Default populated row:

```text
[entity title]                                      [⋯]
```

`CrossContentRelationshipRow` accepts optional **`description`** when the feature decides disambiguation helps. Shared code must **not** auto-derive generic entity-type labels ("Organization", "Location", …).

Compact list presentation — no card border/background on relationship rows. Row chrome uses compact action density (`Button density="compact"` on overflow triggers and inline add actions).

### Entity summary field mapping (detail / relationship lane)

Detail and relationship rows compose **`EntityItem`** (via `DetailEntityRow` or embedded `EntityItemAnatomy`) using the shared **`EntitySummaryModel`** vocabulary:

| Row / drawer prop                              | Entity summary field | Notes                                                               |
| ---------------------------------------------- | -------------------- | ------------------------------------------------------------------- |
| `heading` / `title`                            | `heading`            | Entity name                                                         |
| `headingSuffix` / `classification`             | `classification`     | Inline muted kind/context after the title (may include leading `·`) |
| `description` / `secondaryText` / `subheading` | `description`        | Second-line disambiguation (e.g. Located in …)                      |
| `status` / `badge` / `metadata`                | `status`             | Trailing metadata such as availability badges                       |

`RelationshipList.Row` and `CrossContentRelationshipRow` map these props internally — features should prefer `classification`, `description`, and `status` on new call sites. Navigation (`href`) stays on the surface, not the model.

## Detail section layout

Shared detail-page panel and row chrome live in [`content/lib/detail/`](../src/features/content/lib/detail/) (`section/` + `row/`). Relationship and hierarchy sections **compose** these primitives — they do not duplicate panel shells. Catalog read routes use `detail/page/` and `detail/metadata/`.

### Heading vs eyebrow vs row title

| Role                | Element                                  | Visual                                                     | Examples                                 |
| ------------------- | ---------------------------------------- | ---------------------------------------------------------- | ---------------------------------------- |
| Panel heading       | `Heading variant="label"` (`h2`/`h3`)    | `heading-style-label` — larger, not uppercase              | City structure, Territorial Authority    |
| Eyebrow group label | `<Eyebrow size="sm">` (default `as="p"`) | `eyebrow-style-sm` + muted; CSS uppercases title-case copy | Districts, Direct locations, Governed by |
| Row / item title    | `EntityItem` inside `DetailEntityRow`    | normal emphasis                                            | Dock Ward, org name                      |

Do **not** use `Text variant="emphasis"` or raw `uppercase tracking-*` for detail subgroup labels. Do **not** promote subgroup labels to `h3` unless Territorial Authority kind labels also become headings — today they stay out of the document outline.

### Primitives

| Primitive                | Role                                                                                                                                                                                                               |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `DetailSectionPanel`     | Bordered section shell (`<section aria-labelledby>`), title/helper, optional `headerEndSlot`                                                                                                                       |
| `DetailSectionGroup`     | Subgroup shell: optional `<Eyebrow size="sm">` + `px-4 py-2` + inter-group `border-b`; optional `endSlot` for trailing header controls                                                                             |
| `DetailSectionRowList`   | Dividers between direct children — required `separator`: `structural` (hierarchy) or `record` (relationship group `<ul>`)                                                                                          |
| `DetailEntityRow`        | Thin shell around compact `EntityItem` (`py-1` inset); default `inset="self"` adds `px-4`; use `inset="parent"` inside `DetailSectionGroup`; optional `disclosure` (`expandable` or `reserved`); generic `endSlot` |
| `DetailEntityRowActions` | Layout-only trailing control cluster (alignment / gap / shrink) — compose inside `endSlot` when a row needs utility + overflow; does not restyle children                                                          |
| `DetailOverflowMenu`     | Compact ghost icon trigger + dropdown over `{ id, label, destructive?, onSelect }[]`                                                                                                                               |
| `RelationshipList`       | **Only supported typed-edge list chrome** — compound `Root` → `Group` → `Row` (required nesting); owns record separators, slot/section empty, and footer placement via explicit `itemCount` props                  |

Primitive APIs must stay presentation-only — no relationship kinds, hierarchy semantics, or mutation builders in props. Features supply plain labels, hrefs, slots, and pre-built action arrays.

`DetailEntityRow.endSlot` and section `headerEndSlot` are **detail-host** composition
seams — not entity-surface trailing APIs. `EntityItem`, `ContentEntityCard`, and
`DisclosureEntityCard` use semantic trailing (`action` | `indicator` | `group`) only.
See [content-entity-card.md](./content-entity-card.md#trailing-kinds).

Use **`DetailSectionPanel`** + **`RelationshipList`** for typed-edge relationship sections (location Territorial Authority, People & organizations, organization forward family groups, organization Members). Use **`DetailSectionPanel`** + **`DetailSectionGroup`** + **`DetailSectionRowList`** for hierarchy (City structure districts / direct places) — not `RelationshipList`.

```text
┌ DetailSectionPanel (<section aria-labelledby>, rounded-md border border-border-subtle) ─┐
│ Header (bg-card px-4 py-2) — Heading variant="label", helper, optional headerEndSlot    │
├ Body (bg-surface-subtle) ──────────────────────────────────────────────────────────────┤
│ DetailSectionGroup (px-4 py-2, border-b between groups)                                 │
│   optional Eyebrow size="sm" + row content (no chrome when label omitted)               │
│ DetailSectionGroup …                                                                    │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

| When                                                                           | Header owner                                                                             | Notes                                                                                                           |
| ------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| Location inverse section (`territorial_authority`, `people_and_organizations`) | `DetailSectionPanel`                                                                     | Skip `LocationConnectedPartiesSectionHeader`; panel owns `<section aria-labelledby>` — no outer section wrapper |
| Organization forward family                                                    | `DetailSectionPanel` (`headingAs="h3"`)                                                  | Family panels only — no top-level section heading, helper, or count                                             |
| Single-kind or non-grouped surfaces                                            | Feature section header                                                                   | Bare row primitives only                                                                                        |
| Location hierarchy (Contained locations / City structure)                      | `DetailSectionPanel` + `DetailSectionGroup` + `DetailSectionRowList` + `DetailEntityRow` | Not a typed-edge relationship — same panel/group/row chrome, hierarchy domain stays in feature code             |

Kind labels inside a relationship panel use **`RelationshipList.Group`** `label` when `kindHeading: 'show'` — not nested `Heading variant="label"` blocks or `space-y-*` slot wrappers. Omit `label` entirely when the section heading is sufficient. Hierarchy sections pass the same labels through **`DetailSectionGroup`** `label` directly.

### RelationshipList (typed-edge lists)

Required nesting: **`RelationshipList.Root` → `RelationshipList.Group` → `RelationshipList.Row`**. Root never wraps rows automatically — use an explicit unlabeled `Group` when the section has no subgroup labels (Members roster).

| Prop / node                     | Drives                                                                                |
| ------------------------------- | ------------------------------------------------------------------------------------- |
| Root `itemCount === 0`          | Section `Empty` (+ optional `action`) — no `Footer`                                   |
| Root `itemCount > 0` + `action` | Populated groups + edge-to-edge `Footer`                                              |
| Group `itemCount === 0`         | Inline slot empty (`emptyLabel`) — no `<ul>`; optional `headerAction` in group header |
| Group `itemCount > 0`           | Record-separated `<ul>` + `Row` children                                              |

**Divider ownership** (single owner per boundary):

| Boundary                   | Owner                | Mechanism                                                 |
| -------------------------- | -------------------- | --------------------------------------------------------- |
| Row → row within a group   | Group `<ul>`         | Record separators (`[&>li+li]:border-t`)                  |
| Group → group              | Subsequent `Group`   | Structural `border-t` — not `border-b` on preceding group |
| Populated content → footer | `Footer` only        | Structural `border-t` on footer wrapper                   |
| Section header → body      | `DetailSectionPanel` | Unchanged panel header `border-b`                         |

`RelationshipList.Row` delegates populated anatomy to **`CrossContentRelationshipRow`** via a typed `menu` contract. Features supply semantic content (`itemCount`, labels, row data, menu items, handlers) — not spacing, borders, empty placement, or footer placement.

Do **not** hand-roll `ul.space-y-1`, `DetailSectionGroup`, or direct `CrossContentRelationshipRow` in typed-edge relationship section components. Slot-level hand-built editors (spell resolution slots) remain exceptions documented elsewhere.

### Organization→location compact rows

Org forward location targets compose [`LocationEntitySummaryVm`](../src/features/content/locations/lib/location-display.ts) in the organization feature, then map to neutral `CrossContentRelationshipRow` props:

```text
{name link} · {classification}
Located in {nearest direct parent}
```

- Classification renders via `headingSuffix` **outside** the entity link (same contract as contained locations).
- Nearest-parent context uses the last ancestry segment only — not full `ancestry.text`.
- Pickers may still show fuller classification + ancestry for disambiguation; drawer **Current** and **DrawerContext** use compact name · classification + `Located in {nearestParent}` via [`buildLocationEntityContextPresentation`](../src/features/content/locations/lib/location-display.ts).

### Mixed PC/NPC character rows

Undifferentiated character collections (location People & organizations character rows, location character pickers, organization Members roster, global search `typeLabel`) compose [`CharacterEntitySummaryVm`](../src/features/character/lib/display/character-entity-summary.lib.ts) and project mixed identity via `formatCharacterInlineSummary(vm, { includeCharacterType: true })`:

```text
{name link} · PC · Dwarf · Level 1 Fighter
```

- `identitySummary` stays type-free; PC/NPC belongs to the mixed projection helper, not the VM.
- Transport-only sources omit `parts` — never synthesize empty structured parts when only `{ summary }` is known.
- Global search uses `getCharacterTypeLabel` in the established `typeLabel` slot; `secondary` remains identity-only.
- `DetailEntityRow` keeps the entity name non-shrinking; long suffix metadata truncates first so overflow menus stay visible.

Homogeneous PC-only / NPC-only rosters and grouped PC/NPC sections do **not** repeat type on every row when surrounding chrome already communicates the distinction.

### Optional row disclosure

`DetailEntityRow` accepts an optional discriminated `disclosure` prop for one-level expand previews and alignment (City structure district rows today):

```ts
type DetailEntityRowDisclosure =
  | { mode: 'expandable'; label: string; content: ReactNode }
  | { mode: 'reserved' }
```

| Mode / concern       | Owner                                                                                                  |
| -------------------- | ------------------------------------------------------------------------------------------------------ |
| `expandable`         | Interactive chevron + expanded inset (`Show …` / `Hide …` from semantic `label`)                       |
| `reserved`           | Same outer disclosure-item wrapper + leading column tokens; inert empty gutter — no chevron, no region |
| omitted              | Ordinary single-root row — no leading gutter (Direct locations / relationship rows unchanged)          |
| Title navigation     | Entity `href` link — independent from disclosure                                                       |
| Overflow / utility   | Parent-row `endSlot` only — compose via `DetailEntityRowActions` when both are present                 |
| Nested preview inset | **Expanded region only** — features supply `content` without `pl-*` or disclosure-specific inset props |
| List separators      | Parent `DetailSectionRowList` — disclosure wraps parent identity + expanded body as **one** list child |

Both disclosure modes share the same chrome CSS variables; features must not recreate gutter padding locally.

Group-level disclosure (e.g. collapsing the entire `DISTRICTS · N` block) is a **separate** future capability on `DetailSectionGroup` — not part of row disclosure and not an `endSlot` responsibility.

### Row trailing controls

```text
[disclosure?] [identity / metadata] [DetailEntityRowActions: utility? overflow?]
```

| Concern                      | Owner                                                                                 |
| ---------------------------- | ------------------------------------------------------------------------------------- |
| Where trailing controls live | `DetailEntityRow.endSlot` (omit entirely when no controls — no phantom gutter)        |
| How multiple controls align  | `DetailEntityRowActions` (gap / align / shrink only)                                  |
| Primary utility              | Feature — high-frequency contextual action (District icon `+` → Add location chooser) |
| Overflow                     | `DetailOverflowMenu` — management / secondary actions                                 |
| Control chrome               | Each primitive (`ghost` + `icon` + `compact` for icon buttons) — not the cluster      |

Relationship rows opt in only when product semantics warrant a utility action. `CrossContentRelationshipRow`:

- `endSlot === undefined` → convenience overflow from `actions`
- `endSlot === null` → no trailing controls
- `endSlot={node}` → use as-is (compose `DetailEntityRowActions` when needed)

City structure District rows: icon `LocationAddChildMenu` (`appearance="icon"`, required `triggerLabel`, optional `menuHeading` like `Add to ${name}`) + overflow, launching contained create with the **district** as `parentLocationId`. Features must not recreate trailing icon spacing locally.

### Group action placement

**Relationship action placement follows group structure, not empty state.**

```text
Labeled group (genuine eyebrow)
EYEBROW                                      + action
content / empty copy

Unlabeled group (no meaningful subgroup label)
empty copy   + action        (empty)
rows… then   + action        (populated — same content-level row)
```

| Group structure                                          | Action owner                                                                           | Examples                                                        |
| -------------------------------------------------------- | -------------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| Labeled group (`meaningful_slots`, structural subgroups) | `RelationshipList.Group` `headerAction` (empty slots) or persistent header when needed | Governed by, Controlled by, Claimed by                          |
| Unlabeled group (`sparse_groups` family-level add)       | Root `action` → populated `Footer`; Root `Empty` when section wholly empty             | People & organizations, org forward family adds, Members roster |
| Panel-scoped action (no internal grouping)               | `DetailSectionPanel.headerEndSlot`                                                     | Flat Contained locations                                        |
| Row-scoped action                                        | `RelationshipList.Row` `menu` / row overflow                                           | All populated typed-edge rows                                   |

Rules:

- **Empty and populated states do not move the group's primary action.** A 0..1 group's header
  action disappears at capacity (availability, not placement); mutation of the existing edge stays
  in the row overflow.
- Do not manufacture a synthetic eyebrow (for example `RELATIONSHIPS`) to force an unlabeled
  section into the labeled layout.
- **`RelationshipList` owns empty copy, footer add, and slot-empty placement** — features pass
  `itemCount`, `emptyLabel`, and typed `action` / `headerAction` only.
- One Add chrome everywhere: `Button variant="ghost" size="sm" density="compact"` + Lucide `Plus`
  - feature-owned label. No literal `+ ` text prefixes.
- Horizontal inset/measure is owned by the detail primitives (`DetailSectionGroup` `px-4`, page
  `max-w-narrow-content`). Features must not position actions with local `max-w-*`, margins, or
  padding wrappers.

### Subgroup header actions

`DetailSectionGroup` accepts optional `endSlot` for trailing header controls (panel headers use `headerEndSlot`). The primitive is presentation-only — features own eligibility and action semantics.

When a detail section explicitly partitions children into structural groups, creation actions belong on the group that owns the destination rather than a generic panel-level action.

City structure uses two subgroup header actions from one canonical eligibility pass (`childAuthoringTypesForParentKind` → `resolveStructureChildAuthoringOptions`):

| Group                | Action                                                                                               | Chrome                                     |
| -------------------- | ---------------------------------------------------------------------------------------------------- | ------------------------------------------ |
| **Districts**        | compact ghost `Button` → launch District create                                                      | `ghost` + `sm` + `compact` + Lucide `Plus` |
| **Direct locations** | `LocationAddChildMenu` `appearance="group"` with `allowedAuthoringTypes` = non-District eligible set | same compact ghost labeled chrome          |

Both actions remain in the subgroup header for empty and populated states. Direct-location choices are a projection of canonical parent-child eligibility with District removed — not a separate hierarchy list. District row icon `+` remains a different scope (create under that District). Flat Contained locations (non-settlement) still use panel `headerEndSlot` with the same compact ghost labeled menu (`Plus` from `lucide-react`).

## Populated row vs empty container

| Responsibility                    | Owner                                                                                                                      |
| --------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| Populated edge summary + overflow | `CrossContentRelationshipRow` (composes `DetailEntityRow` + `DetailOverflowMenu`)                                          |
| Overflow actions                  | `DetailOverflowMenu` from `content/lib/detail/row/` (feature supplies `{ id, label, destructive? }`; compact icon trigger) |

Relationship rows build overflow action arrays via **`buildRelationshipOverflowActions`** in [`resolve-relationship-overflow-actions.ts`](../src/features/content/lib/relationship/list/resolve-relationship-overflow-actions.ts), which returns `DetailOverflowAction[]`. Alternatives derive from **`resolveRelationshipAlternatives`** in [`relationship-alternatives.ts`](../src/features/content/lib/relationship/list/relationship-alternatives.ts). Each operation exposes `{ supported, availability, isResolving? }` where `availability` is `available | unavailable | unknown`.

Client-side mutation availability may conclude that no alternative exists only when the candidate set is an authoritative domain set (`isAuthoritativeDomainSet: true` on [`RelationshipCandidateSet`](../src/features/content/lib/relationship/list/relationship-candidate-set.ts)). Partial or paginated data produces `unknown`, never an authoritative `unavailable`.

Mutation capability must not depend on the current search/page/render subset.

`unknown` is not a negative capability result. Structurally supported mutations remain visible when availability is unknown. Only an authoritative `unavailable` suppresses the action.

- `unknown` + `isResolving`: authoritative answer expected shortly — visible, usually disabled.
- `unknown` + `!isResolving`: client snapshot cannot answer — visible, enabled; drawer resolves on invoke.

Structural impossibility (e.g. single-kind families with no registry alternates) resolves to `unavailable` directly and bypasses candidate-set completeness logic.

[`hasResolvedRelationshipMutationAlternative`](../src/features/content/lib/relationship/list/relationship-alternatives.ts) means materialized alternatives exist — not "user may invoke." [`isRelationshipMutationActionVisible`](../src/features/content/lib/relationship/list/relationship-alternatives.ts) governs invocation. Drawers consume the same resolver output and reuse the same candidate set — do not recompute eligibility independently.

| Kind-group shell (header + kind rows) | `DetailSectionPanel` + `RelationshipList.Root` + `RelationshipList.Group` |
| Multi-subject kind add (org + character) | Family-level add → `LocationInversePeopleConnectionLinkDrawer` with kind step, then subject-type segment when ambiguous |
| Labeled group empty copy | `RelationshipList.Group` `emptyLabel` + optional `headerAction` |
| Unlabeled group empty/populated add | Root `emptyLabel` + `action` (empty) or Root `Footer` (populated) |

`CrossContentRelationshipRow` **never** accepts empty-state props.

## Drawer building blocks

| Primitive                                                    | Role                                                                                                        |
| ------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------- |
| `DrawerContext`                                              | Lightweight fixed-endpoint composition (`EntityItem` identity, no border/background) — no border/background |
| `RelationshipDrawerSubjectField`                             | Structured read-only **form** fields only — not entity endpoint chrome                                      |
| `EntityReplacementCurrentField` / `EntityReplacementSection` | Sunken Current chrome hosting the same entity context composition for searchable replacement flows          |
| `LocationConnectionKindField`                                | Dumb active kind radios (options, value, onValueChange) — drawer owns summary vs field visibility           |
| `SelectionSummaryCard`                                       | Completed decision row within sequenced Add drawers and create-modal setup                                  |
| Embedded `ContentEntityCard` + selection actions             | Entity picker rows in drawers                                                                               |

When a per-kind add action resolves intent before open, **do not** show a kind picker in the drawer.

When a **family-level** add action must choose among semantically meaningful kinds, sequenced Add drawers use **`LocationConnectionKindField`** for the active kind decision and **`SelectionSummaryCard`** for the completed kind row. While the user reopens kind (Change), hide downstream controls (subject type, entity picker, search) **and** the persistence footer — do not disable them. Kind change clears only downstream selections that are ineligible under the new kind; preserve still-valid subject type and entity selections.

### Sequenced Add kind option count

Hosts derive reopen capability once from total option count (enabled **and** disabled):

```ts
const canEditKind = canReopenConnectionKindDecision(kindOptions)
```

Use `canEditKind` for every kind-reopen surface — Change affordance, `startEditingKind`, and summary-row action. Do not parallel-check `options.length > 1` in drawer JSX.

| Option count | Kind control                                   | After kind chosen               | Change / overlay                                            |
| ------------ | ---------------------------------------------- | ------------------------------- | ----------------------------------------------------------- |
| **0**        | No kind control                                | Downstream only                 | N/A                                                         |
| **1**        | Locked readout (`LocationConnectionKindField`) | Picker / footer immediately     | **No Change** — `canEditKind` is false                      |
| **2+**       | Active radios initially                        | `SelectionSummaryCard` + Change | Change hides downstream; same-value reselect dismisses edit |

Two total options with one disabled still counts as **2+** — Change must reopen radios and show the disabled reason, not collapse to the single-option lock.

**Change-kind** drawers use always-expanded **`LocationConnectionKindField`** only — no summary card, no Change affordance, footer stays visible.

Create-modal draft relationship tabs (Building → Organizations) use
`CreateCompositionSummary` + `RadioCardField` inside a feature-owned stage machine
with resting/composing workspace semantics — not drawer-local collapse chrome and
not inline pending-row edit. See
[create-flow.md](./create-flow.md#nested-composition-presentation) for nested
**composition** vs relationship-picker **acquisition**
([§Relationship picker nested create](#relationship-picker-nested-create)).

Location **People & organizations** family-level adds follow the same sequence: relationship kind → subject type (only when ambiguous) → entity picker. When a selected kind supports both organization and character bindings (`buildPeopleKindSlots` merges shared headings such as Owner, Tenant, Operator), resolve subject type inside `LocationInversePeopleConnectionLinkDrawer` via a segmented control (`Character` / `Organization`) above the entity search. Hide subject type, picker, and persist footer while kind is being edited upstream. **Create organization** is wired on the organization subject segment; **Create NPC** is wired on the character segment via `resolveRelationshipPickerCharacterCreateIntents`. Build-context readiness (`useCampaignNpcBuildContext`) gates the character auxiliary action at the drawer — not inside the intent resolver.

### Relationship picker nested create

Domain-owned **`resolveRelationshipPickerCreateIntents`** (location and character targets) and
**`resolveRelationshipPickerOrganizationCreateIntents`** (organization targets with singleton-slot
gating) decide what may be created from an Add drawer. Dashboard maps 0 / 1 / many intents onto
`CatalogPickerSheet` **`auxiliaryAction`** via **`mapRelationshipPickerCreateIntentsToAuxiliaryAction`**
(menu variant for 2+ location authoring types; direct action for a single intent).

Handoff is drawer-owned through **`useRelationshipPickerNestedCreate`**: sibling
`OrganizationCreateModal` / `LocationCreateModal` / standalone `QuickNpcCreateModal`, optional
**`onCreated({ contentType, id })`** after persistence, then `resolvingCreatedTarget` refresh +
full eligibility revalidation before select. Nested modals stay open until handoff resolves
successfully; handoff failure rejects `onCreated`, surfaces status-specific feedback, and leaves
the create modal open — the entity already exists, so callers must not retry persistence.
Footer submit is the only relationship persist boundary — nested create must not POST the relationship.

**Typed handoff results** (`NestedCreateHandoffResult` in
[`relationship-picker-nested-create.types.ts`](../src/features/content/lib/relationship/picker/relationship-picker-nested-create.types.ts)):

| Status        | User-visible outcome                                                            |
| ------------- | ------------------------------------------------------------------------------- |
| `selected`    | Drawer selects the new entity; nested modal closes                              |
| `not-found`   | Warning — created, but not visible yet; refresh or select manually              |
| `ineligible`  | Warning — created, but cannot link in this slot; select manually or change kind |
| `unsupported` | Error — created, but automatic selection unsupported for this content type      |

Copy lives in [`nested-create-handoff.errors.ts`](../src/lib/create-flow/nested-create-handoff.errors.ts)
(`formatNestedCreateHandoffFailure`). Reject = handoff failed after persist; never re-mutate.

Nested create supplies one relationship endpoint. The originating workflow owns that
relationship. Reverse org-location composition authoring is suppressed in nested
creators via **`ContentCreateContext`** (`relationship-target` +
`relationshipVocabulary: 'organization_location_connection'`) and
**`resolveLocationCreateAuthoringCapabilities`** — not ad-hoc tab props on drawers.
Org Add member + Quick NPC keeps its
membership-specific success-closes-all handoff; do not route that picker through the shared intent
resolver.

**Intent vs readiness:** `resolveRelationshipPickerCreateIntents` (and character/org wrappers)
decide whether Create NPC is conceptually supported. Campaign NPC build-context load/failure is
wired only at the drawer/hook auxiliary-action layer (`buildContextReady` / `buildContextFailed`).

Wired Add drawers: organization forward location pickers, location inverse organization pickers, and
People drawer organization and character segments. Out of scope: changeKind, changeTarget,
replaceOrganization, org member picker.

**Inverse drawer scope:** inverse drawers launch organization and character nested create only —
never location create — so they intentionally omit `nestedCreateContext`. Forward organization →
location pickers pass `nestedCreateContext` for org-composition suppression via
`resolveLocationCreateAuthoringCapabilities`.

**Loading vs blocking:** `nestedCreateBusy` means interaction is blocked, not that the catalog is
loading. `CatalogPickerSheet.loading` must reflect only genuine catalog/query pending — never
`nestedCreateBusy` or `phase`. If a drawer later wires query-pending into `loading`, that remains
valid; nested-create phases must not replace the picker list.

| Phase                    | Picker presentation                           | Auxiliary create action | Relationship footer |
| ------------------------ | --------------------------------------------- | ----------------------- | ------------------- |
| `idle`                   | Normal (catalog loading if query pending)     | Enabled                 | Normal              |
| `creating`               | Preserved — list, search, selection unchanged | Disabled                | Blocked             |
| `resolvingCreatedTarget` | Preserved — list, search unchanged            | Disabled                | Blocked             |

Org Add member + Quick NPC is a **visual reference** for picker preservation behind a nested modal;
do not copy its overlay-state architecture or success-closes-all semantics into relationship pickers.

### Inverted organization add without `addKind` (legacy)

`LocationInverseOrganizationConnectionLinkDrawer` in **add** mode without a resolved `addKind` is an **inverted leftover**, not sequenced grammar: the user picks the organization first, then sees kind radios only after a subject is selected (`showKindStep` requires `selectedOrganizationId`). Do **not** extend this branch with sequenced overlay behavior (`SelectionSummaryCard`, Change, or upstream edit hiding). Per-kind inverse adds that resolve intent before open pass `addKind` and skip the kind step entirely. New surfaces should prefer intent-resolved adds or the sequenced People drawer pattern.

## Presentation roles (relationship drawers)

| Role                         | Primitive                         | When                                                                |
| ---------------------------- | --------------------------------- | ------------------------------------------------------------------- |
| Active choice                | `RadioCardField` (via kind field) | Unresolved kind or upstream edit overlay                            |
| Completed in-sequence choice | `SelectionSummaryCard`            | Kind selected in sequenced Add; compact label/value, no description |
| Terminal entity identity     | Picker Selected row               | Entity chosen before footer persist                                 |
| Persisted endpoint replace   | `EntityReplacementSection`        | changeTarget / replaceOrganization                                  |

Do not stretch one selected-card primitive across those surfaces.

## Add vs edit choice contract

Add workflows begin **unresolved**. Change-kind workflows begin **resolved** with eligible options expanded immediately.

| Mode                | Kind control initial state                                   | Current values                                                       |
| ------------------- | ------------------------------------------------------------ | -------------------------------------------------------------------- |
| **Add (sequenced)** | Active radios until kind chosen                              | None — user must choose; completed kind → `SelectionSummaryCard` row |
| **Change kind**     | Expanded `LocationConnectionKindField` with current selected | Hydrated from persisted relationship; kind is the only mutable field |
| **Replace subject** | Kind shown as read-only field                                | `EntityReplacementSection` + `New {subject}` picker                  |

## Current-value representation

| Mutation control                     | Current value representation                        |
| ------------------------------------ | --------------------------------------------------- |
| Finite radio/segmented/select choice | Selected state inside the control                   |
| Searchable entity replacement        | `EntityReplacementSection` + `New {subject}` picker |

Replacement UI must explicitly represent the persisted value independently of the replacement candidate set.

Do not make users infer the persisted value from an absent candidate, drawer title, or surrounding page context.

Current-value display is resolved from persisted/hydrated relationship data at drawer open time ([`resolve-relationship-drawer-current-endpoint.ts`](../src/features/content/lib/relationship/drawer/resolve-relationship-drawer-current-endpoint.ts)). Candidate collections used for replacement pickers are not authoritative for current display. When the persisted endpoint cannot be resolved, surface an explicit unavailable state and block the replacement mutation — do not silently omit the Current field.

Rules:

- Do **not** compensate with prose such as `Current: Organization · Headquarters`. Render fixed endpoints with **`DrawerContext`**; render replacement values in sunken **`EntityReplacementCurrentField`**.
- **Change kind** opens with eligible options visible — do not require a second "Change" interaction.
- Change-kind drawers change **kind only** — disable entity pickers (`pickerEnabled={false}` on `CatalogPickerSheet`) so search, empty states, and picker hooks do not mount.
- Sequenced Add drawers use **`LocationConnectionKindField`** + **`SelectionSummaryCard`**; change-kind uses **`LocationConnectionKindField`** only (always expanded).

## Presentation policy

Relationship direction does **not** determine whether empty kinds are displayed. Use dashboard presentation policy in [`relationship-group-presentation.ts`](../src/features/content/lib/relationship/list/relationship-group-presentation.ts):

| Presentation           | When to use                                                                                        |
| ---------------------- | -------------------------------------------------------------------------------------------------- |
| **`meaningful_slots`** | Bounded role/status where absence communicates useful domain state (for example governs, controls) |
| **`sparse_groups`**    | Optional/open-ended relationships where empty kinds would create checklist noise                   |

| Section / family                     | Presentation                                                   |
| ------------------------------------ | -------------------------------------------------------------- |
| Location → Territorial Authority     | `meaningful_slots`                                             |
| Location → People & organizations    | `sparse_groups`                                                |
| Organization → Sites & facilities    | `sparse_groups`                                                |
| Organization → Geographic presence   | `sparse_groups`                                                |
| Organization → Territorial authority | `sparse_groups`                                                |
| Character → Location connections     | Read-only merged connections list (not a relationship section) |

**Meaningful slots** examples: Governs, Controls.

**Sparse groups** examples: Owner, Tenant, Operator, Headquarters, Resident, Works at, Operates in.

Only render per-kind empty copy for meaningful slots. Sparse groups use one family-level empty value (for example `No people or organizations linked.`) and a single family add action (`Add relationship`) that keeps the same content-level position in empty and populated states.

## Forward vs inverse display

| Surface                                  | Empty slots                                                       | Add affordance                                              |
| ---------------------------------------- | ----------------------------------------------------------------- | ----------------------------------------------------------- |
| **Organization forward** (subject-owned) | Family-level empty only — never per-kind empty groups             | One family-level add per populated or eligible-empty family |
| **Location inverse — meaningful slots**  | Per-kind empty rows when they communicate meaningful target state | Per-kind or direct-intent add actions                       |
| **Location inverse — sparse groups**     | One family-level empty row only                                   | One family-level add (`Add relationship`)                   |

Populated forward families **always render**, even when no additional targets are currently available. Hide or disable only the family add affordance — not the populated groups.

### Single-kind section presentation

Organization forward families may omit kind eyebrows only when **both** are true:

1. The family configures exactly one semantic relationship kind, and
2. The section heading fully communicates that relationship (for example **Areas of operation** for `operates_in`).

Cardinality alone is insufficient — generic headings (for example character **Connections**) must keep kind context visible. `kindHeading: 'show' | 'omit'` lives in dashboard family presentation config ([`organization-location-connection-surface-copy.ts`](../src/features/content/organizations/lib/location-connections/organization-location-connection-surface-copy.ts)); never derive from populated rows.

Show and omit modes share the same `RelationshipList.Group` → row list architecture. When `kindHeading === 'omit'`, pass no `label` so the group renders **zero** reserved eyebrow chrome.

Forward kind eyebrows use **direction-aware grammar** (for example `Owns`, `Operates`) via
`getOrganizationLocationConnectionDisplayLabel(kind, 'forward')`.
Inverse existing-edge eyebrows and connected-parties labels use
`get*ConnectionDisplayLabel(kind, 'inverse')`.

**Endpoint-fixed inverse kind pickers** (location inverse drawers, org change-kind at a fixed location) require a `Location` and use dashboard-owned contextual descriptions from [`location-inverse-relationship-description.ts`](../src/features/content/locations/lib/connected-parties/location-inverse-relationship-description.ts) with reference nouns from `resolveLocationReferenceNoun` in `@rpg/contracts`. Inverse radio labels use `get*ConnectionDisplayLabel(kind, 'inverse')`. Forward / non-contextual pickers keep neutral vocab `.description` and canonical labels.

Drawer fixed endpoints compose **`DrawerContext`** from feature projections:

- Location: `buildLocationEntityContextPresentation(LocationEntitySummaryVm)` — heading, ` · ${classification.text}`, optional `Located in {nearestParent}` from `ancestry.items.at(-1)` (via [`formatLocatedInSupportingText`](../src/features/content/locations/lib/location-display.ts)).
- Organization: `buildOrganizationDrawerContextEntity` — `{name} · Organization`.
- Character: `buildCharacterEntityContextPresentation` — `{name} · {PC|NPC}` with identity summary as supporting text (parity with location Located-in).

**DrawerContext composition (all connection-drawer modes):**

| Surface                    | Mode                      | Entities                                                     |
| -------------------------- | ------------------------- | ------------------------------------------------------------ |
| Location inverse org       | add / replaceOrganization | `[location]` (+ sunken Current org on replace)               |
| Location inverse org       | changeKind                | `[location, organization]`                                   |
| Location inverse character | add / changeKind          | `[location]` / `[location, character]`                       |
| Location inverse people    | add                       | `[location]`                                                 |
| Organization forward       | add / changeTarget        | `[organization]` (+ sunken Current location on changeTarget) |
| Organization forward       | changeKind                | `[organization, location]`                                   |

Locked relationship kinds on replace / changeTarget use read-only **`RelationshipDrawerSubjectField`** (not endpoint chrome).

Organization forward relationship rows resolve target presentation via **`buildLocationEntityContextPresentation`** — no hand-rolled ` · ${classification}` or italic Located-in markup.

Parent replacement (Move / Set / Change parent) omits subject **`DrawerContext`** when the drawer title already names the subject. Unavailable parent headings use **`ENTITY_REPLACEMENT_UNAVAILABLE_LOCATION_HEADING`**.

Removed parallel string-context formatters (`RelationshipDrawerContextHeader`, `resolveLocationConnectionContext`, `location-drawer-context.lib.ts`) — drawers consume entity-context presentation helpers only.

**DrawerContext** (lightweight, no chrome) names fixed endpoints for add flows and attribute mutations. **Sunken Current** (`EntityReplacementCurrentField`) hosts the same entity composition for replacement-only workflows.

Endpoint ordering: location detail drawers lead with location; organization forward drawers lead with organization.

Do not use standalone Organization / Location / Character **SubjectField** labels as endpoint chrome — reserve `RelationshipDrawerSubjectField` for genuine form values only.

Vocab still owns perspective-neutral canonical descriptions for forward and non-contextual pickers.

Cross-org singleton territorial slots (`governs`, `controls`) require **server-backed occupancy** (`edgesByLocationId`) in organization forward drawers. Org-local connection lists alone are not authoritative for those kinds.

## Copy ownership

**Vocab owns:** canonical kind `label`, optional `forwardLabel` / `inverseLabel` for existing-edge eyebrows, kind description, semantic distinctions, `maxSubjectsPerLocation`.

Use `get*ConnectionLabel(kind)` for pickers and read-only kind fields. Use
`get*ConnectionDisplayLabel(kind, 'forward' | 'inverse')` for populated relationship row
eyebrows and connected-parties API labels. Forward / inverse follow canonical edge
ownership (organization or character → location), not which detail page is open.

Canonical kind **descriptions** must stay perspective-neutral (no “this location” / “here”) because they render in kind pickers before an endpoint is fixed. Endpoint-fixed inverse pickers compose contextual copy around `resolveLocationReferenceNoun(location)` instead — including explicit `resides_at` tiers (`Lives in this settlement.` vs `Lives at this building as a primary residence.`). See [packages/contracts/docs/structure.md](../../../packages/contracts/docs/structure.md#reference-vocabulary-gametermentry--vocabularyterm).

**Dashboard owns:** section headings/helpers, drawer titles, action labels, empty-state copy, dynamic occupancy copy, confirmation copy, instructional workflow text, and per-kind **target presentation** for relationship target pickers (field label, field helper, search placeholder, optional browse scopes).

Organization forward target pickers use optional `targetPresentation` config and a separate optional `changeTargetDrawerTitle` in [`organization-location-connection-surface-copy.ts`](../src/features/content/organizations/lib/location-connections/organization-location-connection-surface-copy.ts). Resolvers return fully resolved presentation with generic defaults (`Location`, `Search locations…`). **Change-target drawers:** the title carries relationship semantics (`Change governed territory`, `Change headquarters location`, …); `EntityReplacementSection` labels identify the endpoint being replaced (`Current territory` / `New territory`, or `Current location` / `New location`). Target presentation describes how users browse valid targets.

**Browse scope rule (organization forward):** configured scopes remain visible for semantic stability. A scope is disabled when the post-eligibility candidate set contains zero locations for that scope. Scope availability is never derived from the active search query. Browse scopes organize display only — they never substitute for `@rpg/contracts` eligibility.

**Browse scope rule (location parent replacement):** parent drawer scopes are derived from the **eligible candidate universe** only — `All` plus one segment per browse family present in candidates. Do not render families with zero candidates as disabled stubs. Hide segmentation entirely when ≤1 family is present. Search text is preserved on scope change. Location kind families live in neutral [`location-kind-browse-families.ts`](../src/features/content/locations/lib/location-kind-browse-families.ts) (authoring type select + parent browse scope filtering).

Use **direction-aware resolvers** in feature copy modules (for example [`location-connection-surface-copy.ts`](../src/features/content/locations/lib/connected-parties/location-connection-surface-copy.ts) for location inverse and [`organization-location-connection-surface-copy.ts`](../src/features/content/organizations/lib/location-connections/organization-location-connection-surface-copy.ts) for organization forward). Do not reuse one empty/add label for Location inverse and Organization forward.

Location inverse drawers resolve **subject** target presentation in [`location-connection-surface-copy.ts`](../src/features/content/locations/lib/connected-parties/location-connection-surface-copy.ts) (`resolveLocationInverseOrganizationTargetPresentation`, `resolveLocationInverseCharacterTargetPresentation`, `resolveLocationInverseOrganizationReplaceHelper`). Drawers consume **`searchPlaceholder`** and replace helpers where applicable; field labels use shared [`relationship-drawer-field-labels.ts`](../src/features/content/lib/relationship/drawer/relationship-drawer-field-labels.ts) constants when they already match resolver defaults.

Browse scopes remain **forward-only** — inverse pickers select a subject with a fixed location; HQ structure scoping on inverse flows stays in `@rpg/contracts` eligibility on that location. Do not merge forward and inverse presentation modules.

### Inverse presentation acceptance rule

Fix inverse presentation **only where generic or family-level copy is incorrect or misleading**. Do **not**:

- add per-kind overrides solely for forward/inverse symmetry
- wire unused presentation fields (`targetLabel` / `targetHelp`) merely for completeness when constants already match defaults
- invent HQ-style inverse `targetHelp`

Location inverse is already fixed on the location endpoint; “choose an organization/character” is usually enough. Eligibility, occupancy, mutation alternatives, candidate derivation, and authorization stay outside presentation modules.

### Location hierarchy inverse authoring

Location parent/child editing is **not** a typed-edge relationship. Contained locations and Located in are forward/inverse **projections** of one canonical edge: the child’s `parentLocationId`. There is no persisted `children[]`.

| Surface                                                   | Affordance                                                                                                   | Mutation                                                        |
| --------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------- |
| Child detail **Located in**                               | **Change parent** / **Set parent** (managers; no clear; no View-parent overflow — breadcrumb links navigate) | `updateContent(..., { parentLocationId })` on the open location |
| Parent detail **Contained locations**                     | Row overflow **View location** + **Move location** (managers); View link only for non-managers               | Same mutation on the **selected child**                         |
| Contained locations header **Add location**               | `LocationCreateModal` — fixed child type and parent (non-settlement parents)                                 | Create, not reparent                                            |
| City structure **Add district** / Direct **Add location** | Subgroup header actions — District vs non-District children under the Settlement                             | Create, not reparent                                            |
| City structure District row **+**                         | `LocationCreateModal` under that District                                                                    | Create, not reparent                                            |

**Authority invariant:** breadcrumb ancestry is presentation only. Drawers resolve **Current parent** and submit targets from the subject’s persisted `parentLocationId` (looked up in the campaign locations list). Move must not treat the open parent detail id as Current when it disagrees with that field — refresh/block instead.

**Parent replacement chrome:** `EntityReplacementSection` with `entityLabel="Parent"` renders **Current parent** / **New parent** labels. Task-oriented helper copy varies by surface (Move / Change / Set). Candidate browse scopes filter the eligible set before search — eligibility always runs first.

**Shared Current→New chrome** lives in neutral [`entity-replacement/`](../src/features/content/lib/entity-replacement/) (`EntityReplacementSection`, current field, replacement labels). Relationship drawers (org forward change-target, location inverse replace-organization) **consume** that layer. Hierarchy must **not** depend on relationship-owned Current/New modules. Eligibility, cycle prevention, and candidates stay domain-owned (`validateLocationParentAssignment` + location-feature helpers). After parent mutation, invalidate/refetch the campaign locations list — do not hand-patch ancestry/children projections.

## Implementation guard

Before building a new cross-content relationship surface, evaluate:

1. `DetailSectionPanel` + `RelationshipList` when grouping typed-edge kinds under a section title
2. `RelationshipList.Row` (composes `CrossContentRelationshipRow`) + overflow menu items for populated rows
3. `DetailSectionPanel` + `DetailSectionGroup` + `DetailSectionRowList` + `DetailEntityRow` for hierarchy sections (no typed-edge semantics)
4. Explicit Root/Group `itemCount` for empty vs footer vs slot-empty — no manual list chrome
5. `DrawerContext` + embedded entity picker + `LocationConnectionKindField` / `SelectionSummaryCard` (sequenced Add) or kind field only (change-kind)
6. Direction-aware copy resolvers
7. Feature-owned entity summary VMs mapped to neutral row / Current fields (`LocationEntitySummaryVm` for org→location targets — generic relationship code never imports location display)

## Non-adopters

| Surface                     | Reason                                                                                                                                       |
| --------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| Location children hierarchy | Parent/child structure, not typed edge — uses `DetailSectionPanel` + `DetailSectionGroup` + `DetailEntityRow`; see hierarchy inverse section |

## Organization Members (character-owned membership inverse)

The organization detail **Members** section is the organization-facing inverse of
character-owned `connections.organizations` memberships — not a typed location-style
edge. It uses `DetailSectionPanel` + `RelationshipList` (unlabeled `Group`, populated
`Footer` for Add) and composes member metadata through `RelationshipList.Row` props (no
membership-specific props on shared primitives).

- **Read:** `GET …/organizations/:organizationId/members` projects membership
  `{ title?, priority? }` per row and sorts with the shared contracts roster helper.
- **Write:** still character-scoped nested membership mutations; org-page Add / Edit /
  Remove are gated to campaign managers (`useCanManageCampaign`). PC owners edit their
  own membership from the character sheet.
- **Priority:** numeric presentation/order precedence (higher sorts first). Explicit
  persisted membership `priority` is authoritative; canonical titles fall back to
  vocabulary entry priority. Priority is distinct from future modeled authority and
  does not convey permission.

## Related

- Entity card contract: [content-entity-card.md](./content-entity-card.md)
- Organization location connection rules: [organization-location-connections.md](./organization-location-connections.md)
