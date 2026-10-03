# Row anatomy

`RowAnatomy` is the shared **row-track** contract for identity rows: one grid owns vertical
alignment, every slot is a cell placed on a named track, and no consumer self-aligns or
offsets a cell to "fix" alignment.

Source: `packages/ui/src/components/ui/row-anatomy/`. Live catalog of every surface:
dashboard Storybook **Recipes / Cards and Rows** (`apps/dashboard/src/stories/card-recipes/`).
Entity-family usage: [dashboard entity presentation contract](../../../apps/dashboard/docs/content-entity-card.md).

## Ownership invariant

| Concern                               | Owner                                      |
| ------------------------------------- | ------------------------------------------ |
| Row tracks (vertical)                 | `rowAnatomyTracksVariants`                 |
| Cell row placement and self-alignment | `rowAnatomyCellClasses` (sole resolver)    |
| Columns, column gaps                  | Host (e.g. `entityAnatomyColumnsVariants`) |
| Padding / surface inset               | Host surface (e.g. `EntityCardFrame`)      |
| Inner content layout                  | Cell children (flex rows inside a cell)    |

The track variant emits **rows only** — never columns, gaps, padding, or inset. Hosts
compose it with their own column template.

## Tracks

```text
[slack-start] 1fr
[band]        minmax(var(--row-band-height), auto)
[meta]        auto
[status]      auto
[slack-end]   1fr
[row-end]
```

- **band** — the heading line and anything that must center on it. Minimum height is
  `--row-band-height` (`band` variant: `control` → compact control height, `media-xs` /
  `media-sm` → identity frame sizes). A taller band cell (e.g. media) grows the track.
- **meta** / **status** — secondary lines; collapse to 0 when empty.
- **slack gutters** — `1fr` tracks that only spanning cells cross. With indefinite height
  they resolve to 0, so a row's height is band + meta + status. When a spanning cell
  (`full` / `stretch`) is taller than that, CSS distributes the extra into the `fr` tracks
  only, so the gutters grow **evenly** and band/meta/status keep their positions relative
  to each other. That is what keeps a 36px stepper from pushing the heading down.

## Cell API

```ts
type RowAnatomyCellSpec<C extends string = RowColumn> =
  | { slot: 'band'; column: C }
  | { slot: 'meta'; column: 'content' | 'trailing' }
  | { slot: 'status'; column: 'content' | 'trailing' }
  | { slot: 'full'; column: C }
  | { slot: 'stretch'; column: 'trailing' }
```

| Slot      | Row placement                 | Self-alignment         | Typical content                                 |
| --------- | ----------------------------- | ---------------------- | ----------------------------------------------- |
| `band`    | `[band]`                      | center                 | Heading line, labeled action, media, grip/caret |
| `meta`    | `[meta]`                      | start (+ track offset) | Description, secondary price/quantity           |
| `status`  | `[status]`                    | start (+ track offset) | Status badges / annotations                     |
| `full`    | `[slack-start]` → `[row-end]` | center                 | Ghost utilities, chevrons, steppers             |
| `stretch` | `[slack-start]` → `[row-end]` | stretch                | Full-height trailing chrome                     |

`RowAnatomyCell` renders the cell: it accepts the spec, children, and `data-*` attributes
only — **no `className` or `style`**. Column placement is inline `grid-column: <name>`;
track offsets live in the resolver, not in consumers. Hosts mark their grid root with
`rowAnatomyRootProps` (`data-row-anatomy`), and cells carry `data-row-anatomy-slot` /
`data-row-anatomy-column` for geometry checks and the Storybook anatomy overlay.

## Entity kind → cell

| Entity slot / trailing kind | Cell                                               |
| --------------------------- | -------------------------------------------------- |
| leading utilities           | `band` / `leading`                                 |
| media                       | `band` / `media`                                   |
| heading                     | `band` / `content`                                 |
| description                 | `meta` / `content`                                 |
| status                      | `status` / `content`                               |
| `action`                    | `band` / `trailing`                                |
| `utility`                   | `full` / `trailing`                                |
| `indicator` chevron         | `full` / `trailing`                                |
| `indicator` quantity        | `band` / `trailing`                                |
| `group`                     | primary `band`, secondary `meta` (both `trailing`) |

## No compensation rule

