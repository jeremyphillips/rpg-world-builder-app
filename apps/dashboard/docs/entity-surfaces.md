# Entity surfaces contract

**Component selection:** start at [card-guide.md](./card-guide.md). This document is the authoritative contract for entity surface behavior, geometry, interaction boundaries, and enforcement.

Entity identity uses one stack:

```text
EntitySummaryModel → EntitySummary parts → EntityAnatomy (RowAnatomy cells) → embedded host | EntityCard (static) | EntityCard variant disclosure
```

`EntitySummaryModel` contains identity content only: `heading`, optional
`classification`, `description`, `status`, and `media`. It never carries navigation.
`EntityAnatomyHost` adds optional heading navigation (`headingHref`), a single
`EntityAnatomyLeading` seam, semantic trailing (`action` | `utility` | `indicator` | `group`,
with optional inline `meta`), and density.

Vertical alignment is owned by the shared row-track grid in `@rpg/ui`
(`RowAnatomy` — band / meta / status tracks with slack gutters). Entity anatomy places
each slot into a named column and a track; it never self-aligns or offsets cells. See
[`packages/ui/docs/row-anatomy.md`](../../../packages/ui/docs/row-anatomy.md).

**Each visual concern has one owner.** When debugging inset, alignment, or chrome, ask
which semantic layer owns the concern — see [Ownership hierarchy](#ownership-hierarchy).

### Boundary with generic `@rpg/ui` Card

Hub tiles, starter actions, and auth **form chrome** use generic [`Card`](../../../packages/ui/docs/ui-architecture.md) (`header` / `footer`, optional `stretch`, shell `ui-card--compact|comfortable|spacious`). Header copy comes from shell CSS vars (`ui-card__title` / `ui-card__description`) — **not** from `Heading variant="card"` or `Text small` at call sites.

**Entity identity in this doc** uses `EntityCardFrame` + `EntitySummary`. Heading size follows the shared density ladder: compact 14/12, comfortable 16/14, spacious 19/14 (`--ui-copy-title-size` / `--ui-copy-supporting-size`). Comfortable is the default. Set `density="spacious"` when a 19px heading is required. Shared **`--ui-card-inset-*`** steps align with generic Card, including `spacious`.

Do not replace `EntityCard`, `CatalogCard`, or catalog browse rows with generic `Card` for catalog identity rows.

## Module layout (`lib/entity/`)

```text
summary/   — EntitySummaryModel, EntitySummary parts (heading / description / status), projection, media
anatomy/   — EntityAnatomy, EntityAnatomyHost, trailing cells, leading rail, surface edges, geometry tokens
surfaces/  — EntityCard facade, catalog cards; imports anatomy/ + summary/ only via dependency direction
  cards/content/     EntityCard (public), EntityCardStaticRenderer + EntityCardFrame (internal)
  cards/disclosure/  EntityCardDisclosureRenderer, DisclosureEntityCardHeader (internal)
  catalog/           CatalogCard, CatalogEntityPickerSheet
  drawer/            DrawerEntityBlock (compact drawer identity — see [feature-structure.md](./feature-structure.md))
```

Public card API vs internal renderers:

```text
EntityCard (public)
├── EntityCardStaticRenderer       variant="static" (default)
└── EntityCardDisclosureRenderer   variant="disclosure"
        ↓
EntityCardFrame / EntityAnatomy
```

Dependency direction: `surfaces → anatomy → summary`. `summary/` must not import `anatomy/`;
`anatomy/` must not import `surfaces/`. Shared CSS var **names** live in
`anatomy/entity-geometry.tokens.ts`; surface CVA **values** live in
`surfaces/dash-entity-surface.variants.ts` + `dash-entity-surface.css`.

## Storybook reference

Side-by-side recipes live in dashboard Storybook **Recipes / Cards and Rows** ([card-recipes](../src/stories/card-recipes/)). Toggle **Show anatomy** in the toolbar to outline row-track grids and cells. For which surface to pick, use [card-guide.md](./card-guide.md).

### Interactive list chrome vs semantic hosts

Visual row recipes (`InteractiveListRow`, `InteractiveListSize`, slots) are shared; the
**host** sets ARIA semantics. Entity choice rows must render identity through these
primitives — not ad-hoc menu item class stacks. Menu rows derive highlight/wash from Radix
`data-[highlighted]` only (no parallel `:hover` rail on `MenuChoiceRow`).

| Mode                                    | Visual chrome                                                                                             | Semantic host                                  | Text                                           |
| --------------------------------------- | --------------------------------------------------------------------------------------------------------- | ---------------------------------------------- | ---------------------------------------------- |
| Combobox / true single-select           | `InteractiveList` + `ComboboxOptionRow`                                                                   | `listbox` / `option`, truthful `aria-selected` | `IdentityRow`                                  |
| Action choice menu / split-button items | `MenuChoiceRow` (`ui-menu-item` + optional description) in `dropdownMenuChoiceContentClasses` width shell | `menu` / `menuitem`                            | `DropdownMenuItemContent` label + description  |
| Search hit                              | `InteractiveListRow` slots                                                                                | link                                           | `IdentityRow`                                  |
| Detail / relationship section           | `DetailEntityRow` / `EntityRowList`                                                                       | section row                                    | EntitySummary parts → `IdentityRowHeadingLine` |
| Bordered catalog + disclosure           | `CatalogCard` / `EntityCard` disclosure                                                                   | card / disclosure                              | anatomy + card frame                           |

Campaign-unavailable search hits use entity `inactive` status in the identity status slot
only — not a duplicate trailing badge.

### Entity surface projection (cards, catalogs, drawer subject bands)

Compact catalog rows, bordered cards, and `DrawerEntityContext` share one **data-only**
identity contract and one projector (`projectEntitySurfaceConfig` /
`projectEntitySurfaceIdentityToSummaryModel`):

- Feature display modules return `EntitySurfaceIdentity` (`heading`, optional
  `metadata` segment line, `classification`, `status`, optional `displayImage`, required
  semantic `fallback`) via domain builders such as `buildCharacterEntityCardModel`,
  `buildLocationEntityCardModel`, `buildOrganizationEntityCardModel`, and
  `buildEquipmentEntitySurfaceIdentity`. No JSX, no media nodes, no row chrome.
  **Entity surface projection** paints fill-only thumbnail content (`anatomyFill`);
  `EntityAnatomy` owns
  final dimensions via `--ui-anatomy-leading-size`. Maps `metadata` segments onto
  `EntitySummaryModel.supportingMetadata` for anatomy to render.
- Callers pass `EntitySurfaceConfig` (`identity`, optional `details`, optional
  `inlineAction`) into `CatalogEntitySurfaceRow`, `CatalogEntitySurfaceRow`,
  `DrawerEntityContext`, or `createCatalogCardRenderer({ buildSurface })`.
- `DrawerEntityContext` uses the same projection as cards; only drawer band chrome differs.
  Drawer-only utilities pass `trailing` (`EntityAnatomyTrailing`) — not extra fields on
  `EntitySurfaceConfig`.
- Heading label buttons use **`inlineAction` only** (`label`, `onClick`, `disabled?`, `loading?`). Surfaces render locked compact picker buttons.
- **Allowed exceptions:** disclosure-body commit `Button`s inside `details` / disclosure body children; `trailing.kind: 'utility'` for inventory steppers and icon-remove controls; `trailing.kind: 'group'` for commerce stacks.

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

Foundational interaction and styling policy is documented in
[AGENTS.md](../../../AGENTS.md#styling-conventions),
[`packages/ui/docs/ui-architecture.md`](../../../packages/ui/docs/ui-architecture.md), and
[`packages/ui/docs/semantic-style-layers.md`](../../../packages/ui/docs/semantic-style-layers.md).
Color and surface tokens: [`packages/ui/docs/design-tokens.md`](../../../packages/ui/docs/design-tokens.md).
Card primitives **consume** that policy; they do not redefine focus rings, hit targets,
drag chrome, or interactive-row fills.

### Ownership audit matrix

| Concern                                    | Target owner                        | Notes                                                               |
| ------------------------------------------ | ----------------------------------- | ------------------------------------------------------------------- |
| Card perimeter                             | `EntityCardFrame`                   | Border, radius, surface identity, disabled chrome; **no padding**   |
| Card header/content inset                  | `EntityCardContent`                 | Vertical inset; horizontal inset via frame edge vars                |
| Surface edge inset                         | `EntityCardFrame`                   | `resolveEntitySurfaceEdges` → `entitySurfaceInsetVariants` per edge |
| Vertical alignment                         | `RowAnatomy` (`@rpg/ui`)            | Band / meta / status tracks; cells never self-align or offset       |
| Section vs card inset                      | Feature section / host              | e.g. equipment panel `px-4 py-4` is section padding, not card inset |
| Embedded row inset                         | Host                                | SearchResultRow, master-detail list — not entity card surfaces      |
| EntityAnatomyHost columns                  | EntityAnatomyHost anatomy           | Named lines `[leading] [media] [content] [trailing]`                |
| Leading content offset                     | `EntityCardFrame` (when needed)     | `--entity-content-offset` on frame root for aligned sibling regions |
| Trailing rail                              | EntityAnatomyHost semantic trailing | `action` \| `utility` \| `indicator` \| `group` — no `endSlot`      |
| Disclosure behavior                        | CollapsibleListItem                 | Collapse state, ARIA, structural DOM                                |
| CLI header vertical rhythm                 | CollapsibleListItem                 | **Default rows only** — not `rowLayout="entity-card"`               |
| CLI body frame                             | CollapsibleListItem                 | `collapsibleListItemBodyFrameClasses` (divider + `py-3`)            |
| EntityCard disclosure / catalog body inset | Surface body wash variants          | Body tone + entity inline start/end on shared body frame            |
| CLI body spacing (entity-card)             | **None**                            | `rowLayout="entity-card"` → behavior + structural `p-0` reset only  |
| Drag chrome                                | Foundational UI                     | `dragHandleVariants`, host reveal contract                          |
| Control/focus chrome                       | Foundational UI                     | `iconGhostControlVariants`, Button focus stack                      |
| Separators                                 | Host                                | List/section separators, not EntityAnatomyHost                      |
| Form-array styling                         | EntityCard disclosure + form rhythm | Form owns registration; disclosure renderer owns card geometry      |

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
- `density` when embedded without a density-publishing shell (e.g. search host with its own inset). When the collection shell publishes copy scale (`DestinationList`, `Card`, …), omit anatomy `density` and inherit CSS variables; pass `density` only to override or to activate compact React-only rules (badge `sm`, caption classes).

### Consumers must not

- Add `px-*` / `py-*` to anatomy or EntityAnatomyHost root to fix host or card misalignment
- Introduce parallel trailing APIs (`endSlot`, `headingEndSlot`) on entity surfaces
- Publish `--entity-content-offset` (only surfaces with aligned sibling regions)

Optional DOM children must never alter grid-track ownership: every cell names its column
(`leading`, `media`, `content`, `trailing`) and its track slot. Absent slots leave their
`auto` column at zero width.

### Leading utilities contract

| API                                    | Scope                 | Rule                                                                           |
| -------------------------------------- | --------------------- | ------------------------------------------------------------------------------ |
| `EntityAnatomyHost.leading`            | Public embedded hosts | Exactly **one** utility when set — maps to `[leading]` internally              |
| `EntityAnatomy.leadingUtilities`       | Internal / surfaces   | Ordered list of utilities; **Anatomy is the sole `EntityLeadingRail` wrapper** |
| EntityCard disclosure / DER disclosure | Surface composition   | Pass explicit utility nodes — never pre-wrap `EntityLeadingRail`               |

Surfaces with disclosed sibling content publish `--entity-content-offset` on their root
from utility **count** and **density**. Anatomy and `EntityLeadingRail` establish the
coordinate physically; they never publish offset.

**Combined entity-card host invariant:** `EntityCard` (static and disclosure) and `CatalogCard` share
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

| Host tone     | Used by                         | Resolver                                        |
| ------------- | ------------------------------- | ----------------------------------------------- |
| `quiet`       | `EntityCard`, `CatalogCard`     | `cardSurfaceVariants({ tone: 'quiet' })`        |
| (interactive) | Selectable catalog / radio rows | `ui-card--interactive` + `selected` when chosen |

Rhythm must **never** depend on `collapsible`, `details`, or collapsed state.

---

## EntityCard — static (default)

Public API: `<EntityCard … />` (omit `variant` or `variant="static"`). Implementation: internal `EntityCardStaticRenderer`.

```text
EntityCard
└── EntityCardFrame (surface="card")
    └── EntityCardContent
        └── EntityAnatomy
```

### Owns

- Composition only — delegates perimeter to `EntityCardFrame`, inset to `EntityCardContent`

### Consumer supplies

- `entity`, `density`
- Non-navigable static: optional `leading`, optional semantic `trailing`, optional `headingInline`, optional `disabled`
- Navigable static: required `link` (single `Link` or `<a>`), optional `showNavigationChevron` — no `leading`, `trailing`, `headingInline`, or `disabled`. Entity copy must not nest interactive controls.

### Does not own

- Disclosure behavior or body wash
- `headingHref` (disclosure and `EntityAnatomyHost` only)
- Domain content below the identity block
- Host collection inset

### Consumers must not

- Wrap `EntityCard` in a feature card wrapper with duplicate border/padding
- Calculate leading indentation locally

---

## EntityCard — `variant="disclosure"`

Public API: `<EntityCard variant="disclosure" … />`. Implementation: internal `EntityCardDisclosureRenderer`.

Disclosure `EntityCard` composes the shared frame/content stack with CLI disclosure behavior.
`DetailEntityRow` is outside this contract.

```text
EntityCard
└── EntityCardFrame (surface="subtle")
    └── CollapsibleListItem (rowLayout="entity-card", density)
        ├── EntityCardContent
        │   └── EntityCardHeader → EntityAnatomy
        └── body — shared body frame + disclosure body wash tone + entity inline inset
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
- **Flat catalog rows** (`CatalogCard` without `collapsible`): frame + `EntityCardContent` +
  `EntityAnatomyHost` only — no `CollapsibleListItem` shell
- **Disclosure catalog rows:** `CollapsibleListItem` with `rowLayout="entity-card"`; header
  inset still owned by `EntityCardContent`
- **Invariant:** flat and disclosure catalog headers share the same compact content inset class
  at the same density

### Consumer supplies

- `entity`, optional `dragHandleProps`, semantic `trailing`, domain `children`
- Collapse control wiring via disclosure props (`collapsed`, `onToggleCollapse`, …)

### Does not own

- CollapsibleListItem state-machine internals
- Domain field rhythm inside `children` (form `itemBodyStackClasses`, field gaps)
- Section/list surrounding inset outside the card — sibling picker cards use
  `catalogPickerCardListClasses` on `CatalogPickerSheetResults` only (see
  [drawer-shell.md](./drawer-shell.md#card-list-rhythm-picker-results))

### Consumers must not

- Add card inset wrappers around disclosure `EntityCard`
- Calculate grip/caret indentation or compensate with negative margins
- Position trailing controls outside EntityAnatomyHost anatomy
- Rely on CLI `--content-column-indent` or duplicate body vertical padding on adapter wrappers

### CollapsibleListItem entity-card mode

When `rowLayout="entity-card"`, CollapsibleListItem owns **disclosure behavior and
structural plumbing only**. It does **not** own entity-card header/body inset or entity
leading geometry.

**Single ownership switch:** `rowLayout="entity-card"` — not a combination of
`rowLayout` and `toolbarLeadingChrome`. Disclosure renderer composition sets
`toolbarLeadingChrome="none"` because leading controls live in `EntityLeadingRail`; body
inset ownership follows from `rowLayout` alone.

CLI entity-card mode must contribute **no competing**:

- `pl` / `pr` / `pt` / `pb` on the body slot
- `--content-column-indent` / `--content-inline-start` on the shell

Disclosure body wash owns all horizontal and block inset.

---

## CollapsibleListItem (entity-card hosts)

### Owns

- Collapse behavior, ARIA ids, keyboard disclosure
- Structural shell (`p-0`, header row flex) for entity-card layout
- Geometry tokens (`--leading-chrome-size`, `--leading-chrome-count`) without indent vars

### Does not own

- Entity-card header inset
- Entity-card body inset
- Entity content offset (disclosure frame root publishes `--entity-content-offset`)

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
`EntityAnatomyHost` or `EntityCard` (either variant). See
[cross-content-relationship-ui.md](./cross-content-relationship-ui.md).

### Catalog entity picker rows

Entity-backed catalog pickers **must** use `CatalogEntityPickerSheet` → `CatalogCard`.
Raw `CatalogPickerSheet` remains for generic/non-entity catalogs only.

```text
CatalogCard
└── EntityCardFrame (surface="catalogRow")
    └── CollapsibleListItem (rowLayout="entity-card")
        ├── EntityCardContent
        │   └── EntityAnatomyHost | EntityCardHeader
        └── details? (body wash)
```

| Layer                                    | Owns                                                                                      |
| ---------------------------------------- | ----------------------------------------------------------------------------------------- |
| `EntityCardFrame`                        | Border, radius, `catalogRow` surface, inset CSS vars, content-offset when leading present |
| `EntityCardContent`                      | Header horizontal + vertical inset (flat and disclosure modes)                            |
| CLI (`rowLayout="entity-card"`)          | Disclosure behavior, structural `p-0` reset — no catalog chrome                           |
| `EntityAnatomyHost` / `EntityCardHeader` | Three-column identity                                                                     |
| Body wash variants                       | Optional expanded details inset                                                           |

Features supply entity model, trailing semantics, and optional per-item `details` via
`renderEntityRow` or `createCatalogCardRenderer`. `rowLayout="entity-card"` is
internal to `CatalogCard` — not a feature concern.

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
`EntityDisclosureArrayItemShell` → `EntityCard`; the form layer owns RHF
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
Embedded hosts own collection inset. `EntityCardContent` owns header inset; `EntityCard` and `CatalogCard` pass density to both `EntityCardContent` and internal anatomy.

Set density **exactly once**:

- standalone cards: `EntityCard` static or disclosure;
- embedded hosts with their own inset but no copy-scale publisher: `EntityAnatomyHost` `density`;
- embedded hosts inside a density-publishing collection (`DestinationList`, …): list (or section) owns density; anatomy inherits — do not forward a second density;
- never size a shell and nested item independently.

Entity/content **density** (`compact` | `comfortable`) is unrelated to form-control
**size** tokens — do not force unrelated systems into one scale because both use names
like `compact`.

Compact entity titles stay 14px (`text-sm`). Classification, its middle dot, and title-line
end text are 12px (`text-xs` on the classification and dot, `text-style-caption` on the
heading end slot). Price and grant-preview text in the trailing group secondary slot are
12px (`text-xs`). Trailing meta and value labels (`Purchased · 10 GP`) are 12px
(`text-xs`). List rows keep a single shared size and do not use the heading recipe.
Trailing-rail quantity marks stay 14px.

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
`EntityAnatomy` must align to column 2 (EntityCard disclosure disclosed body, DER disclosure body).
Static `EntityCard`, master-detail, and embedded `EntityAnatomyHost` hosts need anatomy layout only — static `EntityCard` may
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

### Leading kinds

Single leading controls on `EntityCard` / `EntityAnatomyHost` use **`EntityAnatomyLeading`**
(mirror of trailing kinds). Anatomy resolves the row track via `resolveEntityLeadingCell`:

| Kind        | Row track | Use                                                                |
| ----------- | --------- | ------------------------------------------------------------------ |
| `title`     | `band`    | Grip, checkbox, granted icon — aligned with the heading row        |
| `selection` | `full`    | Catalog picker radio — vertically centered like trailing `utility` |

Disclosure rows with grip + caret still use `leadingUtilities` on `EntityAnatomy` (always
title-band cells).

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
never choose their own alignment. `meta` renders as muted `text-xs` before the control
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
├── EntitySummaryHeading      → band   (heading · classification · headingEndValue · optional headingInline after title)
├── EntitySummaryDescription  → meta
└── status cell                → status (track offset owned by the cell, not the row)
    ├── PickerSelectionStateLine        (resolved copy, stacked above status)
    └── EntitySummaryStatus
        ├── EntitySummaryProvenanceItem[]   (provenance group, rendered first)
        └── EntitySummaryStatusItem[]       (status group)
```

`EntitySummaryModel.selectionState` stores the resolved line (`label` plus optional provenance strings), not a semantic kind. The picker resolver owns that mapping. The line is a check icon and an emphasized state word, then muted provenance joined with `InlineMetadata`. It is not a badge and not a `SelectionSignalCategory`. Picker ownership text (`Package`, `Purchased`, `Common choice`) belongs on this line so the status line does not repeat it. Warnings stay on the status line. Release and remove actions stay on `provenance`.

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

EntitySummary owns badge presentation in the **status lane**. Badge size follows the shared entity-row inline ladder: **compact / comfortable → `sm`**, **spacious → `md`** (`resolveEntityRowInlineBadgeSize` from `@rpg/ui`). Consumers must not pass hand-built `<Badge size="…">` or local `mt-1` around entity status.

Title-line **heading accessories** (badges beside `IdentityRowHeadingLine.headingEnd` on generic `Card` stacks) use the same resolver. See [packages/ui/docs/row-anatomy.md](../../../packages/ui/docs/row-anatomy.md#heading-accessories). Generic `Card` footer labeled actions: [ui-architecture.md](../../../packages/ui/docs/ui-architecture.md#card-footer-labeled-actions). **`headingEndValue`** numerals keep title-scale emphasis and are not badge accessories.

---

## Add / Pending composition

Create-tab relationship composition (Building Organizations first) uses stable
`EntityCard` rows inside `AddPendingWorkflow`. Ownership and mode rules
live in [create-flow.md](./create-flow.md#add--pending-workflow).

```text
AddPendingWorkflow
├── resting / pending → EntityCard rows + overflow; optional empty state
└── composing slot    → CreateComposition* + domain-owned discovery / forms / child footer
```

**`headingInline`** — optional intrinsic-width slot immediately after the title (not `headingEndValue`). Heading links wrap title text only. The slot is marked `data-heading-inline`, which forces a nested `BooleanField` to `sm`. Card frames publish `data-content-density` so a compact card resolves that field to `sm` and a comfortable card to `md`, ahead of the surrounding form density. Trailing utility controls keep their own `xs` scale.

**`EntityCard` must not expand.** Do not add collapse, composer, or
relationship-kind props to `EntityCard`. Discovery uses `EntityCard` + trailing **Select**
(outline, `size="sm"`, `density="compact"`). Pending **Edit** leaves the row on
`EntityCard` and opens the focused composition composer in the `AddPendingWorkflow`
composing slot — sibling pending cards remain visible only while resting.

Zero-eligible discovery rows stay on `EntityCard` with a disabled trailing **Select** and
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

`EntityAnatomyHost` and `EntityCard` deliberately expose no `className`, `style`, padding,
inset, header/body, or divider styling props. Provide semantic data and controls
through `entity`, `leading`, `trailing`, `headingHref`, and disclosure `children` only.

The legacy `@rpg/ui` `ContentCard` shell (`ContentCard`, `ContentCardBody`, `ContentCardHeading`) is retired. `EntityCardFrame`, `EntityAnatomy`, and
`EntityLeadingRail` remain internal implementation details. Feature code uses the entity
surfaces above rather than composing those internals directly.

---

## Architectural enforcement

Guards and tests encode ownership — they are not the contract themselves, but they
prevent regression:

| Guard / test                               | Enforces                                                                                          |
| ------------------------------------------ | ------------------------------------------------------------------------------------------------- |
| `entity-alignment-matrix.stories.tsx`      | Real-browser geometry: every leading × trailing × depth × media combination                       |
| `UtilityEdgeParity` story                  | Trailing utility end inset equals leading caret start inset                                       |
| `card-recipes.stories.tsx` (`AllRecipes`)  | Every row-track recipe passes `expectRowAnatomyAligned`                                           |
| `card-recipes.registry.test.ts`            | Every entity surface and row primitive has a classified recipe                                    |
| `row-anatomy-alignment.guard.test.ts`      | Retired align props banned; no self-align / `mt-*` compensation in anatomy                        |
| `entity-anatomy.guard.test.ts`             | EntityAnatomyHost variants stay inset-free; hosts use Frame + Content                             |
| `entity-surface.guard.test.ts`             | Entity-backed grants use `EntityCardDisclosureRenderer` shell bridge, not generic ArrayItem card  |
| `entity-card-surface.contract.test.ts`     | Frame owns perimeter only; Content owns inset                                                     |
| `entity-card-host.contract.test.tsx`       | Single inset owner per host; CLI entity-card mode padding-free                                    |
| `collapsible-row-rhythm.contract.test.tsx` | Shared content inset across EntityCard static/disclosure/catalog; form-array CLI rhythm preserved |
| `entity-card-disclosure-renderer.test.tsx` | Disclosure body present; CLI legacy indent absent; leading offset on frame                        |
| `grant-array-disclosure-shell.test.tsx`    | Grant integration: disclosure alignment, no CLI `content-column-indent`                           |
| `collapsible-list-item.variants.test.ts`   | Entity-card body classes exclude legacy inset                                                     |
| `catalog-card.stories.tsx`                 | Flat + disclosure rhythm side-by-side; location picker drawer context                             |
| `content-card.variants.test.ts`            | Mixed-heading title must not use `flex-1`, `%` caps, or right-push hacks                          |
| `entity-summary.test.tsx`                  | Compact title 14px; classification, dot, and end text 12px; no track offsets                      |
| `entity-summary-status.type.test.ts`       | Status prop is structured data, not ReactNode                                                     |
| `entity-anatomy-trailing.type.test.ts`     | Trailing action/group primary require ReactElement; closed secondary                              |
| AGENTS.md component rule                   | No consumer padding overrides on entity surfaces                                                  |

---

## Known follow-up (code vs documented policy)

Documented policy is authoritative. These items may still exist in code and are tracked
for cleanup — do not weaken docs to match legacy patterns:

| Item                                           | Status                                                                                          |
| ---------------------------------------------- | ----------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| Non-entity ArrayItem CLI content-column indent | **Intentional** for anonymous form arrays only                                                  |
| `DetailEntityRow.endSlot`                      | **Intentional** for non-entity detail hosts — not for EntityAnatomyHost/disclosure `EntityCard` |
| Catalog picker entity rows                     | `CatalogEntityPickerSheet` → `CatalogCard`                                                      | Mandatory; perimeter on `EntityCardFrame`, inset on `EntityCardContent` |

---

## Disabled state

`EntityCard` exposes presentational disabled state. Hosts still own interactive
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

| Mode          | Surfaces                                                   | Geometry                                                                                                                                                                                                                             |
| ------------- | ---------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Inset row     | Entity cards, preview-rail identity, radio rows with media | Content-column gap (`gap-2` compact / `gap-4` comfortable and spacious); titles use the shared copy scale (16px comfortable, 19px spacious); leading media spans the identity stack (`stretch`); heading band stays `control` height |
| Inline mark   | Single campaign name rows                                  | `gap-2`, `items-center`, `IdentityFrame` size `inline`                                                                                                                                                                               |
| Stacked bleed | Species/class radio cards; character list cards            | Full-bleed `builderCard` (2:1) derives a window inside the saved **primary** role crop when present, otherwise cover at the surface default. Text padding sits under the image band.                                                 |

Portrait role copy targets compact circle/square tokens. Saved role presentation (crop,
then focal) wins over surface defaults for both system and upload sources.
