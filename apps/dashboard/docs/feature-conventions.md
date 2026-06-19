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
<Text variant="muted">{item.description}</Text>
<Heading variant="section" as="h3" id="traits-heading">Traits</Heading>
<RichTextContent html={trait.description} size="sm" tone="muted" />
```

Preserve semantic `as` values and section `id`s used by `aria-labelledby`. Full
hierarchy and prose rules: [`packages/ui/docs/typography.md`](../../../packages/ui/docs/typography.md).

## Storybook

Co-located `*.stories.tsx` files run in the **dashboard** Storybook instance
(`pnpm storybook:dashboard`, port **6007**). Primitives and form recipes belong
in `@rpg/ui` Storybook (`:6006`) instead.

| Story title prefix | Use for                                         |
| ------------------ | ----------------------------------------------- |
| `Content/*`        | Catalog feature stories (detail routes, tables) |
| `Layout/*`         | Shell/layout stories (e.g. concentration mode)  |

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

export const NoChoiceGroups: Story = {
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

For route shells that need TanStack Query (loading, error, not-found), add
`withDashboardProviders` from
[`apps/dashboard/.storybook/decorators.tsx`](../.storybook/decorators.tsx) per
story, not globally. MSW remains deferred until those stories are authored.

The dashboard preview wraps every story in `MemoryRouter` so column tables with
`<Link>` name cells and detail `Edit` links render correctly. Layout stories
that use `<Outlet />` still need their own `Routes`/`Route` tree in the story
`render` function.
