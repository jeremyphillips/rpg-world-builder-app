# Feature-folder conventions

The dashboard is organized feature-first: each domain area lives in its own
folder under `src/features/<feature>/` and owns its UI, state, and data access.
Most feature folders here are **scaffolds** — a `README.md` describing intent
plus a placeholder `index.ts` — until their phase is built.

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

## Typography

Content catalog detail routes (`src/features/content/**/routes/*-detail.tsx`)
and their co-located stories must use `@rpg/ui` typography exports — `Heading`,
`Text`, and `RichTextContent` — rather than hand-rolled `text-*` classes.

Standard pattern:

```tsx
import { Heading, Text, RichTextContent } from '@rpg/ui'

<Heading variant="display" as="h2">{item.name}</Heading>
<RichTextContent html={item.description} size="sm" tone="muted" />
<Heading variant="section" as="h3" id="traits-heading">Traits</Heading>
<RichTextContent html={trait.description} size="sm" tone="muted" />
```

Preserve semantic `as` values and section `id`s used by `aria-labelledby`. Full
hierarchy and prose rules: [`packages/ui/docs/typography.md`](../../../packages/ui/docs/typography.md).

## Storybook

Co-located `*.stories.tsx` files run in the **dashboard** Storybook instance
(`pnpm storybook:dashboard`, port **6007**). Primitives and form recipes belong
in `@rpg/ui` Storybook (`:6006`) instead.

| Story title prefix | Use for                                                          |
| ------------------ | ---------------------------------------------------------------- |
| `Content/*`        | Catalog feature stories (detail routes, tables)                  |
| `Layout/*`         | Shell/layout stories (`NarrowPage`, `WidePage`, `PageHeader`, …) |

## Page layout

Every route picks **one width shell** from `components/layout/`:

| Shell                                                    | Width                | Typical routes                                                      |
| -------------------------------------------------------- | -------------------- | ------------------------------------------------------------------- |
| [`NarrowPage`](../src/components/layout/narrow-page.tsx) | Centered `max-w-3xl` | Settings, wizards, account/profile stubs, content create/edit forms |
| [`WidePage`](../src/components/layout/wide-page.tsx)     | Full main column     | Lists, hubs, detail pages, tables                                   |

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
  — two-column detail **presentation** (2/3 content + 1/3 artwork). Wrap in
  `WidePage`; not a width shell itself.

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

Use `pickClass()` / `pickSubclassesForClass()` from `lib/fixtures/pick` for
one-off catalog slugs not worth a named fixture export.

### Digit-sized level and hit-die selects

Narrow numeric selects use `digits` on the `@rpg/ui` field config (see
[`packages/ui/docs/forms.md`](../../../packages/ui/docs/forms.md)). The trigger
displays option **labels**, so digit-sized level picks must use compact labels.

| Helper                                                                                          | Use                                                      |
| ----------------------------------------------------------------------------------------------- | -------------------------------------------------------- |
| [`getCompactLevelFieldOptions(ctx)`](../src/features/content/lib/level-field-options.ts)        | Flat level list with `"1"`, `"2"`, … labels              |
| [`getCompactLevelFieldOptionsGrouped(ctx)`](../src/features/content/lib/level-field-options.ts) | Same labels, grouped when extended progression is active |
| [`levelSelectDigits(ctx)`](../src/features/content/lib/level-field-options.ts)                  | `digits` slot count from campaign max level              |
| [`HIT_DIE_SELECT_DIGITS`](../src/features/content/lib/level-field-options.ts)                   | Constant `3` for `d6`–`d12` labels                       |

Keep [`getLevelFieldOptions`](../../../apps/dashboard/src/features/content/lib/level-field-options.ts)
(with `"Level N"` labels) for full-width selects that include non-numeric
options (e.g. subclass choice level with `"None"`). Standalone fields with hints
use default `width: 'full'`; row fields pair `digits` with `width: 'auto'`.

Walk speed fields use [`walkSpeedInlineCountField`](../src/features/content/lib/content-form-field-helpers.ts)
(`inlineChooseCount` with `prefix: ''`, `suffix: 'ft.'`, `digits: 2`) in species
and grant authoring.

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
