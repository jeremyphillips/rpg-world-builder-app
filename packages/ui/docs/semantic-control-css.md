# Semantic control CSS

Technical conventions for semantic classes. Repo-wide policy: [AGENTS.md](../../../AGENTS.md#styling-conventions).
Composition rules and the ownership registry live in [ui-architecture.md](./ui-architecture.md).
Inventory and wave status live in [semantic-css-migration.md](./semantic-css-migration.md).

Interactive controls and buttons emit BEM-style classes (`ui-button ui-button--outline ui-button--sm`) instead of long Tailwind utility lists in CVA output. CVA remains the public API; only the emitted class strings change. Dashboard-owned shared compositions use the `dash-` prefix with the same shape.

## Naming

| Pattern  | Example                               |
| -------- | ------------------------------------- |
| Block    | `ui-button`                           |
| Modifier | `ui-button--sm`, `ui-button--outline` |
| Element  | `ui-floating-label-field__label`      |

## JSX and TypeScript

- Apply block, element, and modifier strings on the node that owns them. Modifiers are conditional; anatomy classes are not exported as one-off aliases.
- `ClassReference` and completeness specs may repeat selectors; do not import them to build `className`.
- Export a semantic class from TypeScript only when it is part of a variant map or twMerge group in the same module. Empty `cva('ui-…')` and replacement `cn()` constants are indirection.
- Element classes stay inside the component that renders the element. Cross-owner use requires a documented contract (see [ui-architecture.md](./ui-architecture.md)).

## Declaration styles

1. **Size / geometry** — direct declarations in size modifiers (`height`, `padding-inline`, `gap`, `font-size`, …) using shared tokens (`--control-height-*`, `--control-gap-*`, `--field-padding-*`).
2. **Color / interaction** — component-local custom properties (`--ui-button-bg`, `--ui-button-fg`, …) set by appearance modifiers; the block class writes `:hover`, `:active`, `:focus-visible`, `:disabled`, and `[aria-expanded='true']` once.
3. **Composites** — shell sets inherited measurements (`--ui-field-slot-ps`, `--floating-label-control-h`); parts read them. Shell height stays a direct declaration on the size modifier.

## Mutually exclusive modifiers

Within one dimension (size, appearance), every modifier declares the **same** property list. Source order in each `*.css` file is fixed; when two modifiers from the same dimension are present, the later rule wins. Geometry families at `(0,2,0)` (e.g. `.ui-button.ui-button--text`) win over chrome appearances as documented per file.

`cn()` registers twMerge groups (`ui-button-size`, `ui-button-appearance`, …) so React composition matches DevTools.

## Inspector acceptance

For each migrated primitive, verify in Storybook DevTools:

1. Swap size — one class edit; no leftover geometry from the old size.
2. Swap density (Button only) — one resolved class (`ui-button--md-compact`).
3. Swap appearance or field invalid/disabled state; exercise `:hover`, `:active`, `:focus-visible`.
4. Add a second modifier from the same dimension — result is wholly one modifier, never a blend.
5. Untick one declaration in a size block — only that property changes.
6. No Tailwind utility edits required for 1–3.
7. Storybook `ClassReference` + live caption match DevTools; utility side of caption is empty (layout-only utilities documented).

## Field control width and trigger flow

- **`ui-field-control--width-*`** — exactly one width modifier per control composition (typically `Field.Root`, filter chrome wrapper, or standalone trigger when no outer owner exists). Fractions and intrinsic caps live in `field-control.css`; twMerge group `ui-field-control-width`.
- **`ui-field-control--trigger-{fill|fit|segment}`** — mutually exclusive horizontal flow on select/combobox triggers only; twMerge group `ui-field-control-trigger-flow`. Width tokens do not belong on the trigger when an ancestor already owns `--width-*`.

Bordered `NumberStepper` (`.ui-number-stepper--bordered` in `field-group.css`) uses that same perimeter: `--field-control-border` with hover, `:focus-within`, invalid, disabled, and readonly. The value slot's side borders are structural separators (`ui-border--subtle`, `border-y-0`). Step buttons do not paint a second perimeter. Isolated step buttons keep their hover, pressed, and focus-visible ring; their chrome is `ui-border--subtle`.

## Interactive row and list

`ui-interactive-row` writes hover, data selection, and disabled treatment once. Modifiers only set `--ui-row-*`:

| Dimension | Classes                                                                       | Custom properties                                       |
| --------- | ----------------------------------------------------------------------------- | ------------------------------------------------------- |
| Hover     | `--hover-none`, `--hover`                                                     | `--ui-row-bg-hover` → `--ui-surface-hover-bg`           |
| Emphasis  | `--emphasis-fill`                                                             | persistent `--ui-surface-selected-bg` (not selection)   |
| Selected  | `--selected-none`, `--selected-fill`, `--selected-bordered`, `--fill-surface` | `--ui-row-bg`, `--ui-row-border`                        |
| State     | `--state-default`, `--state-inactive`, `--state-disabled`                     | `--ui-row-border-style`, `--ui-row-state-border`        |
| Data      | `--data-none`, `--data-selected`, `--data-checked`                            | `--ui-row-bg-data-selected`, `--ui-row-bg-data-checked` |

`ui-interactive-list` owns the list surface, `--ui-surface-bg`, adjacent-sibling borders, and shared hover/pressed mixes (with `surface-interaction.css`). `__panel`, `__toolbar`, `__main--{sm,md,lg}` own panel chrome, toolbar chrome, and row padding. List rows use `--rail` for keyboard highlight only — not action menus. State precedence → [interactive-list-rows.md](./interactive-list-rows.md). `shadow-md` stays a utility on the panel. twMerge groups: `ui-interactive-row-hover`, `ui-interactive-row-selected`, `ui-interactive-list-row-size` (the size group also drops `px`/`py`/`p`).

## DataTable bands

`ui-data-table__table-wrap` publishes `--ui-surface-bg` for W1 hover/pressed mixes on body rows. The **header band** (`__header-row`, `__head`) is not an interactive row — it stays `--surface-strong` on rest, hover, and focus.

Body rows (`__row`) compose `ui-interactive-row` once and drive a single inherited `--ui-data-table-row-bg` (transparent rest; `--ui-surface-hover-bg` / `--ui-surface-pressed-bg` / `--ui-surface-selected-bg` for interaction; `__row--unavailable` wins with `--warning-faint` over every combination). Sticky `__actions` body cells read `--ui-data-table-row-bg` from the row; header `__actions` stays `--surface-strong`.

`__cell--unavailable-rail` is conditional status on the name cell only (inset accent). `__sort-icon--idle` appears on `__head:hover` and `__head:focus-within`. Empty tables use `__empty-row` (structural) + `__empty` (cell chrome). ClassReference specs → `DATA_TABLE_CLASS_SPECS` / `data-table.stories.tsx`.

## Card, inset panel, and empty panel

`ui-card` owns radius, border, fill, shadow, and `--surface-current` only — no shell padding. Tone modifiers (`--transparent`, `--quiet`, `--subtle`, `--strong`) override that chrome; `--selected` requires a tone. `ui-card--elevation-subtle` is shadow depth, not surface tone. `--compact`, `--comfortable`, and `--spacious` publish shared baseline inset (`--ui-card-inset-block`, `--ui-card-inset-inline`) and generic header copy sizes (`--ui-card-title-size`, `--ui-card-description-size`, plus weight/line-height vars); tone does not change density. Generic header title/description use `ui-card__title` / `ui-card__description` (no stacked font-size utilities). Region parts `__header`, `__content`, and `__footer` are **descendants** of `.ui-card`; each consumes inset vars on its own box, with `:has()` rules so adjacent regions do not double-count vertical inset. `ContentCard` / entity / radio families use their own typography CVAs — only inset steps overlap, and `spacious` is generic-`Card`-only at the type boundary. Declarative `Card` renders regions from `header` / `children` / `footer` props; compound exports use the same region classes. `cardSurfaceVariants()` is the styling primitive for custom DOM. Nest tone modifiers with the full class after `&` (`&.ui-card--quiet`). The short form `&--quiet` is rewritten into an invalid selector by the CSS optimizer.

`ui-radio-card` splits shell density (`--comfortable`, `--compact`; both set shell `gap`), row density (`--row-comfortable`, `--row-compact` via `copy-scale.css`), layout (`--media`, `--row`), and elements `__body`, `__details`, `__embedded`, `__footer`, `__indicator`, `__icon-control--{comfortable|compact}`, and `__leading-title-line--{comfortable|compact|title-end}` from the shared card resolver. Embedded option anatomy uses `ui-option-card__embedded--in-flow` and `ui-option-card__embedded--panel`.

`ui-selection-target` exposes `__control` (stretched hit area) and `__raised` (trailing controls above the hit area).

`dash-entity-card` (dashboard `index.css`) elements `__content`, `__details`, and `__body` consume the shared card inset vars; asymmetric rails come from `dash-entity-surface` edge tokens. `dash-entity-surface` on the same article publishes density, edge (`--start-*`, `--end-*`), and leading-count (`--leading-0|1|2`) custom properties — no inline `style`. Entity frames compose `cardSurfaceVariants({ tone: quiet, density, … })`. Option-card bodies (`ui-radio-card__body`, `ui-selection-option-card__body`) consume the same vars. In-flow embedded slots (`ui-option-card__embedded--in-flow`) indent by the card control size plus the anatomy column gap; panel slots break out to the card edge. Card tone rest is fixed: `transparent` → transparent fill, `quiet` → `--surface-lift`, `subtle` → `--surface-subtle`, `strong` → `--surface-strong`. Interactive hover/pressed mix from immutable `--ui-surface-bg` via shared `surface-interaction.css` (also used by filled strong `DestinationList`); persistent selection uses `--ui-surface-selected-bg` (same for every tone). Row consumption for destination lists → [destination-list.md](./destination-list.md#shared-surface-interaction). See `CARD_CLASS_SPECS` / `card.css`.

`ui-row-anatomy` owns row tracks and `__cell--{slot}` / `__cell--{column}` placement. `dash-entity-anatomy` and `dash-entity-leading` (dashboard) own entity column gaps and leading-rail columns. `ui-collapsible-list-item--entity-card` resets CLI chrome for disclosure EntityCard / catalog rows. `ui-identity-row__*` size modifiers own identity type scale (`__title`, `__classification`, `__supporting`). `ui-identity-frame` owns clip geometry (`--xs|sm|md|inline`), shape (`--shape-box|circle`), and image fit (`__image--cover|contain`); fallback icon scale stays on `__fallback` size modifiers.

`ui-panel` owns radius (`--radius-md`), border, fill, and root padding. Tones are `transparent` (`--border-subtle`, no `--surface-current`), `quiet` (`--surface-lift`), `subtle` (`--surface-subtle`), `strong` (`--surface-strong`), and `faint` (`--surface-faint`). Filled tones use `var(--border)`. `--compact`, `--comfortable`, and `--spacious` publish the shared `--ui-surface-inset-*` ladder from `copy-scale.css`; `.ui-panel` consumes it as `padding-block` and `padding-inline`. `--bleed` zeroes that padding; use `ui-panel-section-inset` (`panelSectionInsetClasses`) on direct children that need the host density inset. There is no overflow on the shell and no header, content, or footer region. Children are direct descendants.

`ui-inset-panel--{sm,md,lg}` owns radius and padding. Border style and alignment are separate modifiers. Surface wash still comes from the visual-vocabulary resolver.

`ui-empty-panel` owns the compact sunken well (radius, padding, italic muted type, sunken shadow).

## Compact label

`ui-compact-label` is the Badge and Chip shell. The block border is 1px; block `gap` owns icon/text spacing. `--{sm,md,lg}` set height and type. `--{outline|soft|strong}-{tone}` set `--ui-compact-label-bg`, `--ui-compact-label-fg`, and `--ui-compact-label-border` with the same longhand list. `--subdued` mutes copy; `--selected` and `--interactive` are chip states (unselected interactive chips use dedicated hover rules in CSS). `--counter` tightens numeric badges; `--removable-{sm,md,lg}` adjust trailing padding for dismiss controls. Chip dismiss is `__remove`. ClassReference specs derive from `COMPACT_LABEL_CLASS_SPECS` / resolvers. twMerge groups: `ui-compact-label-size`, `ui-compact-label-appearance`.

Overlay notification counts use `ui-notification-unread-badge` (not compact-label geometry).

## Alert

`ui-alert--{default|info|success|warning|destructive}` owns fill, border, and foreground. `ui-alert--{comfortable|compact}` owns gap and padding. `__title--{comfortable|compact}` owns the title type. `__description` owns the supporting copy.

## Tabs

`ui-tabs__list--line` and `ui-tabs__trigger--line` own the horizontal rule and primary active indicator (`ui-border--default` on the list). `ui-tabs__list--pill` and `ui-tabs__trigger--pill` own the segmented track and raised active segment. `ui-tabs__trigger` (without an appearance modifier) and `ui-focus-ring` own cursor, disabled treatment, and focus for `variant="none"` compositions. `ui-tabs__content` owns panel spacing below the list. Domain tile grids (for example spell level tabs) keep layout and tile chrome outside shared appearances.

## StatusIcon

`ui-status-icon` owns the disc. `ui-status-icon--{sm|md|lg}` are disc diameters (12 / 16 / 20px). Tone modifiers set fill and foreground. `ui-status-icon__glyph` carries neutral glyph color and needs-attention ring suppression; ladder or slash size utilities stay on the svg.

## Wizard

`ui-wizard__bubble`, `ui-wizard__label`, and `ui-wizard__connector` own shared geometry and transitions. Step labels pair `ui-wizard__label` with `text-style-label`; state modifiers (`--idle`, `--active`, `--complete`) change color only. Idle bubble and connector use `ui-border--default` for neutral structure; active and complete use primary.

## FilterBar and catalog filter chrome

`ui-filter-bar--{horizontal|vertical}` owns bar orientation. `ui-filter-bar__control--*` owns control width bands. `ui-filter-bar__group--inline` and `ui-filter-bar__group--stacked-*` own field-group layout. `ui-filter-advanced-panel` and `__header` / `__inner` / `__footer` density modifiers own the advanced panel shell (`overflow: hidden`, `ui-border--default` perimeter, `ui-border--subtle` footer divider). `ui-catalog-filter-controls` is the catalog filter row (0.5rem gap); combobox panel toolbars reuse it with `w-full` and `ui-combobox-filter-toolbar__item` for equal-width columns.

## CatalogToolbar

`ui-catalog-toolbar` and `__tab-row` / `__utility` / `__utility-content` / `__view-controls` / `__actions` own picker toolbar layout. `__utility` is an inline-size container. Tab-row divider uses `ui-border--subtle`.

## Text roles

`text-style-*` utilities are the Text role ladder and the field label, legend, hint, and error maps. They are `@utility` composites, same as `heading-style-*`, and they share a twMerge group. SemanticText is not a Text role: it owns inline status tone, emphasis, and an optional icon.

## Popover content

`ui-popover-content--{menu,popover,tooltip,filter}` owns fill, padding, and `--surface-current`. `ui-menu-item` owns action menu row chrome: optional icon, label, optional description (`__text`, `__label`, `__description`), `data-highlighted` / focus wash, and submenu `data-state="open"` accent. Not `InteractiveList` — see [interactive-list-rows.md](./interactive-list-rows.md). Radix motion stays utilities (`popoverContentMotionClasses`, `tooltipContentMotionClasses`). Panel elevation stays `shadow-md` / `shadow-lg`.

## When CVA vs CSS

- **CVA** — prop mapping, compound logic (Button size × density lookup), and non-visual layout utilities where documented.
- **CSS** — all repeatable size, appearance, and state presentation.

Storybook helpers live in `src/stories/semantic-classes/` (`ClassReferenceTable`, `SemanticClassCaption`, `semanticClassArgTypes`).
