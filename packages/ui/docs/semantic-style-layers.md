# Semantic style layers

Layered interaction and presentation policy for cards, rows, and dense controls.
Features choose **semantic intent**; shared primitives own ring geometry, hit targets,
hover fills, and drag chrome.

```text
Layer 1 — foundational interaction policy (@rpg/ui)
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

### `iconGhostControlVariants({ hover, layout })`

Compact (24px) icon-only ghost controls. Composes internal control-action geometry with
embedded focus. List-row removes use this primitive — features must not size removes locally.

### `interactiveRowVariants({ interaction, state, hoverFamily, selected, … })`

Orthogonal row fills — not layout:

| Axis            | Values                                 |
| --------------- | -------------------------------------- |
| `interaction`   | `static` \| `hoverable`                |
| `state`         | `default` \| `inactive` \| `disabled`  |
| `hoverFamily`   | `none` \| `selectable` \| `navigation` |
| `selected`      | `none` \| `bordered` \| `fill`         |
| `selectedHover` | `none` \| `row`                        |
| `selectedData`  | `none` \| `selected` \| `checked`      |

| `hoverFamily` | Meaning                    | Hover token          |
| ------------- | -------------------------- | -------------------- |
| `selectable`  | Editor/selection list rows | `hover:bg-row-hover` |
| `navigation`  | Destination/link hub rows  | `hover:bg-muted`     |

Sortable drag opacity: `dragSurfaceVariants` on the wrapper — not `interactiveRowVariants`.

Hosts keep inset, separators, border footprint, and left-rail accents locally.

### Drag

```ts
dragHandleVariants({ visibility: 'always' | 'hoverReveal', dragging?: boolean })
dragSurfaceVariants({ dragging: boolean }) // sortable-row family only
```

| Visibility    | Use when                                       |
| ------------- | ---------------------------------------------- |
| `always`      | Collapsible list items, array fields, DEC grip |
| `hoverReveal` | Master-detail sortable rows                    |

Both visibilities share compact control-action geometry and embedded focus. Hover-reveal
adds opacity/group wiring only.

**Hover-reveal host contract**

- Host root includes `group` (or the agreed group name).
- Handle uses `group-hover` / `group-focus-within` reveal.
- Pass `dragging: true` on the handle so the grip stays visible during an active drag.

Bench/score-token whole-surface drag stays outside `dragSurfaceVariants`.

## Layer 2 presentation

| Primitive                         | Owner        | Consumers                          |
| --------------------------------- | ------------ | ---------------------------------- |
| `supportingTextDensityVariants`   | content-card | EntitySummary, ContentCard body    |
| `contentCardDensityInsetVariants` | content-card | EntityCardFrame, ContentCard shell |

## Feature guardrails (dashboard ESLint)

- No feature `focus-visible:ring-*` assembly in `*.variants.ts` (use Layer 1 focus).
- No deep imports of `control-action` geometry.
- No new `*RemoveButtonClasses` constants — `iconGhostControlVariants`.
- No raw `hover:bg-row-*` / `border-row-selected-*` in feature variants — `interactiveRowVariants`.
- No local `cursor-grab` drag-handle recipes (score-token bench product only).

Allowlisted host accents: `character-builder-shell.variants.ts` (F9 navigation rail).

## Follow-up status

Normalization pass **F1/F2/F6/F7/F8/F10 complete.** Open investigations: **F4** (whole-surface
drag contract), **F5** (unavailable entity presentation), **F3** per-surface audits as products evolve.

Entity/card ownership at Layer 2–3 (anatomy, surfaces, hosts) →
[dashboard entity presentation contract](../../../apps/dashboard/docs/content-entity-card.md).
