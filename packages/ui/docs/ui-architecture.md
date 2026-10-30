# UI architecture

Permanent rules for composing, extending, and owning UI. Semantic CSS is the inspectability layer on those owners. It is not the goal by itself.

Repo-wide summary for agents: [AGENTS.md](../../../AGENTS.md#styling-conventions).

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

Reusable styling without the full component is exposed through **conditional** resolvers — for example `cardSurfaceVariants({ … })` returns `ui-card ui-card--…`. Fixed element classes stay on the owning JSX. For **button-shaped navigation**, use `ButtonLink` (app supplies the router link via `link`); `resolveButtonAppearance()` and `buttonVariants()` remain for styling-only or non-navigation cases. See [button-link.md](./button-link.md).

`EntityCardFrame` shares the **inset** ladder (`--ui-card-inset-*` via `ui-card--compact|comfortable` on the frame) with generic `Card` and option cards. The legacy `ContentCard` article shell is retired. Generic `Card` also publishes shared copy vars (`--ui-copy-title-size` via `copy-scale.css`) and `spacious` inset; hub tiles can pair `Card` with `IdentityRowHeadingLine` without a separate density wrapper. Entity frames use `ContentCardDensity` only (no `spacious`, separate title typography via `contentCardHeadingScaleClass` on `EntitySummaryHeading`).

Avoid wrappers that exist only to satisfy reuse. A feature that would need awkward wrapper elements or escape-hatch props to fit a shared component should use the styling primitive instead.

## Variant criterion

Introduce a shared variant when it represents a stable, meaningful dimension of the component's contract and cannot be expressed cleanly through existing APIs. Prefer demonstrated reuse. There is no numerical threshold.

- A single consumer can justify a variant when it is a genuine semantic state (for example `invalid`, `readonly`, or `interactive`).
- Several consumers sharing an accidental workaround do not justify a public variant. Fix the root cause instead.

## Semantic CSS threshold

- **Semantic CSS** is for a reusable component's appearance, sizing, geometry, and interaction states. Components use `ui-*` blocks in `@rpg/ui` and `dash-*` blocks for dashboard-owned shared compositions. The `ui-*` prefix denotes that ownership. BEM `--modifier` syntax is for any class that modifies an accompanying base class, including utilities (`text-style-score text-style-score--md`).
- **Tailwind utilities** are for one-off composition and layout that the consumer intentionally owns (`flex items-center gap-2`). Do not replace utility sprawl with a parallel catalog of semantic classes for trivial layouts.
- **Self-contained typography roles** stay one `@utility` (`heading-style-section`, `text-style-caption`). A role that shares a contract across sizes uses a base plus BEM modifiers.

### Semantic class ownership

- Fixed BEM anatomy and modifiers belong on the element the owning component renders. A static `cn()` constant is not a substitute for an empty `cva()`.
- Do not apply another component’s element class from a consumer; compose the owner, use local layout, or record an explicit cross-owner contract in this document.
- Export a function when arguments select modifiers, or when one state must apply several classes together (for example `cardSurfaceVariants`, `dataTableUnavailableAppearance`).
- A `*.variants.ts` file requires a real variant axis. `ClassReference` specs and twMerge group lists are inspection metadata, not runtime class registries.
- Styling primitives that may be reused without their component expose **conditional** classes through resolvers (`cardSurfaceVariants`, `interactiveRowVariants`) — not through zero-argument aliases of a single selector.
- A local JSX ternary is allowed. It is not a reason to add a resolver. `style={{}}` is for a measured or per-instance value only.

## Styling change types

These edits are not interchangeable.

1. **Dead export removal.** The symbol has no references. No class string moves.
2. **Static alias inlining.** A one-token class constant is replaced by that same token at the consumer. The CSS owner does not change.
3. **Type 3A — mechanical CVA removal.** A zero-argument `cva()` with no `variants` and no `compoundVariants` becomes the same class string. Call sites change from `name()` to that string. Emitted classes and the export name stay. If any consumer passes arguments or passes the function, that export stays a function. Type 3A does not inline the string, rename `*Variants` to `*Classes`, move it into CSS, or add a BEM block.
4. **Styling ownership transfer.** Classes move into a named CSS owner. Requires the owner, a reason, and a cascade check.
5. **Duplicate-owner consolidation.** Two modules currently own one decision.

Type 3A and the string's later disposition are separate. After type 3A the export is still the named string. Inlining it, renaming it, or moving it into CSS waits on its own approval.

The styling-indirection ratchet (`semantic-styling-indirection.test.ts`) keys temporary debt by file, exported symbol, and violation type (`empty-cva`, `single-semantic-alias`, `single-utility-alias`). A file may lose keys. A new key fails, including when it replaces an old key in the same file. Permanent exceptions live in `semantic-styling-indirection.allowlist.json`, not the baseline. Consumer count is evidence for an exception. It is not a reason by itself.

This cleanup does not add a BEM block to retire a variants file. **Approved Keep** means the module stays for this cleanup because inlining would harm readability and a CSS move is out of scope. It is not a ruling that the styling belongs in TypeScript.

## Approved exceptions

Each symbol is allowlisted on its own. Membership in a shell or the field hub is not a reason.

- `panelSectionInsetClasses` — named inset for `Panel` children when `bleed` drops host padding.
- `formStickyScrollShellWithDockedFooterClasses` — `ui-form-docked-shell`, applied by `TabbedForm`, `FormShellChildren`, and `CharacterBuilderFormColumn`.
- `appShellBreadcrumbRailClasses` — `dash-app-shell__breadcrumb-rail`, applied by the shell and by the detail-page header rail.
- `characterBuilderStepPanelClasses` — `dash-character-builder__step-panel`, applied by the step panel and by the step frame.
- `fieldGroupBottomMarginClasses` — shared `mb-8` under standalone field groups, omitted when parent rhythm owns the gap.
- `fieldGroupSectionOuterMarginResetClasses` — shared `mb-0` that cancels that margin when a group is nested.
- `fieldChipWrapGapClasses` — shared `gap-2` for chip pills in chips field and text-suggestions.

Page width (`PageShell`), page rhythm, and viewport workspace stay resolvers. Do not invent BEM for those utilities. Radio-card rows compose `InteractiveRow`. The two sticky recipes (document sticky actions and the docked-footer shell) are not one contract. `table-builder` / `table-grid` stays the domain exception.

## Inspecting UI

Dev CSS source maps are on in the dashboard Vite config, the bench Vite config, and `createStorybookMainConfig` (`css.devSourcemap: true`). `@tailwindcss/vite` emits them only when that flag is set. JavaScript source maps stay on in dev by default.

Use both maps together. Restart the dev server or Storybook after pulling this change so the Styles pane links resolve.

1. **Owning component.** In React DevTools, pick the element, then open its source. The fiber tree names the component that rendered the node, including through fragments, providers, component-only roots, and conditional returns.
2. **Owning rule.** In the Styles pane, follow the source link on a semantic rule. It opens the CSS file and line that declared that rule.
3. **Live modifiers.** Add or remove a semantic modifier on the element (`ui-card--quiet`, and the same pattern on other blocks) and confirm the appearance changes without a reload.

Shell ownership and the form-chrome block boundaries for the shell migration are frozen in [semantic-css-migration.md](./semantic-css-migration.md#shell-ownership-frozen-at-p0).

## Cascade layers

**Precedence rule:** within the established cascade layers, utility declarations override
component declarations when targeting the same property on the same element. Custom-property
inheritance, element scope, inline styles, and specificity within a layer remain relevant.
Relocating a rule from `@layer utilities` into `@layer components` lowers precedence on that
element. A custom property is inherited from the element's DOM ancestors. A portal inherits
from the node it is mounted under. Radix `Sheet`, `Dialog`, and popovers in this repo use the
default container, which is `document.body`, so page-level variables do not reach them. A
portal given another container inherits from that container instead.

Tailwind emits layers lowest-first: `properties`, `theme`, `base`, `components`, `utilities`. `properties` belongs to Tailwind. Every designated stylesheet starts with this statement, before any `@import`:

```css
@layer theme, base, components, utilities;
```

The first stylesheet to name a layer fixes that layer's order for the page. A later statement cannot reorder a layer that already exists. Registering `components` before this statement lets Preflight (`@layer base`) paint over semantic padding, borders, and the other properties Preflight resets. Heights, custom properties, and utilities still apply, so the control looks half-styled.

### Stylesheet entries

Runtime code imports CSS only from these modules, and that import is the first runtime import in the file:

| Entry                                   | Stylesheet                              |
| --------------------------------------- | --------------------------------------- |
| `apps/dashboard/src/main.tsx`           | `apps/dashboard/src/index.css`          |
| `apps/bench/src/main.tsx`               | `apps/bench/src/index.css`              |
| `apps/public/src/app/layout.tsx`        | `apps/public/src/app/globals.css`       |
| `apps/dashboard/.storybook/preview.tsx` | `apps/dashboard/.storybook/preview.css` |
| `packages/ui/.storybook/preview.tsx`    | `packages/ui/.storybook/preview.css`    |

`packages/ui/src/styles/globals.css` (`@rpg/ui/styles.css`) is the shared sheet those entries import. Semantic component and feature CSS lives beside the component (`ui-*` in `@rpg/ui`, `dash-*` in the dashboard) and enters through `@import` from `globals.css`, the app entry, or a Storybook preview entry. A component, story, or other module does not import that CSS. A JS import is a separate stylesheet: it can register `components` too early, and unlayered rules in it override every layered declaration.

### Unlayered styles

Unlayered author CSS beats every cascade layer, including utilities.

Rules that only set custom properties (tokens on `:root` and theme selectors) stay unlayered so they can override layered theme variables.

`prose.utilities.css` (imported from `globals.css`) has two unlayered selectors that set real properties. They size prose and beat typography utilities on the same element:

- `.prose.prose-sm` sets `font-size`, `line-height`, and `--icon-inline`
- `.prose.prose-md` sets `font-size`, `line-height`, and `--icon-inline`

Further unlayered rules that set layout or chrome fail the ownership test. Component appearance goes in `@layer components`. One-off utilities go in `@utility` or `@layer utilities`.

### Third-party CSS and code splitting

These packages are `@import`ed from the CSS entries:

- `tailwindcss` and `tw-animate-css` compile into the layers above
- `@fontsource-variable/inter` is unlayered `@font-face` only and does not set component chrome

`next/font` in the public root layout is the JS font exception. It follows `globals.css` and publishes `--font-body`. It does not set padding, borders, or other component properties.

Storybook also injects its own unlayered preview sheets (`@font-face` and `.sb-*` chrome) ahead of the app sheet. Those selectors do not style product components. The app sheet still opens with `properties`, then `theme`, `base`, `components`, `utilities`.

CSS modules and route-level CSS chunks are separate stylesheets, so their rules are unlayered or ordered on their own. Semantic CSS stays in the entry graph. There is no approved CSS-module or code-split exception.

`packages/ui/src/styles/css-layer-ownership.test.ts` checks entry imports, `@import` reachability, unlayered rules, and computed styles for the dev compiler output and the production minify of every entry.

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

Shared styling foundations do not replace component identity. `Badge` (`ui-badge`) and `Chip` (`ui-chip`) compose `ui-pill` for geometry. Appearance stays on Badge. Selection and removal stay on Chip. See [pill-badge-chip.md](./pill-badge-chip.md#identity).

| Family     | Responsibility                    | Canonical owner                                   | Composition relationship                                                                                                                                                                                                                                   |
| ---------- | --------------------------------- | ------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Fields     | Single-control field chrome       | `Input` / `Select` / `Textarea`                   | Share the field-control styling primitive                                                                                                                                                                                                                  |
| Fields     | Search input                      | `SearchBar`                                       | Composes `Input`; owns the leading icon and clear affordance                                                                                                                                                                                               |
| Fields     | Floating label                    | `FloatingLabelField`                              | Wraps a field control; owns label and float state only                                                                                                                                                                                                     |
| Fields     | Multi-segment field               | `JoinedPair` / `InputSelect` / `InputActionGroup` | Own the group shell; segments reuse field chrome                                                                                                                                                                                                           |
| Status     | Status text or count              | `Badge` (`ui-badge`)                              | Composes `ui-pill`; appearance is `ui-badge--*`, not a second style matrix. Icon slot may hold a `StatusIcon`                                                                                                                                              |
| Status     | Selectable or removable tag       | `Chip` (`ui-chip`)                                | Composes `ui-pill`; owns selection and removal. `ChipGroup` is layout only                                                                                                                                                                                 |
| Status     | Status glyph                      | `StatusIcon`                                      | Icon only, no badge surface                                                                                                                                                                                                                                |
| Status     | Status dot                        | `StatusDot`                                       | Compact indicator only                                                                                                                                                                                                                                     |
| Dialogs    | Dialog surface chrome             | `DialogPanel`                                     | Owns panel perimeter, insets, body, and action row                                                                                                                                                                                                         |
| Dialogs    | Dialog interaction                | `Modal`                                           | Uses `DialogPanel`                                                                                                                                                                                                                                         |
| Dialogs    | Confirmation workflow             | `ConfirmDialog`                                   | Composes `Modal`                                                                                                                                                                                                                                           |
| Dialogs    | Side panel                        | `Sheet`                                           | Uses `DialogPanel`                                                                                                                                                                                                                                         |
| Dialogs    | Dashboard drawer                  | `DrawerShell`                                     | Composes `Sheet`                                                                                                                                                                                                                                           |
| Surfaces   | Generic content card shell        | `Card`                                            | One `density` (`compact` / `comfortable` / `spacious`) drives inset + header copy via shell CSS vars; declarative `header` / `footer` / `stretch` for hub/form chrome; compound parts share `ui-card__title` / `ui-card__description` under the same shell |
| Surfaces   | Structural grouping surface       | `Panel`                                           | Root-owned inset (`compact` / `comfortable` / `spacious`); tones `transparent` / `quiet` / `subtle` / `strong` / `faint`. Not a content object, status, or sunken well. `bleed` drops inset.                                                               |
| Surfaces   | Divided vertical sibling stack    | `DividedStack`                                    | Structural `border-t` between direct children; density-scaled spacing — not entity or form field semantics                                                                                                                                                 |
| Surfaces   | Inset or sunken surface           | `InsetPanel`                                      | Not a card; no perimeter interaction                                                                                                                                                                                                                       |
| Surfaces   | Empty-state container             | `EmptyPanel`                                      | Thin owner for empty states (see [empty-state-containers.md](./empty-state-containers.md))                                                                                                                                                                 |
| Surfaces   | Selectable option card            | `SelectionOptionCard`                             | Owns selected and disabled chrome (option-card shell)                                                                                                                                                                                                      |
| Surfaces   | Card tone resolver                | `cardSurfaceVariants`                             | `ui-card` transparent/quiet/subtle/strong × interactive/selected/disabled; entity frames quiet; radio cards default strong                                                                                                                                 |
| Surfaces   | Radio option card                 | `RadioCard`                                       | `SelectionTarget` + `SelectionTargetRadio` on `ui-card` / `ui-radio-card`; row variant uses `InteractiveRow`                                                                                                                                               |
| Surfaces   | Catalog picker single-choice rows | `CatalogCard` (`selection`)                       | Leading radio utility; mutually exclusive with trailing actions                                                                                                                                                                                            |
| Surfaces   | Entity card perimeter (dashboard) | `EntityCardFrame`                                 | `cardSurfaceVariants` + `dash-entity-card` modifiers; publishes inset tokens                                                                                                                                                                               |
| Surfaces   | Entity card (dashboard)           | `EntityCard` → static / disclosure renderers      | Public facade; internal `EntityCardStaticRenderer` / `EntityCardDisclosureRenderer` compose `EntityCardFrame`; `EntityCardContent` owns `dash-entity-card__content`                                                                                        |
| Rows       | Interactive row states            | `InteractiveRow`                                  | Styling primitive for hover, selection, and disabled fills (not layout)                                                                                                                                                                                    |
| Rows       | Selection list container and rows | `InteractiveList` / `InteractiveListRow`          | Listbox, combobox, and picker rows — surface ladder + accent rail; not action menus                                                                                                                                                                        |
| Rows       | Action menu row (rich)            | `MenuChoiceRow`                                   | `DropdownMenuItem` + `DropdownMenuItemContent`; optional description; no `InteractiveList`                                                                                                                                                                 |
| Rows       | Identity row (media + title)      | `IdentityRow`                                     | Uses `IdentityFrame`; presentation only                                                                                                                                                                                                                    |
| Typography | Headings / eyebrows               | `Heading` / `Eyebrow`                             | Single-class `@utility` composites                                                                                                                                                                                                                         |
| Typography | Body and supporting text          | `Text`                                            | Role composites (`text-style-*`)                                                                                                                                                                                                                           |
| Typography | Inline status tone                | `SemanticText`                                    | Tone, emphasis, and icon; not a Text role                                                                                                                                                                                                                  |
| Surfaces   | Preview aside anatomy             | `PreviewRail`                                     | Card chrome composes `Panel` quiet bleed. Plain chrome defers the perimeter to `Sheet`. Width belongs to the placement column.                                                                                                                             |
| Surfaces   | Master-detail shells              | `Panel`                                           | Quiet bleed on the list and editor. Rows are quiet interactive `Card`. The viewport cap stays `master-detail-list-scroll.utilities.css`.                                                                                                                   |
| Navigation | App nav column                    | Dashboard `Sidebar` and bench `Sidebar`           | Separate shells. Items use `sidebarNavItemVariants`. Static sections use `NavSection`. Collapsible campaign sections use `SidebarNavSectionDisclosure`.                                                                                                    |
| Typography | Links                             | `Link`                                            | Uses the `text-action-*` utilities                                                                                                                                                                                                                         |

A `variant="selection"` request routes to `SelectionOptionCard`, not `Card`, so Card does not become one giant generic component. Treat Card's information-and-navigation scope as a hypothesis that classification may revise. Record those revisions here when ownership actually changes.

### Card footer labeled actions

Card and Alert share canonical copy scale (`ui-copy-title` size and heading weight), `--ui-anatomy-row-gap` between related header/copy rows, and `--ui-surface-inset-*` rhythm via [`copy-scale.css`](../src/components/ui/copy-scale.css) (typography ladder in [row-anatomy.md](./row-anatomy.md)). Alert keeps semantic variants and optional `leading`; Card keeps tone, elevation, and navigation. Choose **Card** for neutral hub tiles and invitations; choose **Alert** for status-colored guidance.

For labeled footer or Alert action controls, pass explicit `size` from `resolveSurfaceActionButtonSize(density)` in `@rpg/ui`. `CardFooter` is layout-only — no contextual descendant sizing. Persistent dashboard copy may use `announcement="none"` on Alert so variant color does not imply a live region.

| Card `density` | Labeled footer `Button` / `ButtonLink` `size` |
| -------------- | --------------------------------------------- |
| compact        | `sm`                                          |
| comfortable    | `sm`                                          |
| spacious       | `default` (md tier)                           |

Heading-line badge accessories use a parallel ladder with `Badge` sizes — see [row-anatomy.md](./row-anatomy.md#heading-accessories). Form submit footers, icon-only controls, and footers with caller-chosen sizes are out of scope for this resolver.

Title-line icon actions use a different map: `resolveEntityRowInlineIconActionButtonSize` inside `@rpg/ui` (`compact` and `comfortable` → `icon-xs`, `spacious` → `icon-sm`). `RadioOptionCard` details is the current caller. That resolver is separate from labeled footer `resolveSurfaceActionButtonSize` and stays unexported until a consumer outside this package needs it.

## Surface-relative borders

Neutral border color has one recipe: `ui-border--subtle`, `ui-border--default`, and `ui-border--strong` ([border ladder](./design-tokens.md#border-ladder)). Each class mixes on the element’s `--surface-current` and publishes `--ui-border-color`. Width, style, side, and radius stay on the component. JSX one-offs use the Tailwind utilities (`border-border`, `border-border-subtle`), which mix on the element the same way. Do not add a second recipe.

**Contrast reference**

- Perimeter of a painted plane: that plane. Set `--surface-current` to the fill on the same element as the strength class.
- Line on a transparent child (table body row, entity row-list group): the inherited parent plane. Do not give the child a new surface.
- Shared grid line over a state wash (row hover, selected, unavailable): the table plane, not the wash. Do not rebind `--surface-current` on those states.
- A cell that paints its own fill (header select and actions) uses that fill even when the body cell in the same column uses the table plane.

`var(--border*)` is legitimate only as the `:root` alias and the `*` safety net in `base.css` (imported from `globals.css`). It is not legitimate in component rules.

Component CSS must not set `border-color`, or a `border` shorthand that includes a color, on an element that also has `ui-border--*`. A later file of equal specificity would replace the strength color. State colors (primary selected, status tones) may override `--ui-border-color` or `border-color` in a more specific rule. That is the card selected pattern. When another owner already sets `border-color` on that element (interactive row defaults to transparent), keep the edge with a more specific side longhand of `var(--ui-border-color)`. That is the data-table body separator.

When a component already owns `border-color` through its own variable (inactive interactive row), point that variable at `var(--ui-border-color)` and put the strength class on the element. Do not assign `var(--border-subtle)`.

Header and body segments of one vertical rule may differ by a mix step because their fills differ. DataTable still owns bands. Filter region and utility bar still own their chrome. `DataTableFilterChrome` still owns filter presentation.

## Exception policy

An exception gets a one-line comment at the implementation, or a note in the component's doc, explaining why the surface is unique. While [semantic-css-migration.md](./semantic-css-migration.md) exists, classified exceptions are also recorded there. Do not copy that inventory into this document.
