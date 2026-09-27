# Feature-folder conventions

The dashboard is organized feature-first: each domain area lives in its own
folder under `src/features/<feature>/` and owns its UI, state, and data access.
Several domains are fully built (auth, campaign, content catalog, homebrew);
others remain **scaffolds** — a `README.md` describing intent plus a placeholder
`index.ts` — until their phase is built. See the feature status table in
[apps/dashboard/README.md](../README.md#feature-status).

**Folder layout SSOT** → [feature-structure.md](./feature-structure.md).

## Layout

Add these folders within a feature as it grows (none are required up front).
Canonical tree and per-folder rules → [feature-structure.md](./feature-structure.md).

| Folder        | Responsibility                                           |
| ------------- | -------------------------------------------------------- |
| `components/` | React components/widgets for this feature                |
| `routes/`     | Route-level screens mounted in the app router            |
| `hooks/`      | React hooks (data access via TanStack Query)             |
| `domain/`     | Pure domain types/logic, framework-agnostic              |
| `api/`        | Same-origin API client wrappers (`fetch("/api/...")`)    |
| `lib/`        | Non-route helpers — concern index in feature-structure   |
| `index.ts`    | Public barrel — the **only** entry other features import |

Do **not** re-export route screens from `index.ts`. The app router lazy-loads
route modules directly (`src/app/lazy-routes.ts`); barrel re-exports pin those
modules in the entry chunk and defeat code splitting. See
[code-splitting.md](./code-splitting.md) for the full splitting map and rules
for adding routes.

## Component naming

Dashboard modules use plain `<name>.tsx` / `<name>.ts` — no `.client` suffix, no
`'use client'` directive. Co-located `*.variants.ts`, `*.stories.tsx`, and
`*.test.tsx` follow the same base name.

`@rpg/ui` and `apps/public` (Next.js) retain `<name>.client.tsx` + `'use client'`
for interactive surfaces. Artifact table and hooks rules →
[feature-structure.md § components](./feature-structure.md#components).

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

## Vocabulary vs Game Terms

| Feature      | Owns                                                                | Consumers import         |
| ------------ | ------------------------------------------------------------------- | ------------------------ |
| `vocabulary` | API/hooks, option maps, labels, field factories, entry form model   | `content`, `campaign`, … |
| `game-terms` | Hub/overview/detail routes, sheets, columns, availability dialogs   | Router only (lazy)       |
| `homebrew`   | Homebrew hub, rules config, ruleset patch (unrelated to vocab move) | Rules patch call sites   |

Dependency invariant: `game-terms → vocabulary` only — never the reverse.

## Form lib

Schema-driven form modules under `lib/` — suffixes, split rules, and the
content catalog inventory → [feature-structure.md § lib](./feature-structure.md#lib-concern-index)
and [form-lib-conventions.md](./form-lib-conventions.md).

## Content catalog UI

Rules below apply to the `content` feature and its sub-areas. Overview,
master-detail abstraction, and tabbed forms →
[content/README.md](../src/features/content/README.md). Form module alignment
status → [form-lib inventory](./form-lib-conventions.md#content-catalog-inventory).

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

| Story title prefix | Use for                                             |
| ------------------ | --------------------------------------------------- |
| `Content/*`        | Catalog feature stories (detail routes, tables)     |
| `Layout/*`         | Shell/layout stories (`PageShell`, `PageHeader`, …) |

## Page layout

**Central invariant:** ordinary routes participate in document flow and never
establish a vertical scrollport. The browser (`html`/`body`) owns vertical scrolling
by default. Only bounded workspaces and intentionally independent component panes
may own vertical scrolling.

| Term                | Meaning                                               |
| ------------------- | ----------------------------------------------------- |
| Document scroll     | Default — browser scroll; no route-level scroll shell |
| Scroll container    | Intentional custom scrollport (`overflow-y-auto`)     |
| `ViewportWorkspace` | Opt-in bounded multi-pane editor shell                |

**ViewportWorkspace consumers** (bounded routes — no document scrollbar):

| Consumer                                                                                              | Route pattern                                        |
| ----------------------------------------------------------------------------------------------------- | ---------------------------------------------------- |
| [`ContentFormPageShell`](../src/features/content/lib/forms/shells/layout/content-form-page-shell.tsx) | Preview catalog create/edit (`scrollMode: viewport`) |
| [`MessagesWorkspaceShell`](../src/features/message/components/workspace/messages-workspace-shell.tsx) | `/messages`                                          |

`AppShell` publishes `--app-sticky-chrome-block-size` (sticky topbar + breadcrumb)
for workspace bounds and chrome-aware sticky rails; `<main>` aliases
`--rpg-content-top-inset` from that variable. `<main>` is horizontal gutter
only (`min-w-0 flex-1`) for document-scroll routes — not a height contract or
scrollport. When a descendant mounts `data-viewport-fill="workspace"`, AppShell
`:has()` caps the content column at one viewport height and main at `h-0`.

Inset vs child rhythm are **independent** on width shells:

| Prop      | SSOT                                                                                 | Default   | Role                                         |
| --------- | ------------------------------------------------------------------------------------ | --------- | -------------------------------------------- |
| `spacing` | [`page-spacing.variants.ts`](../src/components/layout/page/page-spacing.variants.ts) | `page`    | Shell vertical inset (`pt-6 pb-8` or `none`) |
| `rhythm`  | same file (`pageSpacingClasses`)                                                     | `compact` | Direct-child `space-y-*` only                |

Every route picks **one width shell** from `components/layout/page/`:

| Shell                                                                                                 | `width` prop      | Typical routes                                                                      |
| ----------------------------------------------------------------------------------------------------- | ----------------- | ----------------------------------------------------------------------------------- |
| [`PageShell`](../src/components/layout/page/page-shell.tsx)                                           | `full`            | Lists, hubs, tables, builders — uncapped main column                                |
| same                                                                                                  | `wide`            | Catalog detail, homebrew detail, preview-capable create/edit (~1280px)              |
| same                                                                                                  | `narrow`          | Settings, wizards, account settings, simple forms (~900px)                          |
| [`ContentFormPageShell`](../src/features/content/lib/forms/shells/layout/content-form-page-shell.tsx) | `narrow` / `wide` | Catalog create/edit — `resolveContentFormLayout` picks `scrollMode` and `pageWidth` |

Tokens: `--max-width-page-wide` / `--max-width-page-narrow` in `@rpg/ui` globals
(`max-w-page-wide`, `max-w-page-narrow`). **Do not** add nested page-level `max-w-*`
inside a width shell — domain layouts use flex/grid only.

Child rhythm tokens (`compact`, `list`, `relaxed`, `loose`) live in
[`page-spacing.variants.ts`](../src/components/layout/page/page-spacing.variants.ts).
Pass them via the `rhythm` prop — not `spacing`.

### Page chrome (composes inside a width shell)

| Component                                                            | Role                                          |
| -------------------------------------------------------------------- | --------------------------------------------- |
| [`PageHeader`](../src/components/layout/page/page-header.tsx)        | Page title + optional actions                 |
| [`PageLoadState`](../src/components/layout/page/page-load-state.tsx) | Spinner / error / ready body beneath a header |

```tsx
import { PageShell } from '@/components/layout/page/page-shell'
import { PageHeader } from '@/components/layout/page/page-header'

// Narrow settings page
<PageShell width="narrow" rhythm="relaxed">
  <PageHeader heading="Account" />
  {/* sections */}
</PageShell>

// Full-width hub (no domain shell needed)
<PageShell width="full" rhythm="relaxed">
  <PageHeader heading="Equipment" />
  {/* card grid */}
</PageShell>

// Content catalog create/edit — layout resolver picks scroll ownership once
const layout = resolveContentFormLayout(def)
<ContentFormPageShell scrollMode={layout.scrollMode} pageWidth={layout.pageWidth}>
  {/* form — viewport routes use bounded inner scroll; document routes use PageShell + documentScroll */}
</ContentFormPageShell>
```

### Domain layouts (feature-specific, nest inside a width shell)

- [`ContentOverviewShell`](../src/features/content/lib/overview/content-overview-shell.tsx)
  — managed catalog **list** recipe: `PageShell width="full"` + `PageHeader` + `PageLoadState`
  - campaign-manager "New" gating. Use for catalog list routes only.
- [`ContentDetailLayout`](../src/features/content/lib/detail/page/content-detail-layout.tsx)
  — catalog **detail** recipe (includes `PageShell width="wide"` by default): sticky edit actions, hero
  card (name + metadata + artwork), then an optional **On this page** scroll-spy
  rail beside the body column. Use [`ContentDetailSection`](../src/features/content/lib/detail/page/content-detail-section.tsx)
  for bordered section panels (subtle header, faint body); [`ContentDetailSectionItem`](../src/features/content/lib/detail/page/content-detail-section.tsx)
  for array entries that need nav leaves. Pass static rows via `statRows` or hook-driven
  rows via `metadata`. Description prose belongs in `descriptionContent` (panel + nav),
  not duplicated in the hero excerpt (`heroDescription={false}` when using the panel).

  Wide blocks (e.g. [`ClassProgressionTable`](../src/features/content/classes/components/detail/class-progression-table.tsx))
  belong **inside** the layout body as `ContentDetailSection` panels — not as
  siblings outside the layout.

```tsx
import { ContentDetailLayout } from '@/features/content/lib/detail/page/content-detail-layout'
;<ContentDetailLayout
  contentTypeKey="feats"
  name={item.name}
  statRows={rows}
  displayImage={displayImage}
  imageName={item.name}
  campaignId={campaignId}
  editHref={contentEditHref('feats', campaignId, item.id)}
  descriptionContent={<RichTextContent html={item.description} size="md" tone="muted" />}
>
  {/* sections and wide panels */}
</ContentDetailLayout>
```

Do not use `ContentOverviewShell` for non-catalog full-width pages (hubs,
dashboard widgets, etc.) — compose `PageShell width="full"` + `PageHeader` directly instead.

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

Column story pattern — use `STORY_CAMPAIGN_ID` and a fixture list; column
recipes live in sub-area `lib/` (not `components/`):

```tsx
import { STORY_CAMPAIGN_ID } from '../../lib/fixtures/constants'
import { SPECIES_LIST } from '../fixtures'
import { speciesColumns, speciesFilters } from '../lib/species-overview-columns'
;<DataTable columns={speciesColumns(STORY_CAMPAIGN_ID)} data={[...SPECIES_LIST]} />
```

### DataTable column recipes

Catalog and homebrew overview tables share styling via `@rpg/ui` cell helpers
(`NameCell`, `TableBadgeCell`, `dataTableColumnMeta`) and dashboard builders in
[`src/lib/data-table/column-builders.tsx`](../src/lib/data-table/column-builders.tsx).

Non-content list routes compose
[`CatalogOverviewTable`](../src/lib/data-table/catalog-overview-table.tsx)
(utility strip, column prefs, optional filters). Content lists use
`ContentOverviewTable` — layer boundaries and collection-summary columns are
documented in [catalog-overview-tables.md](./catalog-overview-tables.md).

| Helper                       | Use                                                  |
| ---------------------------- | ---------------------------------------------------- |
| `buildNameColumn`            | Sortable identity column (name/label)                |
| `buildSourceColumn`          | Source badge column — pass a domain `SourceBadgeMap` |
| `buildCollectionCountColumn` | Array-backed count + `CollectionSummaryCell` tooltip |
| `stampDataColumns`           | Apply `columnTone: 'data'` to middle columns         |
| `withColumnWidth`            | Pin column width via `dataTableWidthMeta` preset     |
| `buildContentColumns`        | Content overviews — image + name + middle + source   |

Use `dataTableWidthMeta('compact')` (from `@rpg/ui`) for narrow fixed columns
(hit die, spellcasting, source). Presets: `image`, `compact`, `compactCenter`,
`medium`, `minimal`. `compact` / `compactCenter` / `medium` pin width at `lg+`
only; below `lg` columns size to content (table still scrolls horizontally).

Do not hand-wire `font-semibold`, `Badge size="sm"`, `columnTone`, or raw
`w-[…]` width classes in feature column files; use the builders, cell helpers,
and width presets so tables stay visually in sync.

### Content feature tracks (ownership)

| Track           | Scope                                                    | Primary locations                                                     |
| --------------- | -------------------------------------------------------- | --------------------------------------------------------------------- |
| Campaign access | Discovery policy, participant roster, overview filtering | `@rpg/contracts` viewer-access, API list handlers, `campaign-access/` |
| Overview rows   | Two-line name cell, utility actions, metadata            | `content/lib/overview/`                                               |
| Duplication     | API transform + dashboard dialog                         | `apps/api/docs/content-duplication.md`, `content/lib/duplication/`    |

Duplication does **not** own campaign-access enforcement — it consumes shared create/slug infrastructure only.

Use `pickClass()` / `pickSubclassesForClass()` from `lib/fixtures/pick` for
one-off catalog slugs not worth a named fixture export.

### Digit-sized level and hit-die selects

Narrow numeric selects use `digits` on the `@rpg/ui` field config (see
[`packages/ui/docs/forms.md`](../../../packages/ui/docs/forms.md)). The trigger
displays option **labels**, so digit-sized level picks must use compact labels.

| Helper                                                                                                                    | Use                                                                  |
| ------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| [`getLevelFieldOptions(ctx)`](../src/features/content/lib/form-options/level-field-options.ts)                            | Level selects — numeric labels; grouped when extended tier is active |
| [`getLevelFieldOptions(ctx, { showTierLabels: false })`](../src/features/content/lib/form-options/level-field-options.ts) | Flat level list (chips, controls without option groups)              |
| [`levelSelectDigits(ctx)`](../src/features/content/lib/form-options/level-field-options.ts)                               | `digits` slot count from campaign max level                          |
| [`HIT_DIE_SELECT_DIGITS`](../src/features/content/lib/form-options/level-field-options.ts)                                | Constant `3` for `d6`–`d12` labels                                   |

Contracts SSOT:
[`buildGroupedLevelOptions`](../../../packages/contracts/src/rpg/campaign/campaign-rules.ts)
(with optional `{ showTierLabels: false }`).

Walk speed, weapon range, and spell distance use [`feetInputUnitField`](../src/features/content/lib/forms/fields/content-identity-form-fields.ts)
(`type: 'inputUnit'`, `unit: 'ft.'`). Fixed-pound weight uses auto-switched
[`scalarUnitInputSelectField`](../src/features/content/lib/forms/fields/content-speed-form-fields.ts)
(`fixedUnit: 'lb.'` when only one unit option).

Detail route shells use [`ContentDetailResolver`](../src/features/content/lib/detail/page/content-detail-resolver.tsx)
for loading, error, and not-found states (parallel to
[`ContentOverviewShell`](../src/features/content/lib/overview/content-overview-shell.tsx)
on list pages).

For route shells that need TanStack Query (loading, error, not-found), add
`withDashboardProviders` from
[`apps/dashboard/.storybook/decorators.tsx`](../.storybook/decorators.tsx) per
story, not globally. MSW remains deferred until those stories are authored.

The dashboard preview wraps every story in `MemoryRouter` so column tables with
`<Link>` name cells and detail `Edit` links render correctly. Layout stories
that use `<Outlet />` still need their own `Routes`/`Route` tree in the story
`render` function.
