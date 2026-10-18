# Semantic control CSS

Technical conventions for semantic classes. Composition rules and the ownership registry live in [ui-architecture.md](./ui-architecture.md). Inventory and wave status live in [semantic-css-migration.md](./semantic-css-migration.md).

Interactive controls and buttons emit BEM-style classes (`ui-button ui-button--outline ui-button--sm`) instead of long Tailwind utility lists in CVA output. CVA remains the public API; only the emitted class strings change. Dashboard-owned shared compositions use the `dash-` prefix with the same shape.

## Naming

| Pattern  | Example                               |
| -------- | ------------------------------------- |
| Block    | `ui-button`                           |
| Modifier | `ui-button--sm`, `ui-button--outline` |
| Element  | `ui-floating-label-field__label`      |

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

## Interactive row and list

`ui-interactive-row` writes hover, data selection, and disabled treatment once. Modifiers only set `--ui-row-*`:

| Dimension | Classes                                                                                                           | Custom properties                                       |
| --------- | ----------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------- |
| Hover     | `--hover-none`, `--hover-selectable`, `--hover-navigation`, `--hover-selected`, `--hover-surface`, `--hover-list` | `--ui-row-bg-hover`                                     |
| Selected  | `--selected-none`, `--selected-fill`, `--selected-bordered`, `--fill-surface`                                     | `--ui-row-bg`, `--ui-row-border`                        |
| State     | `--state-default`, `--state-inactive`, `--state-disabled`                                                         | `--ui-row-border-style`, `--ui-row-state-border`        |
| Data      | `--data-none`, `--data-selected`, `--data-checked`                                                                | `--ui-row-bg-data-selected`, `--ui-row-bg-data-checked` |

`ui-interactive-list` owns the list surface and adjacent-sibling borders. `__panel`, `__toolbar`, `__main--{sm,md,lg}` own panel chrome, toolbar chrome, and row padding. `shadow-md` stays a utility on the panel. twMerge groups: `ui-interactive-row-hover`, `ui-interactive-row-selected`, `ui-interactive-list-row-size` (the size group also drops `px`/`py`/`p`).

## Card, inset panel, and empty panel

`ui-card` owns radius, border, fill, shadow, and `--surface-current`. `--quiet` and `--strong` override that chrome; `--selected` requires a tone. Parts are `__header`, `__content`, and `__footer`. `cardSurfaceVariants()` is the styling primitive. Nest with the full class after `&` (`&.ui-card--quiet`). The short form `&--quiet` is rewritten into an invalid selector by the CSS optimizer.

`ui-radio-card` splits density (`--default`, `--compact`), layout (`--media`, `--row`), and elements `__details`, `__embedded`, and `__footer` from the shared card resolver.

`ui-selection-target` exposes `__control` (stretched hit area) and `__raised` (trailing controls above the hit area).

`dash-entity-card` (dashboard `index.css`) publishes block inset on `--compact` / `--comfortable` and elements `__content`, `__details`, and `__body`. `dash-entity-surface` on the same article publishes density, edge (`--start-*`, `--end-*`), and leading-count (`--leading-0|1|2`) custom properties — no inline `style`. Entity frames compose `cardSurfaceVariants({ tone: quiet, … })` with these modifiers; tone comes from `CardSurfaceToneProvider` on sheet and create-composition hosts.

`ui-row-anatomy` owns row tracks and `__cell--{slot}` / `__cell--{column}` placement. `dash-entity-anatomy` and `dash-entity-leading` (dashboard) own entity column gaps and leading-rail columns. `ui-collapsible-list-item--entity-card` resets CLI chrome for DEC / catalog rows. `ui-identity-row__*` size modifiers own identity type scale (`__title`, `__classification`, `__supporting`).

`ui-inset-panel--{sm,md,lg}` owns radius and padding. Border style and alignment are separate modifiers. Surface wash still comes from the visual-vocabulary resolver.

`ui-empty-panel` owns the compact sunken well (radius, padding, italic muted type, sunken shadow).

## Compact label

`ui-compact-label` is the Badge and Chip shell. The block border is 1px. `--{sm,md,lg}` set height and type. `--{outline|soft|strong}-{tone}` set `--ui-compact-label-bg`, `--ui-compact-label-fg`, and `--ui-compact-label-border` with the same longhand list. `--selected`, `--interactive`, and `--subdued` are states. Chip dismiss is `__remove`. twMerge groups: `ui-compact-label-size`, `ui-compact-label-appearance`.

## Alert

`ui-alert--{default|info|success|warning|destructive}` owns fill, border, and foreground. `ui-alert--{comfortable|compact}` owns gap and padding. `__title--{comfortable|compact}` owns the title type. `__description` owns the supporting copy.

## Text roles

`text-style-*` utilities are the Text role ladder and the field label, legend, hint, and error maps. They are `@utility` composites, same as `heading-style-*`, and they share a twMerge group. SemanticText is not a Text role: it owns inline status tone, emphasis, and an optional icon.

## Popover content

`ui-popover-content--{menu,popover,tooltip,filter}` owns fill, padding, and `--surface-current`. `ui-menu-item` owns menu row chrome, including focus and open highlight. Radix motion stays utilities (`popoverContentMotionClasses`, `tooltipContentMotionClasses`). Panel elevation stays `shadow-md` / `shadow-lg`.

## When CVA vs CSS

- **CVA** — prop mapping, compound logic (Button size × density lookup), and non-visual layout utilities where documented.
- **CSS** — all repeatable size, appearance, and state presentation.

Storybook helpers live in `src/stories/semantic-classes/` (`ClassReferenceTable`, `SemanticClassCaption`, `semanticClassArgTypes`).