If a cell looks misaligned, fix the track or the resolver — never the consumer:

- No `self-center` / `self-start`, `items-*` on cell wrappers, `mt-*`, or
  `min-h-control-action-compact` inside entity anatomy/summary
  (`row-anatomy-alignment.guard.test.ts`).
- No per-consumer alignment props. `trailingAlign`, `headingBand`, `actionsAlign`, and
  `rowAlign` are retired — rhythm resolves inside the owning primitive
  (`resolveCollapsibleListItemHeaderActionsPlacement`, `resolveContentCardBodyCrossAxis`).
- Meta/status offsets share `row-identity-rhythm.tokens.ts` with `IdentityRow` stacks.
- A primitive that needs a new slot, variant, or override to fit is a **different
  anatomy** — document it below instead of bending the contract.

## Geometry verification

`@rpg/ui/storybook/row-anatomy-geometry` exports `expectRowAnatomyAligned(root, options)`
for Storybook play functions. It measures real layout and asserts band centers match the
band track, meta/status tops sit on their tracks, `full` cells center on the grid content
box, `stretch` cells fill it, and slack gutters are even. Stories using it:
`UI/RowAnatomy`, `Content/Entity/Alignment matrix`, and `Recipes/Cards and Rows`.

## Compatibility classification

Classification of the non-entity row primitives against the row-track contract. Rule: a
primitive that needs a new slot, variant, or override to fit is a different anatomy.

| Primitive                                                     | Classification                    | Evidence                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| ------------------------------------------------------------- | --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `CollapsibleListItem` (default header)                        | **Different anatomy**             | Header is a toolbar row (grip, caret, title, optional inline compact fields) with actions centered on the title row or stacked below via `resolveCollapsibleListItemHeaderActionsPlacement` (`headerActions` flex-col). Not a band/meta/status stack; headers can host form fields on field-row tracks. Fitting it would need a new "toolbar" slot. Entity hosts bypass via `rowLayout="entity-card"`.                                                                   |
| `ArrayItemAnatomyGrid`                                        | **Different anatomy**             | Rows are field tracks (`label` / `control` / `message`, `grid-rows-[auto_auto_auto]`) shared via subgrid with `Field.Root rowParticipation`. Grip/actions span all tracks and center — analogous to `full` cells — but the content tracks are field anatomy, not identity band/meta/status.                                                                                                                                                                              |
| `ContentCardBody` (`ContentCard`)                             | **Different anatomy** (candidate) | Shape matches (media / heading / secondary / end slot) but it carries two secondary lines (`subheading` + `metadata`) plus an arbitrary `footer` with its own `mt-2` rhythm; cross-axis alignment is derived via `resolveContentCardBodyCrossAxis`. Migration would need `footer` → `status` with a rhythm change. Dashboard entity surfaces no longer use it; remaining consumers are `@rpg/ui` / public-app `ContentCard`. Candidate for a reviewed Phase 4 migration. |
| `InteractiveListRow` (+ `ComboboxOptionRow`, `MenuChoiceRow`) | **Different anatomy**             | Two-root composition: the interactive hit area (`button` / `a` / Radix `menuitem`, often via `asChild`) wraps `startSlot` + `IdentityRow` + `endSlot`, and `trailingAction` is a sibling outside the hit area with its own divider. Row-track cells must be direct grid children, which would split the single interactive element. Identity text already shares `IdentityRowHeadingLine` / `IdentityRowSupporting` with the entity family.                              |
| `SelectionOptionCard`                                         | **Different anatomy**             | Vertical card stack: optional header row (eyebrow + start/end slots) above title, description, summary lines, and embedded content. Not a single identity row.                                                                                                                                                                                                                                                                                                           |
| `SelectionSummaryCard` + Quick NPC starting-choices grid      | **Different anatomy**             | Key/value tables: `dl` rows with label / value / action columns plus a helper row; Quick NPC uses a `grid-cols-[max-content_minmax(0,1fr)_auto]` subgrid across category rows. Column alignment across rows is the contract, not per-row tracks. Selected-choice rows inside the Quick NPC panel are entity rows and already use the row-track contract.                                                                                                                 |

Phase 4 outcome: no non-entity primitive was migrated. `ContentCardBody` is the only
candidate and needs a reviewed decision on its `footer` rhythm first.
