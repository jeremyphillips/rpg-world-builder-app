# Typography in `@rpg/ui`

Copy is split into two layers. Pick the right one before adding classes inline.

| Layer          | Use                                                               | API                         |
| -------------- | ----------------------------------------------------------------- | --------------------------- |
| **App chrome** | Page titles, section headings, plain descriptions, hints, errors  | `Heading`, `Text`           |
| **Rich HTML**  | TipTap / CMS output (paragraphs, lists, links inside stored HTML) | `RichTextContent` + `prose` |

Do **not** wrap whole pages in `prose`. The typography plugin resets margins, link
styles, and list behavior on all descendants and fights layout utilities
(`space-y-*`, grids, toolbars). Prose belongs on sanitized HTML blobs only.

## Hierarchy

| Variant / component           | Typical element | Use case                                                             |
| ----------------------------- | --------------- | -------------------------------------------------------------------- |
| `Heading` `page`              | `h1`–`h2`       | Route titles, overview shells                                        |
| `Heading` `display`           | `h2`            | Content detail titles (species, class, weapon names)                 |
| `Heading` `section`           | `h3`            | In-page sections (`Traits`, `Commonly Taken By`)                     |
| `Heading` `card`              | Radix title     | `CardTitle`, `Modal.Header` headline                                 |
| `Heading` `nav` / `brand`     | `h1`, `span`    | Topbar title, sidebar product name                                   |
| `Heading` `label`             | `p`, `span`     | Inline labels (feature names, trait titles)                          |
| `Text` `body`                 | `p`             | Default foreground copy                                              |
| `Text` `muted`                | `p`             | Non-catalog plain copy (hints, errors)                               |
| `Text` `small`                | `p`             | Helper text, secondary metadata (`text-sm text-muted-foreground`)    |
| `Text` `caption`              | `p`             | Extra-small muted italic copy (`text-xs`); used for form field hints |
| `Text` `lead`                 | `p`             | Marketing subheads                                                   |
| `Text` `destructive`          | `p`             | Inline errors — pair with `role="alert"` when live                   |
| `Eyebrow` `xs` / `sm` / `md`  | `p`             | Uppercase section labels; `xs` for dense preview cards               |
| `RichTextContent` `size="sm"` | `div`           | Catalog descriptions (top-level, traits, features)                   |
| `CardDescription`             | `div`           | Card header secondary line (uses shared `textVariants`)              |

Preserve semantic headings and existing `id`s when migrating — content detail
routes use `aria-labelledby` on trait sections.

## `Heading`

Polymorphic via `as`. All Tailwind lives in `heading.variants.ts`.

```tsx
import { Heading } from '@rpg/ui'

<Heading variant="display" as="h2">{species.name}</Heading>
<Heading variant="section" as="h3" id="traits-heading">
  Traits
</Heading>
```

## `Text`

Polymorphic via `as`. All Tailwind lives in `text.variants.ts`.

```tsx
import { Text } from '@rpg/ui'

<RichTextContent html={species.description} size="sm" tone="muted" />
<Text variant="destructive" role="alert">
  Could not load species.
</Text>
<Text as="a" variant="small" href="/classes" className="hover:underline">
  ← Classes
</Text>
```

Form hints and errors inside `Field.*`, `Form`, and field wrappers already compose
`Text` — do not re-add `text-sm text-muted-foreground` on those surfaces.

## `RichTextContent`

Always use this instead of raw `dangerouslySetInnerHTML`. Sanitization via
`sanitizeHtml` is built in.

| Prop   | Values               | Default   | Notes                                         |
| ------ | -------------------- | --------- | --------------------------------------------- |
| `html` | `string`             | required  | Sanitized before render                       |
| `size` | `sm` \| `base`       | `base`    | `sm` → `prose-sm` for catalog detail copy     |
| `tone` | `default` \| `muted` | `default` | `muted` maps prose tokens to muted foreground |

```tsx
import { RichTextContent } from '@rpg/ui'
;<RichTextContent html={trait.description} size="sm" tone="muted" />
```

Do not add `[&>p]:my-0` overrides — let the typography plugin manage paragraph
spacing. Verify spacing against real catalog JSON in Storybook when changing
prose config.

## Prose theme and dark mode

The `@tailwindcss/typography` plugin is registered once in
[`styles/globals.css`](../src/styles/globals.css). Token overrides on `@utility
prose` map `--tw-prose-*` variables to design tokens (`--color-foreground`,
`--color-primary`, `--color-muted-foreground`, …).

Light and dark themes share the same class names — switching the `dark` class on
a root element updates CSS variables, and prose colors follow automatically. No
per-theme prose classes are required in components.

## Meta typography tokens

Secondary copy sizes sit one step below the Tailwind text scale (at 16px root):

| Token / utility       | px @ 16px root | Use                                                                                |
| --------------------- | -------------- | ---------------------------------------------------------------------------------- |
| `text-2xs-meta`       | 9              | Ultra-compact meta; aliased by `text-eyebrow-xs`                                   |
| `text-xs-meta`        | 11             | Shared meta base; aliased by `text-badge-sm`, `text-eyebrow-sm`                    |
| `text-sm-meta`        | 13             | Shared meta base; aliased by `text-badge-md`, `text-eyebrow-md`, `text-table-body` |
| `tracking-eyebrow-xs` | 1.2px          | Letter-spacing for `Eyebrow` `size="xs"`                                           |
| `tracking-eyebrow`    | 1.6px          | Letter-spacing for `Eyebrow` `size="sm"` / `size="md"`                             |

Prefer semantic aliases (`text-eyebrow-sm`, `text-badge-sm`) in component variants; use
`text-xs-meta` / `text-sm-meta` directly for role-based typography (e.g. data-table meta).

## Internal primitives

Library-owned copy (modal descriptions, field hints, dropzone helpers, data-table
empty states) must pull from `textVariants`, `headingVariants`, or co-located
`*.variants.ts` files — not inline `text-*` strings in JSX.

When a Radix primitive requires a specific element (`Dialog.Title`,
`AlertDialog.Description`), apply variant classes directly:

```tsx
<DialogPrimitive.Title className={headingVariants({ variant: 'card' })}>
  {headline}
</DialogPrimitive.Title>
```

## Dashboard content routes

Content catalog detail routes under `apps/dashboard/src/features/content/**/routes/*-detail.tsx`
must use `@rpg/ui` typography exports. See
[`apps/dashboard/docs/feature-conventions.md`](../../../apps/dashboard/docs/feature-conventions.md).

## Adding copy in apps

1. Reach for `Heading` / `Text` / `RichTextContent` first.
2. If a new scale is needed, add a named variant to `*.variants.ts` in
   `@rpg/ui` rather than inline classes in app code.
3. Run Storybook (light + dark) when touching prose or rich-text spacing.
