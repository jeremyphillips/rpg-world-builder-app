# Entity presentation contract

Entity identity uses one stack:

```text
EntitySummaryModel → EntitySummary parts → EntityAnatomy (RowAnatomy cells) → embedded host | ContentEntityCard | DisclosureEntityCard
```

`EntitySummaryModel` contains identity content only: `heading`, optional
`classification`, `description`, `status`, and `media`. It never carries navigation.
`EntityAnatomyHost` adds optional heading navigation (`headingHref`), a single leading utility,
semantic trailing (`action` | `utility` | `indicator` | `group`, with optional inline `meta`), and density.

Vertical alignment is owned by the shared row-track grid in `@rpg/ui`
(`RowAnatomy` — band / meta / status tracks with slack gutters). Entity anatomy places
each slot into a named column and a track; it never self-aligns or offsets cells. See
[`packages/ui/docs/row-anatomy.md`](../../../packages/ui/docs/row-anatomy.md).

**Each visual concern has one owner.** When debugging inset, alignment, or chrome, ask
which semantic layer owns the concern — see [Ownership hierarchy](#ownership-hierarchy).

## Module layout (`lib/entity/`)

```text
summary/   — EntitySummaryModel, EntitySummary parts (heading / description / status), projection, media
anatomy/   — EntityAnatomy, EntityAnatomyHost, trailing cells, leading rail, surface edges, geometry tokens
surfaces/  — CEC, DEC, catalog rows; imports anatomy/ + summary/ only via dependency direction
  cards/content/     ContentEntityCard, EntityCardFrame, EntityCardContent (internal)
  cards/disclosure/  DisclosureEntityCard, DisclosureEntityCardHeader
  catalog/           CatalogEntityRow, CatalogEntityPickerSheet
  drawer/            DrawerEntityBlock (compact drawer identity — see [feature-structure.md](./feature-structure.md))
```

Dependency direction: `surfaces → anatomy → summary`. `summary/` must not import `anatomy/`;
`anatomy/` must not import `surfaces/`. Shared CSS var **names** live in
`anatomy/entity-geometry.tokens.ts`; surface CVA **values** live in
`surfaces/entity-surface-inset.variants.ts`.

## Choose a surface

Every card and row surface — entity and non-entity — is rendered side by side in the
dashboard Storybook page **Recipes / Cards and Rows**
(`apps/dashboard/src/stories/card-recipes/`), with its composition chain, density,
leading/trailing kinds, and anatomy classification. Toggle **Show anatomy** in the toolbar
to outline row-track grids and cells.

| Need                                                                | Surface                                                                                                                                                 |
| ------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Identity inside preview, destination, or master-detail host         | `EntityAnatomyHost`                                                                                                                                     |
| Global search hit (link row)                                        | `InteractiveListRow` + `IdentityRow`; media/status via `projectSearchHitToInteractiveListPresentation` — not `EntityAnatomyHost` inside the link        |
| Bordered static identity                                            | `ContentEntityCard`                                                                                                                                     |
| Bordered identity with expandable domain content                    | `DisclosureEntityCard`                                                                                                                                  |
| Create-tab Add/Pending discovery or pending rows                    | `ContentEntityCard` + trailing action                                                                                                                   |
| Detail hierarchy or typed relationship                              | `DetailEntityRow` / `EntityRowList`                                                                                                                     |
| Combobox option, action choice menu item, or split-button menu item | Shared interactive list chrome + `IdentityRow` (`ComboboxOptionRow` / `MenuChoiceRow`) — `InteractiveListSize` `sm` / `md` / `lg`; not `FieldSizeToken` |
| Custom combobox interiors (`renderOption`) or non-entity pickers    | Purpose-built row content                                                                                                                               |

### Interactive list chrome vs semantic hosts

Visual row recipes (`InteractiveListRow`, `InteractiveListSize`, slots) are shared; the
**host** sets ARIA semantics. Entity choice rows must render identity through these
primitives — not ad-hoc menu item class stacks. Menu rows derive highlight/wash from Radix
`data-[highlighted]` only (no parallel `:hover` rail on `MenuChoiceRow`).

| Mode                                    | Visual chrome                                                                        | Semantic host                                  | Text                                           |
| --------------------------------------- | ------------------------------------------------------------------------------------ | ---------------------------------------------- | ---------------------------------------------- |
| Combobox / true single-select           | `InteractiveList` + `ComboboxOptionRow`                                              | `listbox` / `option`, truthful `aria-selected` | `IdentityRow`                                  |
| Action choice menu / split-button items | `InteractiveList` + `MenuChoiceRow` inside `interactiveListChoiceMenuContentClasses` | `menu` / `menuitem`                            | `IdentityRow` when the item has identity copy  |
| Search hit                              | `InteractiveListRow` slots                                                           | link                                           | `IdentityRow`                                  |
| Detail / relationship section           | `DetailEntityRow` / `EntityRowList`                                                  | section row                                    | EntitySummary parts → `IdentityRowHeadingLine` |
| Bordered catalog + disclosure           | `CatalogEntityRow` / DEC                                                             | card / disclosure                              | anatomy + card frame                           |

Campaign-unavailable search hits use entity `inactive` status in the identity status slot
only — not a duplicate trailing badge.

### EntitySurfaceConfig (character / organization / location pickers)

Compact catalog and bordered cards share one **data-only** identity contract:

- Feature display modules return `EntitySurfaceIdentity` (`heading`, optional `metadata`, `classification`, `status`, optional `displayImage`, required semantic `fallback`) via `buildCharacterEntityCardModel`, `buildLocationEntityCardModel`, and `buildOrganizationEntityCardModel`. No JSX, no media nodes, no row chrome. Projection always paints compact media (image or fallback icon).
- Callers pass `EntitySurfaceConfig` (`identity`, optional `details`, optional `inlineAction`) into `CatalogEntitySurfaceRow`, `EntitySurfaceContentCard`, or `createCatalogEntityRowRenderer({ buildSurface })`.
- Heading label buttons use **`inlineAction` only** (`label`, `onClick`, `disabled?`, `loading?`). Surfaces render locked compact picker buttons.
- **Allowed exceptions:** disclosure-body commit `Button`s inside `details` / DEC children; `trailing.kind: 'utility'` for inventory steppers and icon-remove controls; `trailing.kind: 'group'` for commerce stacks.

The host keeps its own navigation, hover, selection, separators, drag behavior, and
domain controls. Never put a full-row link in `EntitySummaryModel`; when a host owns
full-row navigation, omit `EntityAnatomyHost.headingHref`.

---

## Ownership hierarchy

Documentation and code follow this stack. Lower layers consume upper-layer policy; they
do not redefine it.

```text
Foundational UI policy          (@rpg/ui — focus, icon controls, drag, interactive rows)
        ↓
Row tracks                      (@rpg/ui RowAnatomy — band / meta / status tracks, slack gutters)
        ↓
Entity anatomy                  (EntityAnatomyHost — named columns, slot → cell mapping)
        ↓
Surface/card shell              (EntityCardFrame — perimeter; EntityCardContent — header inset)
        ↓
Host/collection structure       (search rows, master-detail, detail sections, catalogs)
        ↓
Feature/domain content          (form fields, section panels, domain rhythm)
```

Foundational interaction policy is documented in
[`packages/ui/docs/semantic-style-layers.md`](../../../packages/ui/docs/semantic-style-layers.md)
and [`packages/ui/docs/design-tokens.md`](../../../packages/ui/docs/design-tokens.md).
Card primitives **consume** that policy; they do not redefine focus rings, hit targets,
drag chrome, or interactive-row fills.

### Ownership audit matrix

| Concern                        | Target owner                        | Notes                                                               |
| ------------------------------ | ----------------------------------- | ------------------------------------------------------------------- |
| Card perimeter                 | `EntityCardFrame`                   | Border, radius, surface identity, disabled chrome; **no padding**   |
| Card header/content inset      | `EntityCardContent`                 | Vertical inset; horizontal inset via frame edge vars                |
| Surface edge inset             | `EntityCardFrame`                   | `resolveEntitySurfaceEdges` → `entitySurfaceInsetVariants` per edge |
| Vertical alignment             | `RowAnatomy` (`@rpg/ui`)            | Band / meta / status tracks; cells never self-align or offset       |
| Section vs card inset          | Feature section / host              | e.g. equipment panel `px-4 py-4` is section padding, not card inset |
| Embedded row inset             | Host                                | SearchResultRow, master-detail list — not entity card surfaces      |
| EntityAnatomyHost columns      | EntityAnatomyHost anatomy           | Named lines `[leading] [media] [content] [trailing]`                |
| Leading content offset         | `EntityCardFrame` (when needed)     | `--entity-content-offset` on frame root for aligned sibling regions |
| Trailing rail                  | EntityAnatomyHost semantic trailing | `action` \| `utility` \| `indicator` \| `group` — no `endSlot`      |
| Disclosure behavior            | CollapsibleListItem                 | Collapse state, ARIA, structural DOM                                |
| CLI header vertical rhythm     | CollapsibleListItem                 | **Default rows only** — not `rowLayout="entity-card"`               |
| CLI body frame                 | CollapsibleListItem                 | `collapsibleListItemBodyFrameClasses` (divider + `py-3`)            |
| DEC / catalog body inset       | Surface body wash variants          | Body tone + entity inline start/end on shared body frame            |
| CLI body spacing (entity-card) | **None**                            | `rowLayout="entity-card"` → behavior + structural `p-0` reset only  |
| Drag chrome                    | Foundational UI                     | `dragHandleVariants`, host reveal contract                          |
| Control/focus chrome           | Foundational UI                     | `iconGhostControlVariants`, Button focus stack                      |
| Separators                     | Host                                | List/section separators, not EntityAnatomyHost                      |
| Form-array styling             | DEC + form field rhythm             | Form owns registration; DEC owns card geometry                      |

---

## EntityAnatomyHost

### Owns

- Named-column placement (`[leading]` | `[media]` | `[content]` | `[trailing]`) on RowAnatomy tracks
- Slot → cell mapping (heading → band, description → meta, status → status, trailing per kind)
- Leading-rail geometry via `EntityLeadingRail` (`utilityGap`, `contentGap`, `padding-inline-end`)
- EntitySummary parts inside the content column
- Semantic trailing seam (`action` | `utility` | `indicator` | `group`)

### Does not own

- Card border, radius, background
- Collection/row inset (host responsibility)
- Separators, hover/selection orchestration
- Disclosure body padding
- Feature layout or domain field spacing

### Consumer supplies

- `entity` (`EntitySummaryModel`)
- Optional `leading` utility node (host or surface places behavior; anatomy places layout)
- Optional semantic `trailing`
- Optional `headingHref` (heading-only navigation)
- `density` when embedded without an outer card shell

### Consumers must not

- Add `px-*` / `py-*` to anatomy or EntityAnatomyHost root to fix host or card misalignment
- Introduce parallel trailing APIs (`endSlot`, `headingEndSlot`) on entity surfaces
- Publish `--entity-content-offset` (only surfaces with aligned sibling regions)

Optional DOM children must never alter grid-track ownership: every cell names its column
(`leading`, `media`, `content`, `trailing`) and its track slot. Absent slots leave their
`auto` column at zero width.

### Leading utilities contract

| API                              | Scope                 | Rule                                                                           |
| -------------------------------- | --------------------- | ------------------------------------------------------------------------------ |
| `EntityAnatomyHost.leading`      | Public embedded hosts | Exactly **one** utility when set — maps to `[leading]` internally              |
| `EntityAnatomy.leadingUtilities` | Internal / surfaces   | Ordered list of utilities; **Anatomy is the sole `EntityLeadingRail` wrapper** |
| DEC / DER disclosure             | Surface composition   | Pass explicit utility nodes — never pre-wrap `EntityLeadingRail`               |

Surfaces with disclosed sibling content publish `--entity-content-offset` on their root
from utility **count** and **density**. Anatomy and `EntityLeadingRail` establish the
coordinate physically; they never publish offset.

**Combined entity-card host invariant:** CEC, DEC, and `CatalogEntityRow` share
`EntityCardFrame` + `EntityCardContent`. `rowLayout="entity-card"` ⇒ CLI behavior-only
(no header/body inset, no competing padding) + exactly one `EntityCardContent` header
inset region + frame publishes surface inset CSS vars and content offset when needed.
Disclosure bodies keep their own body-wash geometry — frame padding must never govern them.

---

## EntityCardFrame and EntityCardContent (internal)

Two primitives split perimeter from inset — one owner per concern:

```text
EntityCardFrame (article)
├── perimeter: border, radius, surface, disabled chrome
├── publishes: --entity-surface-inline-start/end, --entity-content-offset (when needed)
└── EntityCardContent
    └── header inset: horizontal + vertical (density-resolved)
```

| `surface` prop | Used by                | Background                      |
| -------------- | ---------------------- | ------------------------------- |
| `card`         | `ContentEntityCard`    | `bg-card`                       |
| `subtle`       | `DisclosureEntityCard` | `bg-surface-subtle`             |
| `catalogRow`   | `CatalogEntityRow`     | `bg-catalog-picker-row-surface` |

Rhythm must **never** depend on `collapsible`, `details`, or collapsed state.

---

## ContentEntityCard

```text
ContentEntityCard
└── EntityCardFrame (surface="card")
    └── EntityCardContent
        └── EntityAnatomy
```

### Owns

- Composition only — delegates perimeter to `EntityCardFrame`, inset to `EntityCardContent`

### Consumer supplies

- `entity`, optional `leading`, optional semantic `trailing`, optional `headingHref`
- `density`

### Does not own

- Disclosure behavior or body wash
- Domain content below the identity block
- Host collection inset

### Consumers must not

- Wrap CEC in a feature card wrapper with duplicate border/padding
- Calculate leading indentation locally

---

## DisclosureEntityCard

DEC composes the shared frame/content stack with CLI disclosure behavior.
`DetailEntityRow` is outside this contract.

```text
DisclosureEntityCard
└── EntityCardFrame (surface="subtle")
    └── CollapsibleListItem (rowLayout="entity-card", density)
        ├── EntityCardContent
        │   └── DisclosureEntityCardHeader → EntityAnatomy
        └── body — shared body frame + DEC wash tone + entity inline inset
```

### Owns

- Disclosure body wash (`disclosureEntityCardBodyWashVariants`)
- Domain `children` placement inside the body wash

### CollapsibleListItem rhythm contract

Applies to CollapsibleListItem-based rows:

- **Entity-card hosts (`rowLayout="entity-card"`):** CLI owns collapse/ARIA/structure only;
  `EntityCardContent` owns header inset; CLI contributes no meaningful padding
- **Default form-array rows:** CLI owns header vertical padding
  (`collapsibleListItemHeaderVerticalPaddingVariants`), body divider, body vertical padding
- **Invariant:** entity-card header rhythm is identical for flat and disclosure catalog rows
  at the same density

### Consumer supplies

- `entity`, optional `dragHandleProps`, semantic `trailing`, domain `children`
- Collapse control wiring via DEC props (`collapsed`, `onToggleCollapse`, …)

### Does not own

- CollapsibleListItem state-machine internals
- Domain field rhythm inside `children` (form `itemBodyStackClasses`, field gaps)
- Section/list surrounding inset outside the card

### Consumers must not

- Add card inset wrappers around DEC
- Calculate grip/caret indentation or compensate with negative margins
- Position trailing controls outside EntityAnatomyHost anatomy
- Rely on CLI `--content-column-indent` or duplicate body vertical padding on adapter wrappers

### CollapsibleListItem entity-card mode

When `rowLayout="entity-card"`, CollapsibleListItem owns **disclosure behavior and
structural plumbing only**. It does **not** own entity-card header/body inset or entity
leading geometry.

**Single ownership switch:** `rowLayout="entity-card"` — not a combination of
`rowLayout` and `toolbarLeadingChrome`. DEC composition sets
`toolbarLeadingChrome="none"` because leading controls live in `EntityLeadingRail`; body
inset ownership follows from `rowLayout` alone.

CLI entity-card mode must contribute **no competing**:

- `pl` / `pr` / `pt` / `pb` on the body slot
- `--content-column-indent` / `--content-inline-start` on the shell

DEC `bodyClassName` owns all horizontal and block inset.

---

## CollapsibleListItem (entity-card hosts)

### Owns

- Collapse behavior, ARIA ids, keyboard disclosure
- Structural shell (`p-0`, header row flex) for entity-card layout
- Geometry tokens (`--leading-chrome-size`, `--leading-chrome-count`) without indent vars

### Does not own

- Entity-card header inset
- Entity-card body inset
- Entity content offset (DEC `article` publishes `--entity-content-offset`)

Non-entity ArrayItem rows (`rowLayout="default"`) retain legacy content-column indent
via CLI — that path is for anonymous form arrays, not entity-backed disclosure cards.

---

## Hosts (embedded EntityAnatomyHost)

Search, master-detail, catalogs, relationship lists, and similar hosts own:

- Row inset where the host defines it (`px`/`py`, hover, selection)
- Separators, grouping, scrolling, navigation hit targets

```text
SearchResultRow          → owns px/py + hover + separator context
  EntityAnatomyHost             → owns leading | content | trailing
```

Do not repair missing host inset by adding padding back into EntityAnatomyHost. Relationship
rows may use different host inset than search; shared anatomy does not imply identical
collection spacing.

Detail and relationship rows compose `DetailEntityRow` → `EntityAnatomy`. Non-entity
detail primitives may use `endSlot` for utility controls — that API does not apply to
`EntityAnatomyHost`, CEC, or DEC. See
[cross-content-relationship-ui.md](./cross-content-relationship-ui.md).

### Catalog entity picker rows

Entity-backed catalog pickers **must** use `CatalogEntityPickerSheet` → `CatalogEntityRow`.
Raw `CatalogPickerSheet` remains for generic/non-entity catalogs only.

```text
CatalogEntityRow
└── EntityCardFrame (surface="catalogRow")
    └── CollapsibleListItem (rowLayout="entity-card")
        ├── EntityCardContent
        │   └── EntityAnatomyHost | DisclosureEntityCardHeader
        └── details? (body wash)
```

| Layer                                              | Owns                                                                                      |
| -------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| `EntityCardFrame`                                  | Border, radius, `catalogRow` surface, inset CSS vars, content-offset when leading present |
| `EntityCardContent`                                | Header horizontal + vertical inset (flat and disclosure modes)                            |
| CLI (`rowLayout="entity-card"`)                    | Disclosure behavior, structural `p-0` reset — no catalog chrome                           |
| `EntityAnatomyHost` / `DisclosureEntityCardHeader` | Three-column identity                                                                     |
| Body wash variants                                 | Optional expanded details inset                                                           |

Features supply entity model, trailing semantics, and optional per-item `details` via
`renderEntityRow` or `createCatalogEntityRowRenderer`. `rowLayout="entity-card"` is
internal to `CatalogEntityRow` — not a feature concern.

Disclosure mode activates when **resolved** `details` is non-null (not merely when a
`buildDetails` callback exists).

---

## Feature / domain layer

### Owns

- Domain body content and behavior (fields, validation, append/remove/reorder)
- Domain field rhythm (`itemBodyStackClasses`, responsive grids, commerce semantics)
- **Section** inset where the feature defines a panel or list wrapper (distinct from card inset)

### Does not own

- Generic card padding, entity heading layout, disclosure body inset
- Grip/caret spacing, trailing-rail geometry, focus/button chrome

**Form-owned ≠ form-styled.** Entity-backed grant and equipment rows use
`EntityDisclosureArrayItemShell` → `DisclosureEntityCard`; the form layer owns RHF
registration, not card geometry. See
[`array-field-authoring.md`](../../../packages/ui/docs/forms/array-field-authoring.md#itemrendershell--entity-presentation).

### No compensating layout

When a shared surface is wrong, fix the owner — do not patch in feature code:

- Negative margins to align with mis-measured chrome
- Manual `pl`/`pr` for grip presence
- Extra `px`/`py` around EntitySummary
- Wrapper padding because a primitive is misaligned

Local spacing is acceptable only for genuine domain/host composition (section panels,
form field stacks).

---

## Density

`EntityAnatomy` owns identity typography, rhythm, media/leading/trailing geometry.
Embedded hosts own collection inset. `EntityCardContent` owns header inset; CEC, DEC,
and `CatalogEntityRow` pass density to both `EntityCardContent` and internal anatomy.

Set density **exactly once**:

- standalone cards: CEC or DEC;
- embedded hosts: `EntityAnatomyHost` + host-owned row inset;
- never size a shell and nested item independently.

Entity/content **density** (`compact` | `comfortable`) is unrelated to form-control
**size** tokens — do not force unrelated systems into one scale because both use names
like `compact`.

---

## Edge geometry contract

Surface inset is resolved **per edge** by `resolveEntitySurfaceEdges` and published by
`EntityCardFrame` / `DetailEntityRow` as `--entity-surface-inline-start` / `-end`:

| Edge  | `utility` when                            | Value                                         |
| ----- | ----------------------------------------- | --------------------------------------------- |
| start | at least one leading utility              | `--entity-surface-utility-inset` (tight)      |
| end   | `utility` trailing or chevron `indicator` | `--entity-surface-utility-inset` (tight)      |
| other | —                                         | `--entity-surface-inset` (density base inset) |

A trailing ghost utility therefore sits as far from the end edge as a leading caret sits
from the start edge (`UtilityEdgeParity` story). Disclosed bodies always use the base
inset at the end edge (`--entity-body-inline-end`) — a header utility never narrows the
body. Body classes are the static literals `entityBodyInlineStartClasses` /
`entityBodyInlineEndClasses`.

### Leading geometry

Leading utilities (grip, disclosure caret, or a single host utility) share one geometry
policy via `resolveEntityLeadingGeometry({ count, density })`:

- `utilityGap` — flex gap between adjacent utilities (0 when grip and caret touch)
- `contentGap` — `padding-inline-end` on `EntityLeadingRail` before column 2
- `contentOffset` — rendered rail width when count > 0

`EntityLeadingRail` physically consumes `utilityGap` and `contentGap`. The leading slot
does not add `mr-*` for content-start.

**Publication rule:** publish `--entity-content-offset` only when content outside
`EntityAnatomy` must align to column 2 (DEC disclosed body, DER disclosure body).
CEC, master-detail, and embedded `EntityAnatomyHost` hosts need anatomy layout only — CEC may
publish `--leading-chrome-size` when a leading utility is present.

`EntityCardFrame` publishes surface inset tokens and `--entity-content-offset` when
leading utilities are present. Body inline-start = surface start inset + content offset.
Body inline-end = base surface inset (`--entity-body-inline-end`), independent of the
header end edge.

DER keeps host `px-4` on the header row; disclosed body uses host inset + content offset
via `detailEntityRowDisclosureContentVariants` — host inset is not folded into the geometry
helper.

`--entity-leading-offset` remains a migration alias for `--entity-content-offset`.

**Behavior** owns what a control does (collapse, drag). **Entity anatomy** owns where it
lives. Do not use CLI `chromeCount` or `--content-column-indent` as a second entity
offset system.

---

## Trailing kinds

Entity surfaces use one trailing seam with **closed types** — no arbitrary strings or
free-form `ReactNode` slots:

```text
trailing
├── action      → ReactElement labeled commit control, optional meta string
├── utility     → ReactElement ghost icon utility or utility cluster, optional meta string
├── indicator   → chevron | quantity | label
│                 chevron and quantity accept an optional meta string
└── group
    ├── primary   → ReactElement control composition
    └── secondary → price | quantity | grantPreview metadata variants
```

`resolveEntityAnatomyTrailingCells` maps each kind onto exactly one RowAnatomy cell. Kinds
never choose their own alignment. `meta` renders as muted `text-sm` before the control
inside that same cell. It does not add a second cell.

| Kind        | Type contract                                                                         | Cell                                     | Use                                                                                          |
| ----------- | ------------------------------------------------------------------------------------- | ---------------------------------------- | -------------------------------------------------------------------------------------------- |
| `action`    | `content: ReactElement`, optional `meta`                                              | `band`                                   | Labeled commit — Add, Select, Edit, Release                                                  |
| `utility`   | `content: ReactElement`, optional `meta`                                              | `full` (row-centered)                    | Remove, overflow menu, quantity stepper, icon edit                                           |
| `indicator` | `variant: 'chevron'`, optional `meta`                                                 | `full`                                   | Destination chevrons                                                                         |
| `indicator` | `variant: 'quantity'`, `format` `compact` \| `label` \| `additional`, optional `meta` | `band`                                   | `compact` is `×N` and `label` is `Qty N` (hidden at 1). `additional` is `+N`, including `+1` |
| `indicator` | `variant: 'label'` (`label: string`)                                                  | `band`                                   | Value-only rows (for example `50 GP value`) with no control                                  |
| `group`     | `primary: ReactElement`, structured `secondary`                                       | `band` (secondary inline before primary) | Commerce stacks (price/grant preview + Add or quantity stepper)                              |

`utility` also tightens the surface end edge (see [Edge geometry contract](#edge-geometry-contract)).
A 36px stepper in a compact row grows the row through the slack gutters; heading and
description stay on their tracks and the stepper centers on the full row.

**Status and classification never use trailing.** Role labels (`Member`), availability
(`Unavailable`), and selection status (`Cannot afford`, `Required by class`) belong in `EntitySummary.status`.

There is no parallel `action` + `endSlot` + feature-specific trailing sibling on entity
surfaces. A destination chevron is an `indicator`, not an `action`. Whole-row navigation
belongs to the host; trailing indicators remain non-interactive.

**Classification is identity-adjacent.** `EntitySummaryModel.classification` renders in the
mixed heading phrase immediately after the title (`Title · Classification`). It is not a
trailing-rail value and must not be right-aligned via title `flex-1`, percentage width
caps, or `ml-auto`. The title may shrink and truncate when the content column is narrow,
but must not grow solely to push classification away from the name. `EntitySummary`'s outer
`flex-1` fills EntityAnatomyHost column 2; mixed-heading title growth is separate and forbidden.

---

## EntitySummary status lane

```text
EntitySummary parts            RowAnatomy cell
├── EntitySummaryHeading      → band   (heading · classification · headingEndValue)
├── EntitySummaryDescription  → meta
└── EntitySummaryStatus       → status (track offset owned by the cell, not the row)
    ├── EntitySummaryProvenanceItem[]   (provenance group, rendered first)
    └── EntitySummaryStatusItem[]       (status group)
```

`EntitySummaryModel.status` accepts structured `EntitySummaryStatusItem` values only:

| Kind              | Use                                                                           |
| ----------------- | ----------------------------------------------------------------------------- |
| `badge`           | Discrete state / callout — Member, Equipped, Spellcasting focus               |
| `text`            | Supporting annotation — ritual markers, disabled notes, warnings (not a dump) |
| `inactive`        | Circle-slash inactive metadata (search unavailable rows)                      |
| `validationError` | Master-detail validation indicator                                            |

`text` items take `variant: 'muted' | 'warning' | 'guidance'` — a plain visual tone only. Warning text renders as its own
status line under the description (e.g. a build advisory under `10 total · Fighter package ×8`); never concatenate
it into the description. Domain mapping (e.g. build advisories → status items) stays in the consuming feature.

`guidance` (`text-foreground`) reads at title ink, above the muted detail line. Use it for
requirement, recommendation, and source guidance. Text items may carry an optional `title`, which is
supplemental only: the label must stand on its own.

### Provenance vs status

`EntitySummaryModel.provenance` is a **separate slot** from `status`. Provenance says where an
owned quantity came from and offers the inline affordance that gives it back; status says what
the row's current state is.

| Slot         | Items                                                                           | Interactive |
| ------------ | ------------------------------------------------------------------------------- | ----------- |
| `provenance` | `{ kind: 'text' }` source segments, `{ kind: 'action' }` release/remove buttons | Yes         |
| `status`     | `EntitySummaryStatusItem` badges, text, inactive, validation errors             | No          |

Both render into the same `InlineMetadata` line — provenance group first, then status —
carrying `data-entity-summary-provenance` and `data-entity-summary-status`. Ownership
segments never become status items: they carry no `SelectionSignalCategory` and do not pass
through `resolveSelectionRowStatusItems`. Inline actions belong only to `provenance`; the
status group must stay free of buttons.

### Status composition

`EntitySummaryModel.statusComposition` picks the lane layout:

| Composition         | Layout                                                                                                | Use when                                                                                  |
| ------------------- | ----------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| `cluster` (default) | Items wrap with a gap                                                                                 | Independent states (Member, Equipped) or a standalone warning line                        |
| `metadata`          | One `InlineMetadata` line (`role="supporting"`, wrapping) with `·` between items; text renders inline | A single ordered sentence of badges then guidance (`[Cannot afford] · Required by class`) |

Character builder selection rows always use `metadata` and get their items from
`resolveSelectionRowStatusItems`. Do not build them by hand. See
[character-builder-picker-chrome.md](./character-builder-picker-chrome.md#selection-row-status-guidance-and-context-policy).

EntitySummary owns badge presentation. Badge size follows density: **compact → `sm`**, **comfortable → `md`**. Consumers must not pass hand-built `<Badge size="…">` or local `mt-1` around entity status.

---

## Add / Pending composition

Create-tab relationship composition (Building Organizations first) uses stable
`ContentEntityCard` rows inside `AddPendingWorkflow`. Ownership and mode rules
live in [create-flow.md](./create-flow.md#add--pending-workflow).

```text
AddPendingWorkflow
├── resting / pending → ContentEntityCard rows + overflow; optional empty state
└── composing slot    → CreateComposition* + domain-owned discovery / forms / child footer
```

**`ContentEntityCard` must not expand.** Do not add collapse, composer, or
relationship-kind props to CEC. Discovery uses CEC + trailing **Select**
(outline, `size="sm"`, `density="compact"`). Pending **Edit** leaves the row on
CEC and opens the focused composition composer in the `AddPendingWorkflow`
composing slot — sibling pending cards remain visible only while resting.

Zero-eligible discovery rows stay on CEC with a disabled trailing **Select** and
the authoritative reason in the entity status lane.

Pending-row edit switches to **composing** mode (focused composer + child footer).
That is not Add/discovery mode at the resting root. See
[create-flow.md](./create-flow.md#nested-composition-presentation) for nested
**composition** vs relationship-drawer **acquisition**.

---

## Relationship rows

Typed cross-content edges on detail pages use `EntityRowList.Row` →
`DetailEntityRow` → `EntityAnatomy`, not card shells. See
[cross-content-relationship-ui.md](./cross-content-relationship-ui.md).

---

## Closed consumer API

`EntityAnatomyHost`, CEC, and DEC deliberately expose no `className`, `style`, padding,
inset, header/body, or divider styling props. Provide semantic data and controls
through `entity`, `leading`, `trailing`, `headingHref`, and DEC `children` only.

`ContentCardHeading`, `ContentCardBody`, `EntityCardFrame`, `EntityAnatomy`, and
`EntityLeadingRail` are internal implementation details. Feature code uses the entity
surfaces above rather than composing those internals directly.

---

## Architectural enforcement

Guards and tests encode ownership — they are not the contract themselves, but they
prevent regression:

| Guard / test                               | Enforces                                                                     |
| ------------------------------------------ | ---------------------------------------------------------------------------- |
| `entity-alignment-matrix.stories.tsx`      | Real-browser geometry: every leading × trailing × depth × media combination  |
| `UtilityEdgeParity` story                  | Trailing utility end inset equals leading caret start inset                  |
| `card-recipes.stories.tsx` (`AllRecipes`)  | Every row-track recipe passes `expectRowAnatomyAligned`                      |
| `card-recipes.registry.test.ts`            | Every entity surface and row primitive has a classified recipe               |
| `row-anatomy-alignment.guard.test.ts`      | Retired align props banned; no self-align / `mt-*` compensation in anatomy   |
| `entity-anatomy.guard.test.ts`             | EntityAnatomyHost variants stay inset-free; hosts use Frame + Content        |
| `entity-surface.guard.test.ts`             | Entity-backed grants use DEC shell bridge, not generic ArrayItem card        |
| `entity-card-surface.contract.test.ts`     | Frame owns perimeter only; Content owns inset                                |
| `entity-card-host.contract.test.tsx`       | Single inset owner per host; CLI entity-card mode padding-free               |
| `collapsible-row-rhythm.contract.test.tsx` | Shared content inset across CEC/DEC/catalog; form-array CLI rhythm preserved |
| `disclosure-entity-card.test.tsx`          | DEC body present; CLI legacy indent absent; leading offset on frame          |
| `grant-array-disclosure-shell.test.tsx`    | Grant integration: DEC alignment, no CLI `content-column-indent`             |
| `collapsible-list-item.variants.test.ts`   | Entity-card body classes exclude legacy inset                                |
| `catalog-entity-row.stories.tsx`           | Flat + disclosure rhythm side-by-side; location picker drawer context        |
| `content-card.variants.test.ts`            | Mixed-heading title must not use `flex-1`, `%` caps, or right-push hacks     |
| `entity-summary.test.tsx`                  | Classification adjacent; density-sized badges; parts carry no track offsets  |
| `entity-summary-status.type.test.ts`       | Status prop is structured data, not ReactNode                                |
| `entity-anatomy-trailing.type.test.ts`     | Trailing action/group primary require ReactElement; closed secondary         |
| AGENTS.md component rule                   | No consumer padding overrides on entity surfaces                             |

---

## Known follow-up (code vs documented policy)

Documented policy is authoritative. These items may still exist in code and are tracked
for cleanup — do not weaken docs to match legacy patterns:

| Item                                           | Status                                                                      |
| ---------------------------------------------- | --------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| Non-entity ArrayItem CLI content-column indent | **Intentional** for anonymous form arrays only                              |
| `DetailEntityRow.endSlot`                      | **Intentional** for non-entity detail hosts — not for EntityAnatomyHost/DEC |
| Catalog picker entity rows                     | `CatalogEntityPickerSheet` → `CatalogEntityRow`                             | Mandatory; perimeter on `EntityCardFrame`, inset on `EntityCardContent` |

---

## Disabled state

CEC and DEC expose presentational disabled state. Hosts still own interactive
`disabled`, `aria-disabled`, and focus behavior.

---

## Card image pipeline

Identity artwork follows one pipeline from role resolution to a geometry-only frame:

```text
getContentDisplayImage / resolveMediaRoleDisplayImage → ContentDisplayImage
  → dashboard ContentMediaImage (crop math) or ContentMediaFallback (same frame)
  → @rpg/ui IdentityFrame (compact inset) / aspect frames (primary, builderCard, …)
  → surface adapter (card, table cell, preview rail, campaign name row)
```

**Identity frame** (`IdentityFrame`, shared tokens with `IconContainer`) clips and
sizes only. Crop math stays in the dashboard media layer.

**Utility-rail invariant:** leading utilities (grip, caret) own their rail. Identity
media begins at the same content-column inset and the same gap to the heading whether
or not that rail is present. Never set `leading: true` on entity card frames to
make room for an image.

### Layout modes

| Mode          | Surfaces                                                   | Geometry                                                                                                                                                                                        |
| ------------- | ---------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Inset row     | Entity cards, preview-rail identity, radio rows with media | Content-column gap (`gap-2` compact / `gap-4` comfortable); comfortable titles use `entity-card-heading-comfortable` (19px); media grows the RowAnatomy band track; heading centers on the band |
| Inline mark   | Single campaign name rows                                  | `gap-2`, `items-center`, `IdentityFrame` size `inline`                                                                                                                                          |
| Stacked bleed | Species/class radio cards; character list cards            | Full-bleed `builderCard` (2:1) derives a window inside the saved **primary** role crop when present, otherwise cover at the surface default. Text padding sits under the image band.            |

Portrait role copy targets compact circle/square tokens. Saved role presentation (crop,
then focal) wins over surface defaults for both system and upload sources.
