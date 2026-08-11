# Entity presentation contract

Entity identity uses one stack:

```text
EntitySummaryModel → EntitySummary → EntityItemAnatomy → embedded host | ContentEntityCard | DisclosureEntityCard
```

`EntitySummaryModel` contains identity content only: `heading`, optional
`classification`, `description`, `status`, and `media`. It never carries navigation.
`EntityItem` adds optional heading navigation (`headingHref`), a single leading utility,
semantic trailing (`action` | `indicator` | `group`), and density.

**Each visual concern has one owner.** When debugging inset, alignment, or chrome, ask
which semantic layer owns the concern — see [Ownership hierarchy](#ownership-hierarchy).

## Choose a surface

| Need                                                                                   | Surface                                |
| -------------------------------------------------------------------------------------- | -------------------------------------- |
| Identity inside a search result, combobox, preview, destination, or master-detail host | `EntityItem`                           |
| Bordered static identity                                                               | `ContentEntityCard`                    |
| Bordered identity with expandable domain content                                       | `DisclosureEntityCard`                 |
| Detail hierarchy or typed relationship                                                 | `DetailEntityRow` / `RelationshipList` |
| Anonymous form value or choice affordance                                              | Purpose-built form/choice component    |

The host keeps its own navigation, hover, selection, separators, drag behavior, and
domain controls. Never put a full-row link in `EntitySummaryModel`; when a host owns
full-row navigation, omit `EntityItem.headingHref`.

---

## Ownership hierarchy

Documentation and code follow this stack. Lower layers consume upper-layer policy; they
do not redefine it.

```text
Foundational UI policy          (@rpg/ui — focus, icon controls, drag, interactive rows)
        ↓
Entity anatomy                  (EntityItem — three-column grid, leading/trailing rails)
        ↓
Surface/card shell              (CEC, DEC — border, density inset, disclosure geometry)
        ↓
Host/collection structure       (search rows, master-detail, detail sections, catalogs)
        ↓
Feature/domain content          (form fields, section panels, domain rhythm)
```

Foundational interaction policy is documented in
[`packages/ui/docs/design-tokens.md`](../../../packages/ui/docs/design-tokens.md) and
the semantic style layers migration. Card primitives **consume** that policy; they do
not redefine focus rings, hit targets, drag chrome, or interactive-row fills.

### Ownership audit matrix

| Concern                        | Target owner                 | Notes                                                                           |
| ------------------------------ | ---------------------------- | ------------------------------------------------------------------------------- |
| Card inset                     | CEC / DEC shell              | Density-aware px/py on surface wrappers                                         |
| Section vs card inset          | Feature section / host       | e.g. equipment panel `px-4 py-4` is section padding, not card inset             |
| Embedded row inset             | Host                         | SearchResultRow, master-detail list, catalog picker row                         |
| EntityItem columns             | EntityItem anatomy           | leading → col 1; content → col 2; trailing → col 3                              |
| Leading offset                 | Surface root                 | `--entity-leading-offset` on DEC `article`, CEC frame, or embedded `EntityItem` |
| Trailing rail                  | EntityItem semantic trailing | `action` \| `indicator` \| `group` — no parallel entity `endSlot`               |
| Disclosure behavior            | CollapsibleListItem          | Collapse state, ARIA, structural DOM                                            |
| DEC header inset               | DEC                          | `disclosureEntityCardHeaderPaddingVariants`                                     |
| DEC body inset                 | DEC                          | Body wash + inline start/end + block rhythm                                     |
| CLI body spacing (entity-card) | **None**                     | `rowLayout="entity-card"` → structural wrapper only                             |
| Drag chrome                    | Foundational UI              | `dragHandleVariants`, host reveal contract                                      |
| Control/focus chrome           | Foundational UI              | `iconGhostControlVariants`, Button focus stack                                  |
| Separators                     | Host                         | List/section separators, not EntityItem                                         |
| Form-array styling             | DEC + form field rhythm      | Form owns registration; DEC owns card geometry                                  |

---

## EntityItem

### Owns

- Three-column placement (`leading` | content | trailing)
- Leading-rail geometry and content-start alignment via `--entity-leading-offset` consumer
- EntitySummary composition inside the content column
- Semantic trailing seam (`action` | `indicator` | `group`)

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

- Add `px-*` / `py-*` to anatomy or EntityItem root to fix host or card misalignment
- Introduce parallel trailing APIs (`endSlot`, `headingEndSlot`) on entity surfaces
- Publish `--entity-leading-offset` (surface root publishes once)

Optional DOM children must never alter grid-track ownership: leading → column 1; content
→ column 2 always; trailing → column 3.

---

## ContentEntityCard

### Owns

- Card surface chrome (border, radius, background, disabled presentation)
- Density-aware surface inset on the card frame
- `--entity-leading-offset` publication on `EntityCardFrame`

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

DEC is the **sole owner** of entity disclosure header/body geometry.

```text
DisclosureEntityCard (article)
├── CollapsibleListItem (rowLayout="entity-card")
│   ├── header
│   │   └── EntityItemAnatomy (inset-free)
│   └── body (DEC body wash owns all inset)
├── divider (edge-to-edge on shell)
└── domain children
```

### Owns

- Card surface chrome and disabled presentation on `article`
- Density-aware **header** inset (`disclosureEntityCardHeaderPaddingVariants`)
- `--entity-leading-offset` publication on `article`
- Header/body divider and body wash
- Complete **body** inset: inline-start = density + leading offset; inline-end = density; block rhythm via density

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
- Position trailing controls outside EntityItem anatomy
- Rely on CLI `--content-column-indent` or CLI body `pt-3` for alignment

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
- Entity leading offset (DEC `article` publishes `--entity-leading-offset`)

Non-entity ArrayItem rows (`rowLayout="default"`) retain legacy content-column indent
via CLI — that path is for anonymous form arrays, not entity-backed disclosure cards.

---

## Hosts (embedded EntityItem)

Search, master-detail, catalogs, relationship lists, and similar hosts own:

- Row inset where the host defines it (`px`/`py`, hover, selection)
- Separators, grouping, scrolling, navigation hit targets

```text
SearchResultRow          → owns px/py + hover + separator context
  EntityItem             → owns leading | content | trailing
```

Do not repair missing host inset by adding padding back into EntityItem. Relationship
rows may use different host inset than search; shared anatomy does not imply identical
collection spacing.

Detail and relationship rows compose `DetailEntityRow` → `EntityItemAnatomy`. Non-entity
detail primitives may use `endSlot` for utility controls — that API does not apply to
`EntityItem`, CEC, or DEC. See
[cross-content-relationship-ui.md](./cross-content-relationship-ui.md).

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

`EntityItemAnatomy` owns identity typography, rhythm, media/leading/trailing geometry.
Embedded hosts own collection inset. CEC and DEC own bordered shell inset and pass
density to internal anatomy.

Set density **exactly once**:

- standalone cards: CEC or DEC;
- embedded hosts: `EntityItem` + host-owned row inset;
- never size a shell and nested item independently.

Entity/content **density** (`compact` | `comfortable`) is unrelated to form-control
**size** tokens — do not force unrelated systems into one scale because both use names
like `compact`.

---

## Leading offset contract

Leading utilities (grip, disclosure caret, or a single host utility) determine
content-start via `--entity-leading-offset`, published once on the surface root
(DEC `article`, CEC `EntityCardFrame`, embedded `EntityItem` when no outer surface
already published). `EntityItemAnatomy` and `EntityLeadingRail` consume the var only.

DEC body inline-start = density inset + `--entity-leading-offset`. Inline-end = density
inset only — trailing header actions never change disclosed content end padding.

**Behavior** owns what a control does (collapse, drag). **Entity anatomy** owns where it
lives. Do not use CLI `chromeCount` or `--content-column-indent` as a second entity
offset system.

---

## Trailing kinds

Entity surfaces use one trailing seam:

| Kind        | Use                                               |
| ----------- | ------------------------------------------------- |
| `action`    | Add, delete, overflow, selection controls         |
| `indicator` | Destination chevrons, quiet `×qty` labels         |
| `group`     | Commerce stacks (qty + Add, secondary price/meta) |

There is no parallel `action` + `endSlot` + feature-specific trailing sibling on entity
surfaces. A destination chevron is an `indicator`, not an `action`. Whole-row navigation
belongs to the host; trailing indicators remain non-interactive.

---

## Relationship rows

Typed cross-content edges on detail pages use `CrossContentRelationshipRow` →
`DetailEntityRow` → `EntityItemAnatomy`, not card shells. See
[cross-content-relationship-ui.md](./cross-content-relationship-ui.md).

---

## Closed consumer API

`EntityItem`, CEC, and DEC deliberately expose no `className`, `style`, padding,
inset, header/body, or divider styling props. Provide semantic data and controls
through `entity`, `leading`, `trailing`, `headingHref`, and DEC `children` only.

`ContentCardHeading`, `ContentCardBody`, `EntityCardFrame`, `EntityItemAnatomy`, and
`EntityLeadingRail` are internal implementation details. Feature code uses the entity
surfaces above rather than composing those internals directly.

---

## Architectural enforcement

Guards and tests encode ownership — they are not the contract themselves, but they
prevent regression:

| Guard / test                             | Enforces                                                                 |
| ---------------------------------------- | ------------------------------------------------------------------------ |
| `entity-item-anatomy.guard.test.ts`      | EntityItem variants stay inset-free; DEC keeps `rowLayout="entity-card"` |
| `entity-surface.guard.test.ts`           | Entity-backed grants use DEC shell bridge, not generic ArrayItem card    |
| `disclosure-entity-card.test.tsx`        | DEC body present; CLI legacy indent absent; leading offset on `article`  |
| `grant-array-disclosure-shell.test.tsx`  | Grant integration: DEC alignment, no CLI `content-column-indent`         |
| `collapsible-list-item.variants.test.ts` | Entity-card body classes exclude legacy inset                            |
| AGENTS.md component rule                 | No consumer padding overrides on entity surfaces                         |

---

## Known follow-up (code vs documented policy)

Documented policy is authoritative. These items may still exist in code and are tracked
for cleanup — do not weaken docs to match legacy patterns:

| Item                                                         | Status                                                               |
| ------------------------------------------------------------ | -------------------------------------------------------------------- |
| Non-entity ArrayItem CLI content-column indent               | **Intentional** for anonymous form arrays only                       |
| `DetailEntityRow.endSlot`                                    | **Intentional** for non-entity detail hosts — not for EntityItem/DEC |
| Catalog picker `rowLayout="entity-card"` embedded EntityItem | Host drops catalog inset; verify hosts do not double-apply           |

---

## Disabled state

CEC and DEC expose presentational disabled state. Hosts still own interactive
`disabled`, `aria-disabled`, and focus behavior.
