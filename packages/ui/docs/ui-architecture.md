# UI architecture

Permanent rules for composing, extending, and owning UI. Semantic CSS is the inspectability layer on those owners. It is not the goal by itself.

The goal is to eliminate hand-rolled implementations of established UI patterns, while keeping feature-specific compositions and genuinely unique interfaces. A domain component such as `QuickNpcBuildCard` stays a domain component. It composes shared primitives for border, padding, hover, selection, and typography instead of implementing them itself.

Migration inventory, classification, and wave status live in [semantic-css-migration.md](./semantic-css-migration.md) and leave this document when the migration ends. Technical class conventions live in [semantic-control-css.md](./semantic-control-css.md). Fine-grained presentation recipes live in [semantic-style-layers.md](./semantic-style-layers.md). Tone, emphasis, and elevation live in [visual-vocabulary.md](./visual-vocabulary.md).

**Cards, rows, and entity UI:** generic `Card` and list rows are owned here and in [row-anatomy.md](./row-anatomy.md) / [destination-list.md](./destination-list.md). For which surface to use (including dashboard `EntityCard` and `CatalogCard`), start at the dashboard [card-guide.md](../../../apps/dashboard/docs/card-guide.md).

## Rules

1. **Reuse before creating.** Search existing primitives and compositions before introducing a new visual component.
2. **One owner per visual responsibility.** Geometry, chrome, typography, and interaction states each have an explicitly designated owner.
3. **Semantic variants over consumer overrides.** Shared components expose typed appearance, size, density, and state APIs.
4. **No duplicated styling ownership.** A feature must not re-implement chrome, geometry, or state styling that a shared owner already provides. It may still render its own DOM structure, using one of the reuse paths below.
5. **Presentation and domain logic stay separate.** Domain-specific wrappers may configure content and behavior, but should not duplicate shared chrome.
6. **CSS classes are inspectable.** Size and appearance can be changed through concise semantic modifier classes in DevTools.
7. **Exceptions are intentional.** Unique layouts are allowed. Duplicate implementations of established patterns are not.

## Reuse paths

The rule prohibits duplicated styling ownership. It does not require identical component trees.

| Approach                          | Appropriate when                                                        |
| --------------------------------- | ----------------------------------------------------------------------- |
| Shared component                  | Structure, behavior, and styling all match                              |
| Shared semantic styling primitive | Styling matches, but DOM structure or behavior differs                  |
| Domain-specific implementation    | The pattern is genuinely unique (record it as an intentional exception) |

Styling primitives must be exportable. Every owner whose styling may be reused without its component exposes its semantic classes through a function — for example `cardSurfaceVariants({ … })` returns `ui-card ui-card--…`. For **button-shaped navigation**, use `ButtonLink` (app supplies the router link via `link`); `resolveButtonAppearance()` and `buttonVariants()` remain for styling-only or non-navigation cases. See [button-link.md](./button-link.md).

`EntityCardFrame` shares the **inset** ladder (`--ui-card-inset-*` via `ui-card--compact|comfortable` on the frame) with generic `Card` and option cards. The legacy `ContentCard` article shell is retired. Generic `Card` also publishes shared copy vars (`--ui-copy-title-size` via `copy-scale.css`) and `spacious` inset; hub tiles can pair `Card` with `IdentityRowHeadingLine` without a separate density wrapper. Entity frames use `ContentCardDensity` only (no `spacious`, separate title typography via `contentCardHeadingScaleClass` on `EntitySummaryHeading`).

Avoid wrappers that exist only to satisfy reuse. A feature that would need awkward wrapper elements or escape-hatch props to fit a shared component should use the styling primitive instead.

## Variant criterion

Introduce a shared variant when it represents a stable, meaningful dimension of the component's contract and cannot be expressed cleanly through existing APIs. Prefer demonstrated reuse. There is no numerical threshold.

- A single consumer can justify a variant when it is a genuine semantic state (for example `invalid`, `readonly`, or `interactive`).
- Several consumers sharing an accidental workaround do not justify a public variant. Fix the root cause instead.

## Semantic CSS threshold

