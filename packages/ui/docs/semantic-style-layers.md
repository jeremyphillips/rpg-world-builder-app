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

### `iconGhostControlVariants({ size, hover, layout })`

Icon-only ghost controls inside rows and cards. Composes internal control-action
geometry with embedded focus. Prefer `Button size="icon" density="compact"` when a
real button is the right surface.

### `interactiveRowVariants({ interaction, state, hoverTone, selected, … })`

Orthogonal row fills — not layout:

| Axis            | Values                                                                 |
| --------------- | ---------------------------------------------------------------------- |
| `interaction`   | `static` \| `hoverable`                                                |
| `state`         | `default` \| `inactive` \| `disabled`                                  |
| `hoverTone`     | `none` \| `row` \| `muted` (preserve divergent hosts during migration) |
| `selected`      | `none` \| `bordered` \| `fill`                                         |
| `selectedHover` | `none` \| `row`                                                        |
| `selectedData`  | `none` \| `selected` \| `checked`                                      |
| `dragging`      | `true` \| `false`                                                      |

Hosts keep inset, separators, border footprint, and left-rail accents locally.

### Drag

```ts
dragHandleVariants({ visibility: 'always' | 'hoverReveal', dragging?: boolean })
dragSurfaceVariants({ dragging: boolean })
```

| Visibility    | Use when                                       |
| ------------- | ---------------------------------------------- |
| `always`      | Collapsible list items, array fields, DEC grip |
| `hoverReveal` | Master-detail sortable rows                    |

**Hover-reveal host contract**

- Host root includes `group` (or the agreed group name).
- Handle uses `group-hover` / `group-focus-within` reveal; hosts do not invent
  alternate opacity wiring.
- Pass `dragging: true` on the handle (or compose `dragHandleVisibleWhileDraggingClasses`)
  so the grip stays visible for the duration of an active drag.

Host-local spacing (e.g. master-detail `ml-0.5`, CLI compact `-mt-1`) stays on the host.

## Layer 2 presentation

| Primitive                         | Owner        | Consumers                          |
| --------------------------------- | ------------ | ---------------------------------- |
| `supportingTextDensityVariants`   | content-card | EntitySummary, ContentCard body    |
| `contentCardDensityInsetVariants` | content-card | EntityCardFrame, ContentCard shell |

## Feature guardrails (dashboard ESLint)

- No feature `focus-visible:ring-*` assembly in `*.variants.ts` (use Layer 1 focus).
- No deep imports of `control-action` geometry.
- No new `*RemoveButtonClasses` constants — `Button` or `iconGhostControlVariants`.
- No raw `hover:bg-row-*` / `border-row-selected-*` in feature variants — `interactiveRowVariants`.
- No local `cursor-grab` drag-handle recipes (allowlisted score-token bench product only).

Allowlisted host accents and products are documented inline in
`apps/dashboard/eslint.config.js`.

## Follow-up normalization (separate pass)

Do not mix these with SSOT extraction:

- Unify remove hit targets (equipment `size-8` vs compact 24px).
- Unify list hover: `muted` → `row-hover` where product agrees.
- Unify dragging opacity (50 vs 40).
- Unify disabled shell opacity (60 vs 50).
- Complete incomplete focus stacks (`ring-offset-background`).
- Align master-detail grip metrics to collapsible-list-item after shared handle adoption.
