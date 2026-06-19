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