- **Semantic CSS** is for a reusable component's appearance, sizing, geometry, and interaction states. Components use `ui-*` blocks in `@rpg/ui` and `dash-*` blocks for dashboard-owned shared compositions.
- **Tailwind utilities** are for one-off composition and layout that the consumer intentionally owns (`flex items-center gap-2`). Do not replace utility sprawl with a parallel catalog of semantic classes for trivial layouts.
- **Typography roles** stay single-class `@utility` composites (`heading-style-*`, and `text-style-*` once those land). They already meet the inspector goal and apply to arbitrary elements.

## Ownership registry

The registry maps each UI responsibility to the component that owns it. Unambiguous responsibilities are a flat list. Families where ownership overlaps get a short hierarchy with a composition column, so a change goes to the component that owns the visual responsibility. Fine-grained recipes stay in [semantic-style-layers.md](./semantic-style-layers.md).

The registry records gaps ("No owner yet") explicitly. It grows only when a family's ownership is actually ambiguous. It is not a full dependency diagram.

### Single-owner responsibilities

| UI responsibility              | Canonical owner                                                   |
| ------------------------------ | ----------------------------------------------------------------- |
| Interactive button chrome      | `Button` (split actions: `SplitButton`)                           |
| Button-shaped link navigation  | `ButtonLink`                                                      |
| Inline / text link navigation  | `Link`                                                            |
| Table filter presentation      | `DataTableFilterChrome`                                           |
| Compact sort selection         | `SortMenu`                                                        |
| Callout or warning surface     | `Alert`                                                           |
| Transient feedback             | `Toast`                                                           |
| Catalog picking                | `CatalogPickerSheet` (composes `Sheet`)                           |
| Key/value metadata             | `MetadataList`                                                    |
| Completed decision summaries   | `DecisionSummaryPanel` + `mapSummaryDecisionRowsToSelectionProps` |
| Inline metadata separators     | `InlineMetadata`                                                  |
| Tabs                           | `Tabs`                                                            |
| Multi-step flow                | `Wizard`                                                          |
| Page width shell (dashboard)   | `PageShell`                                                       |
| Popover / menu content surface | `popoverContentVariants` (`ui-popover-content`)                   |

### Families with overlapping ownership

