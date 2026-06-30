# Feature-folder conventions

The dashboard is organized feature-first: each domain area lives in its own
folder under `src/features/<feature>/` and owns its UI, state, and data access.
Several domains are fully built (auth, campaign, content catalog, homebrew);
others remain **scaffolds** — a `README.md` describing intent plus a placeholder
`index.ts` — until their phase is built. See the feature status table in
[apps/dashboard/README.md](../README.md#feature-status).

## Layout

Add these folders within a feature as it grows (none are required up front):

| Folder        | Responsibility                                           |
| ------------- | -------------------------------------------------------- |
| `components/` | React components/widgets for this feature                |
| `routes/`     | Route-level screens mounted in the app router            |
| `hooks/`      | React hooks (data access via TanStack Query)             |
| `domain/`     | Pure domain types/logic, framework-agnostic              |
| `api/`        | Same-origin API client wrappers (`fetch("/api/...")`)    |
| `index.ts`    | Public barrel — the **only** entry other features import |

Do **not** re-export route screens from `index.ts`. The app router lazy-loads
route modules directly (`src/app/lazy-routes.ts`); barrel re-exports pin those
modules in the entry chunk and defeat code splitting. See
[code-splitting.md](./code-splitting.md) for the full splitting map and rules
for adding routes.

See the implemented [`auth`](../src/features/auth) feature for a worked example.

## Boundary rule

The ESLint feature-boundary rule (`@rpg/config/eslint/base`) treats each direct
child of `src/features/` as one boundary element. A feature may only import
another feature through its `index.ts` barrel — never its internals. Code under
`src/` outside `features/` is shared and may be imported freely.

```text
src/features/<feature>/
  components/  routes/  hooks/  domain/  api/  index.ts   <- import surface
```

Nested folders (e.g. `content/spells/`) are part of their parent feature, not
separate boundary elements, so imports within a feature are unrestricted.

## Form lib

Schema-driven form modules under `lib/` use the suffix and split rules in
[form-lib-conventions.md](./form-lib-conventions.md) (`*-form-def`, `*-form-fields`,
`*-form-values`, `*-form-labels`).

## Typography

Content catalog detail routes (`src/features/content/**/routes/*-detail.tsx`)
and their co-located stories must use `@rpg/ui` typography exports — `Heading`,
`Text`, and `RichTextContent` — rather than hand-rolled `text-*` classes.

Standard pattern:

```tsx
import { Heading, Text, RichTextContent } from '@rpg/ui'

<Heading variant="display" as="h1">{item.name}</Heading>
<RichTextContent html={item.description} size="md" tone="muted" />
<Heading variant="section" as="h2" id="traits-heading">Traits</Heading>
<Heading variant="subsection" as="h3">Heritage name</Heading>
<RichTextContent html={trait.description} size="md" tone="muted" />
```

Use **one h1 per page** (`page` on list/settings routes, `display` on detail entity
titles). Do not override heading typography with atomic `text-heading-*` classes in
`className`.

Preserve semantic `as` values and section `id`s used by `aria-labelledby`. Full
hierarchy and prose rules: [`packages/ui/docs/typography.md`](../../../packages/ui/docs/typography.md).

## Storybook

Co-located `*.stories.tsx` files run in the **dashboard** Storybook instance
(`pnpm storybook:dashboard`, port **6007**). Primitives and form recipes belong
in `@rpg/ui` Storybook (`:6006`) instead.

### Routing in stories

[`preview.tsx`](../.storybook/preview.tsx) wraps every story in `MemoryRouter`.
Do **not** import or render `MemoryRouter`, `BrowserRouter`, or `RouterProvider`
in story decorators — nested routers throw at runtime and fail the Storybook
test runner. ESLint enforces this on `**/*.stories.tsx`.

| Context                                 | Router?                                                |
| --------------------------------------- | ------------------------------------------------------ |
| Dashboard `*.stories.tsx`               | No — preview provides it                               |
| Dashboard `*.test.tsx`                  | Only if the component uses `Link`, `useNavigate`, etc. |
| Component uses `#` anchors / props only | No router in stories or tests                          |

For layout-only decorators, use page shells or a `<div>` — not a router.

| Story title prefix | Use for                                                          |
| ------------------ | ---------------------------------------------------------------- |
| `Content/*`        | Catalog feature stories (detail routes, tables)                  |
| `Layout/*`         | Shell/layout stories (`NarrowPage`, `WidePage`, `PageHeader`, …) |

## Page layout

Every route picks **one width shell** from `components/layout/`:

| Shell                                                    | Width                | Typical routes                                                      |
| -------------------------------------------------------- | -------------------- | ------------------------------------------------------------------- |
| [`NarrowPage`](../src/components/layout/narrow-page.tsx) | Centered `max-w-4xl` | Settings, wizards, account/profile stubs, content create/edit forms |
| [`WidePage`](../src/components/layout/wide-page.tsx)     | Full main column     | Lists, hubs, detail pages, tables                                   |

Nested readable columns inside `WidePage` use
[`narrowPageContentClasses`](../src/components/layout/page-content.variants.ts)
(left-aligned `max-w-narrow-content`, ~660px) — narrower than `NarrowPage`, for prose
body sections on catalog detail routes.

Shared spacing tokens live in
[`page-spacing.variants.ts`](../src/components/layout/page-spacing.variants.ts):
`compact` (space-y-2), `list` (space-y-4), `relaxed` (space-y-6), `loose`
(space-y-10). Pass `className="pb-10"` on long narrow forms so the sticky footer
clears the viewport.

### Page chrome (composes inside a width shell)

| Component                                                       | Role                                          |
| --------------------------------------------------------------- | --------------------------------------------- |
| [`PageHeader`](../src/components/layout/page-header.tsx)        | Page title + optional actions                 |
| [`PageLoadState`](../src/components/layout/page-load-state.tsx) | Spinner / error / ready body beneath a header |

```tsx
import { NarrowPage } from '@/components/layout/narrow-page'
import { PageHeader } from '@/components/layout/page-header'
import { WidePage } from '@/components/layout/wide-page'

// Narrow form page
<NarrowPage spacing="relaxed" className="pb-10">
  <PageHeader heading="New Species" />
  {/* form */}
</NarrowPage>

// Full-width hub (no domain shell needed)
<WidePage spacing="relaxed">
  <PageHeader heading="Equipment" />
  {/* card grid */}
</WidePage>
```

### Domain layouts (feature-specific, nest inside a width shell)

- [`ContentOverviewShell`](../src/features/content/lib/content-overview-shell.tsx)
  — managed catalog **list** recipe: `WidePage` + `PageHeader` + `PageLoadState`
  - campaign-manager "New" gating. Use for catalog list routes only.
- [`ContentDetailLayout`](../src/features/content/lib/content-detail-layout.tsx)
  — catalog **detail** recipe inside `WidePage`: edit toolbar, full-width hero
  card (name + metadata + artwork), then a `narrowPageContentClasses` body column
  for description and sections. Pass static rows via `statRows` or hook-driven
  rows via `metadata` (e.g. species creature type). Not a page width shell.

  Full-width blocks (e.g. [`ClassProgressionTable`](../src/features/content/classes/components/class-progression-table.tsx))
  render as **siblings** below `ContentDetailLayout` in the same `WidePage` — do
  not nest wide tables inside the layout.

```tsx
import { WidePage } from '@/components/layout/wide-page'
import { ContentDetailLayout } from '@/features/content/lib/content-detail-layout'
;<WidePage spacing="relaxed">
  <ContentDetailLayout
    name={item.name}
    statRows={rows}
    imageUrl={getContentImageUrl(item.imageKey)}
    imageName={item.name}
    campaignId={campaignId}
    editHref={contentEditHref('feats', campaignId, item.id)}
    descriptionContent={<RichTextContent html={item.description} size="md" tone="muted" />}
  >
    {/* narrow sections */}
  </ContentDetailLayout>
  <ClassProgressionTable characterClass={characterClass} campaignRules={campaignRules} />
</WidePage>
```

Do not use `ContentOverviewShell` for non-catalog full-width pages (hubs,
dashboard widgets, etc.) — compose `WidePage` + `PageHeader` directly instead.

Use CSF3 with `satisfies Meta<typeof Component>` and `StoryObj` (not
`StoryObj<typeof meta>`) for custom `render` stories.

### Catalog fixtures

System SRD data lives in [`@rpg/catalog`](../../../packages/catalog/README.md).
Dashboard stories import **catalog picks**, not hand-copied JSON or `apps/api`
seed paths.

| Location                                                                      | Purpose                                                              |
| ----------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| [`src/features/content/lib/fixtures/`](../src/features/content/lib/fixtures/) | `STORY_CAMPAIGN_ID`, `STORY_RULESET_ID`, `pick*()` helpers           |
| `src/features/content/<type>/fixtures.ts`                                     | Named exports (`ORC`, `SPECIES_LIST`, …) for detail + column stories |

Detail story pattern — render the exported `*DetailContent` from the route
file with a fixture:

```tsx
import { ELF, ORC } from '../fixtures'
import { SpeciesDetailContent } from './species-detail'

export const NoHeritageChoices: Story = {
  render: () => <SpeciesDetailContent species={ORC} />,
}
```

Column story pattern — use `STORY_CAMPAIGN_ID` and a fixture list:

```tsx
import { STORY_CAMPAIGN_ID } from '../../lib/fixtures/constants'
import { SPECIES_LIST } from '../fixtures'
;<DataTable columns={speciesColumns(STORY_CAMPAIGN_ID)} data={[...SPECIES_LIST]} />
```

### DataTable column recipes

Catalog and homebrew overview tables share styling via `@rpg/ui` cell helpers
(`NameCell`, `TableBadgeCell`, `dataTableColumnMeta`) and dashboard builders in
[`src/lib/data-table/column-builders.tsx`](../src/lib/data-table/column-builders.tsx).

| Helper                | Use                                                  |
| --------------------- | ---------------------------------------------------- |
| `buildNameColumn`     | Sortable identity column (name/label)                |
| `buildSourceColumn`   | Source badge column — pass a domain `SourceBadgeMap` |
| `stampDataColumns`    | Apply `columnTone: 'data'` to middle columns         |
| `withColumnWidth`     | Pin column width via `dataTableWidthMeta` preset     |
| `buildContentColumns` | Content overviews — image + name + middle + source   |

Use `dataTableWidthMeta('compact')` (from `@rpg/ui`) for narrow fixed columns
(hit die, spellcasting, source). Presets: `image`, `compact`, `compactCenter`,
`medium`, `minimal`. `compact` / `compactCenter` / `medium` pin width at `lg+`
only; below `lg` columns size to content (table still scrolls horizontally).

Do not hand-wire `font-semibold`, `Badge size="sm"`, `columnTone`, or raw
`w-[…]` width classes in feature column files; use the builders, cell helpers,
and width presets so tables stay visually in sync.

Use `pickClass()` / `pickSubclassesForClass()` from `lib/fixtures/pick` for
one-off catalog slugs not worth a named fixture export.

### Digit-sized level and hit-die selects

Narrow numeric selects use `digits` on the `@rpg/ui` field config (see
[`packages/ui/docs/forms.md`](../../../packages/ui/docs/forms.md)). The trigger
displays option **labels**, so digit-sized level picks must use compact labels.

| Helper                                                                                                       | Use                                                                  |
| ------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------- |
| [`getLevelFieldOptions(ctx)`](../src/features/content/lib/level-field-options.ts)                            | Level selects — numeric labels; grouped when extended tier is active |
| [`getLevelFieldOptions(ctx, { showTierLabels: false })`](../src/features/content/lib/level-field-options.ts) | Flat level list (chips, controls without option groups)              |
| [`levelSelectDigits(ctx)`](../src/features/content/lib/level-field-options.ts)                               | `digits` slot count from campaign max level                          |
| [`HIT_DIE_SELECT_DIGITS`](../src/features/content/lib/level-field-options.ts)                                | Constant `3` for `d6`–`d12` labels                                   |

Contracts SSOT:
[`buildGroupedLevelOptions`](../../../packages/contracts/src/platform/campaign-rules.ts)
(with optional `{ showTierLabels: false }`).

Walk speed, weapon range, and spell distance use [`feetInputUnitField`](../src/features/content/lib/content-form-field-helpers.ts)
(`type: 'inputUnit'`, `unit: 'ft.'`). Fixed-pound weight uses auto-switched
[`scalarUnitInputSelectField`](../src/features/content/lib/content-form-field-helpers.ts)
(`fixedUnit: 'lb.'` when only one unit option).

Detail route shells use [`ContentDetailResolver`](../src/features/content/lib/content-detail-resolver.tsx)
for loading, error, and not-found states (parallel to
[`ContentOverviewShell`](../src/features/content/lib/content-overview-shell.tsx)
on list pages).

For route shells that need TanStack Query (loading, error, not-found), add
`withDashboardProviders` from
[`apps/dashboard/.storybook/decorators.tsx`](../.storybook/decorators.tsx) per
story, not globally. MSW remains deferred until those stories are authored.

The dashboard preview wraps every story in `MemoryRouter` so column tables with
`<Link>` name cells and detail `Edit` links render correctly. Layout stories
that use `<Outlet />` still need their own `Routes`/`Route` tree in the story
`render` function.
