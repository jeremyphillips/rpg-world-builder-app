# Semantic style layers

Layered interaction and presentation policy for cards, rows, and dense controls.
Features choose **semantic intent**; shared primitives own ring geometry, hit targets,
hover fills, and drag chrome.

Policy overview: [AGENTS.md](../../../AGENTS.md#styling-conventions) · ownership:
[ui-architecture.md](./ui-architecture.md).

```text
Layer 1 — foundational interaction policy (@rpg/ui)
        ↓
Row tracks — RowAnatomy (band / meta / status, slack gutters; see row-anatomy.md)
        ↓
Layer 2 — shared presentation (entity / content-card / detail)
        ↓
Layer 3 — host / collection structure (inset, separators, orchestration)
        ↓
Layer 4 — feature composition
```

**Highest correct layer, not highest possible.** Duplicate entity typography or inset
maps belong at Layer 2 until a non-entity primitive proves a design-system-wide need.

## Layer 1 primitives

### `interactiveFocusVariants({ context })`

| Context      | Use when                              |
| ------------ | ------------------------------------- |
| `standalone` | Button, choice indicators, dialogs    |
| `embedded`   | Icon ghosts and dense row/card chrome |

Features do not assemble `focus-visible:ring-*` stacks.

### Cursor (`interactivePointerClasses`, globals base)

Tailwind v4 preflight sets `button { cursor: default }`. `@rpg/ui/styles.css` restores
`cursor: pointer` on enabled buttons in `@layer base`. Compose `interactivePointerClasses`
(or `hitTarget: 'pointer'` on `interactiveRowVariants`) for non-button hit targets.
Actionable `ui-card--interactive` shells (navigable `Card`, radio/entity option rows) set
`cursor: pointer` in `card.css` when not `ui-card--disabled`.

| Surface                                   | Cursor                                          |
| ----------------------------------------- | ----------------------------------------------- |
| Buttons, icon ghosts, disclosure triggers | `pointer`                                       |
| Navigable cards, interactive card shells  | `pointer` via `ui-card--interactive` CSS        |
| Destination row links                     | `pointer` via `ui-interactive-row--hit-pointer` |
| Text inputs / textarea                    | `text` (UA default)                             |
| Select/combobox/dropdown triggers         | `pointer`                                       |
| Menu / listbox options in popovers        | `pointer`                                       |
| Drag handles                              | `grab` / `grabbing` (`dragHandleVariants`)      |
| Disabled controls                         | `not-allowed` or `pointer-events-none`          |
| Static rows (no activation)               | `default` (e.g. preview rail static sections)   |

### Ghost visual state (`ghostControlVisualStateClasses`)

Shared **fill/hover/active/open** classes for toolbar ghost chrome (`Button variant="ghost"`,
`SortMenu` trigger). Geometry and focus rings stay on
each control. Do not confuse with Select **sizing ghosts** (invisible width-reserve spans) or
Badge `appearance`.

### Semantic control CSS (buttons, fields, compact chrome)

Migrated controls emit BEM-style `ui-*` modifiers from `*.variants.ts` / `*.styles.ts`; height,
padding, gap, and indicator geometry live in co-located `*.css` (`button.css`, `field-control.css`,
`field-group.css`, `choice-control.css`, `boolean-field.css`, `floating-label-field.css`, `compact-control.css`).
`semantic-control-variants-geometry-ban.test.ts` blocks raw `h-*`, `px-*`, `text-xs|sm|md|base`,
and `[&_svg]:size-*` from returning to those CVA modules.

### `iconGhostControlVariants({ hover, layout })`

Compact (24px) icon-only ghost controls. Composes `ui-compact-control--icon-compact` geometry with
embedded focus. List-row removes use this primitive — features must not size removes locally.
`hover: 'accent'` keeps `control-hover` (dense row chrome), not the toolbar accent fill from
`ghostControlVisualStateClasses`.

### `interactiveRowVariants({ interaction, state, selected, … })`

Orthogonal row fills — not layout:

| Axis           | Values                                                        |
| -------------- | ------------------------------------------------------------- |
| `interaction`  | `static` \| `hoverable` (applies `--hover` when unselected)   |
| `state`        | `default` \| `inactive` \| `disabled`                         |
| `selected`     | `none` \| `bordered` \| `fill`                                |
| `selectedData` | `none` \| `selected` \| `checked`                             |
| `hitTarget`    | `none` \| `pointer` (`cursor-pointer` on clickable row hosts) |

Pointer hover and pressed mixes always use `--ui-surface-hover-bg` / `--ui-surface-pressed-bg` from the nearest painted publisher (`surface-interaction.css`). Persistent selection uses `--ui-surface-selected-bg`. `InteractiveList` listbox highlight and rail are separate modifiers — see [interactive-list-rows.md](./interactive-list-rows.md). Action menus use `ui-menu-item` only.

Sortable drag opacity: `dragSurfaceVariants` on the wrapper — not `interactiveRowVariants`.

Hosts keep inset, separators, border footprint, and left-rail accents locally (list rows only for the accent rail).

### Drag

```ts
dragHandleVariants({ visibility: 'always' | 'hoverReveal', dragging?: boolean })
dragSurfaceVariants({ dragging: boolean }) // sortable-row family only
```

| Visibility    | Use when                                                         |
| ------------- | ---------------------------------------------------------------- |
| `always`      | Collapsible list items, array fields, disclosure EntityCard grip |
| `hoverReveal` | Master-detail sortable rows                                      |

Both visibilities share compact control-action geometry and embedded focus. Hover-reveal
adds opacity/group wiring only.

**Hover-reveal host contract**

- Host root includes `group` (or the agreed group name).
- Handle uses `group-hover` / `group-focus-within` reveal.
- Pass `dragging: true` on the handle so the grip stays visible during an active drag.

Bench/score-token whole-surface drag stays outside `dragSurfaceVariants`.

### Row tracks (`RowAnatomy`)

Vertical alignment for row-track surfaces (entity cards, spanning utilities). Hosts own
columns and inset; `RowAnatomy` owns row tracks and cell placement only. Entity anatomy maps
trailing **kinds** to cells — features do not pass `trailingAlign`, `headingBand`,
`actionsAlign`, `rowAlign`, or ad-hoc `self-*` on rail wrappers.

Detail: [row-anatomy.md](./row-anatomy.md). Live recipes: dashboard Storybook **Recipes /
Cards and Rows**.

## Layer 2 presentation

| Primitive                                                                          | Owner        | Consumers                                                                                                                                                                                                           |
| ---------------------------------------------------------------------------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `supportingTextDensityVariants`                                                    | content-card | EntitySummary, ContentCard body                                                                                                                                                                                     |
| `--ui-card-inset-*` + header copy vars (`ui-card--compact\|comfortable\|spacious`) | card.css     | Generic `Card` regions; entity/option inset only (`compact\|comfortable`; title/description vars generic-only)                                                                                                      |
| `ui-card--{transparent,quiet,subtle,strong}` (tone) + `ui-card--elevation-*`       | card.css     | Fixed rest per tone (`transparent`, `lift`, `subtle`, `strong`), shared interaction mixes, `--ui-surface-selected-bg`; elevation owns shadow tokens. Filled `DestinationList` strong shell uses `--surface-strong`. |
| `contentCardIdentityColumnGapVariants`                                             | content-card | ContentCard body, EntityAnatomy content                                                                                                                                                                             |
| `ui-copy-title` / `ui-copy-supporting`                                             | copy-scale   | Canonical density title/supporting size, line-height; titles use `--font-weight-heading`                                                                                                                            |
| `rowAnatomyTracksVariants` / `RowAnatomyCell`                                      | row-anatomy  | EntityAnatomy (row tracks + cells)                                                                                                                                                                                  |

Vertical alignment of identity rows has one owner — the row-track grid. Cells never
self-align or offset; see [row-anatomy.md](./row-anatomy.md).

## Feature guardrails (dashboard ESLint)

- No feature `focus-visible:ring-*` assembly in `*.variants.ts` (use Layer 1 focus).
- No deep imports of `control-action` geometry.
- No new `*RemoveButtonClasses` constants — `iconGhostControlVariants`.
- No raw `hover:bg-row-*` / `border-row-selected-*` in feature variants — `interactiveRowVariants`.
- No local `cursor-grab` drag-handle recipes (score-token bench product only).

Allowlisted host accents: `character-builder-shell.variants.ts` (F9 navigation rail).

## Follow-up status

Normalization pass **F1/F2/F6/F7/F8/F10 complete.** Semantic control CSS migration **Phase 7**
added variant geometry ratchets, fallow-driven dead export cleanup on control `*.styles.ts`, and
shrunk the icon-glyph sizing grandfather list. Open investigations: **F4** (whole-surface drag
contract), **F5** (unavailable entity presentation), **F3** per-surface audits as products evolve.

Entity/card ownership at Layer 2–3 (anatomy, surfaces, hosts) →
[dashboard entity surfaces contract](../../../apps/dashboard/docs/entity-surfaces.md) ([card-guide](../../../apps/dashboard/docs/card-guide.md) for selection).

Row-track vertical alignment → [row-anatomy.md](./row-anatomy.md).