| Family     | Responsibility                    | Canonical owner                                   | Composition relationship                                                                                                                                                                                                                                   |
| ---------- | --------------------------------- | ------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Fields     | Single-control field chrome       | `Input` / `Select` / `Textarea`                   | Share the field-control styling primitive                                                                                                                                                                                                                  |
| Fields     | Search input                      | `SearchBar`                                       | Composes `Input`; owns the leading icon and clear affordance                                                                                                                                                                                               |
| Fields     | Floating label                    | `FloatingLabelField`                              | Wraps a field control; owns label and float state only                                                                                                                                                                                                     |
| Fields     | Multi-segment field               | `JoinedPair` / `InputSelect` / `InputActionGroup` | Own the group shell; segments reuse field chrome                                                                                                                                                                                                           |
| Status     | Status text or count              | `Badge`                                           | Built on `CompactLabel`; its icon slot may hold a `StatusIcon`                                                                                                                                                                                             |
| Status     | Selectable or removable tag       | `Chip`                                            | Built on `CompactLabel`; owns selection and removal                                                                                                                                                                                                        |
| Status     | Status glyph                      | `StatusIcon`                                      | Icon only, no badge surface                                                                                                                                                                                                                                |
| Status     | Status dot                        | `StatusDot`                                       | Compact indicator only                                                                                                                                                                                                                                     |
| Dialogs    | Dialog surface chrome             | `DialogPanel`                                     | Owns panel perimeter, insets, body, and action row                                                                                                                                                                                                         |
| Dialogs    | Dialog interaction                | `Modal`                                           | Uses `DialogPanel`                                                                                                                                                                                                                                         |
| Dialogs    | Confirmation workflow             | `ConfirmDialog`                                   | Composes `Modal`                                                                                                                                                                                                                                           |
| Dialogs    | Side panel                        | `Sheet`                                           | Uses `DialogPanel`                                                                                                                                                                                                                                         |
| Dialogs    | Dashboard drawer                  | `DrawerShell`                                     | Composes `Sheet`                                                                                                                                                                                                                                           |
| Surfaces   | Generic content card shell        | `Card`                                            | One `density` (`compact` / `comfortable` / `spacious`) drives inset + header copy via shell CSS vars; declarative `header` / `footer` / `stretch` for hub/form chrome; compound parts share `ui-card__title` / `ui-card__description` under the same shell |
| Surfaces   | Inset or sunken surface           | `InsetPanel`                                      | Not a card; no perimeter interaction                                                                                                                                                                                                                       |
| Surfaces   | Empty-state container             | `EmptyPanel`                                      | Thin owner for empty states (see [empty-state-containers.md](./empty-state-containers.md))                                                                                                                                                                 |
| Surfaces   | Selectable option card            | `SelectionOptionCard`                             | Owns selected and disabled chrome (option-card shell)                                                                                                                                                                                                      |
| Surfaces   | Card tone resolver                | `cardSurfaceVariants`                             | `ui-card` quiet/strong × interactive/selected/disabled; entity frames quiet; radio cards default strong                                                                                                                                                    |
| Surfaces   | Radio option card                 | `RadioCard`                                       | `SelectionTarget` + `SelectionTargetRadio` on `ui-card` / `ui-radio-card`; row variant uses `InteractiveRow`                                                                                                                                               |
| Surfaces   | Catalog picker single-choice rows | `CatalogCard` (`selection`)                       | Leading radio utility; mutually exclusive with trailing actions                                                                                                                                                                                            |
| Surfaces   | Entity card perimeter (dashboard) | `EntityCardFrame`                                 | `cardSurfaceVariants` + `dash-entity-card` modifiers; publishes inset tokens                                                                                                                                                                               |
| Surfaces   | Entity card (dashboard)           | `EntityCard` → static / disclosure renderers      | Public facade; internal `EntityCardStaticRenderer` / `EntityCardDisclosureRenderer` compose `EntityCardFrame`; `EntityCardContent` owns `dash-entity-card__content`                                                                                        |
| Rows       | Interactive row states            | `InteractiveRow`                                  | Styling primitive for hover, selection, and disabled states                                                                                                                                                                                                |
| Rows       | List container and rows           | `InteractiveList`                                 | Composes `InteractiveRow`                                                                                                                                                                                                                                  |
| Rows       | Identity row (media + title)      | `IdentityRow`                                     | Uses `IdentityFrame`; presentation only                                                                                                                                                                                                                    |
| Typography | Headings / eyebrows               | `Heading` / `Eyebrow`                             | Single-class `@utility` composites                                                                                                                                                                                                                         |
| Typography | Body and supporting text          | `Text`                                            | Role composites (`text-style-*`)                                                                                                                                                                                                                           |
| Typography | Inline status tone                | `SemanticText`                                    | Tone, emphasis, and icon; not a Text role                                                                                                                                                                                                                  |
| Typography | Links                             | `Link`                                            | Uses the `text-action-*` utilities                                                                                                                                                                                                                         |

A `variant="selection"` request routes to `SelectionOptionCard`, not `Card`, so Card does not become one giant generic component. Treat Card's information-and-navigation scope as a hypothesis that classification may revise. Record those revisions here when ownership actually changes.

### Card footer labeled actions

For density-aware hub/roster `Card` stacks with labeled footer controls (`Button`, `ButtonLink`, or `buttonVariants()` on a real link), pass explicit `size` from `resolveCardFooterButtonSize(density)` in `@rpg/ui`. `CardFooter` is layout-only — no contextual descendant sizing.

| Card `density` | Labeled footer `Button` / `ButtonLink` `size` |
| -------------- | --------------------------------------------- |
| compact        | `sm`                                          |
| comfortable    | `sm`                                          |
| spacious       | `default` (md tier)                           |

Heading-line badge accessories use a parallel ladder with `Badge` sizes — see [row-anatomy.md](./row-anatomy.md#heading-accessories). Form submit footers, icon-only controls, and footers with caller-chosen sizes are out of scope for this resolver.

## Exception policy

An exception gets a one-line comment at the implementation, or a note in the component's doc, explaining why the surface is unique. While [semantic-css-migration.md](./semantic-css-migration.md) exists, classified exceptions are also recorded there. Do not copy that inventory into this document.
