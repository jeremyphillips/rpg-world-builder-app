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

Document outline presets — pair each `variant` with the matching `as` level. Use **one
h1 per page** (route title via `page`, or entity title via `display` on detail routes).

| Variant / component           | `as`   | px   | Weight               | Use case                                                      |
| ----------------------------- | ------ | ---- | -------------------- | ------------------------------------------------------------- |
| `Heading` `display`           | `h1`   | 42   | 700                  | Hero, content detail entity titles                            |
| `Heading` `page`              | `h1`   | 34   | 600                  | Route titles (`PageHeader`)                                   |
| `Heading` `section`           | `h2`   | 28   | 300                  | Top-level in-page sections                                    |
| `Heading` `subsection`        | `h3`   | 19   | 600                  | Nested blocks within a section                                |
| `Heading` `group`             | `h4`   | 16   | 500                  | Headings inside subsections                                   |
| `Heading` `card`              | Radix  | 19   | 600                  | `CardTitle`, `Modal.Header` (chrome)                          |
| `Heading` `nav` / `brand`     | `span` | 16   | 600                  | Topbar title, sidebar product name                            |
| `Heading` `alert`             | Radix  | 16   | 600                  | Confirm dialog title                                          |
| `Heading` `label`             | `p`    | 16   | 500                  | Inline non-outline titles (trait names)                       |
| `Text` `body`                 | `p`    | 16   | 400                  | Default foreground copy                                       |
| `Text` `muted`                | `p`    | 16   | 400                  | Non-catalog plain copy (hints, errors)                        |
| `Text` `small`                | `p`    | 15   | 400                  | Helper text, secondary metadata                               |
| `Text` `caption`              | `p`    | 12   | 400                  | Form field hints                                              |
| `Text` `lead`                 | `p`    | 18   | 400                  | Marketing subheads                                            |
| `Text` `destructive`          | `p`    | 15   | 400                  | Inline errors — pair with `role="alert"`                      |
| `Eyebrow` `xs` / `sm` / `md`  | `p`    | 9–13 | 500 light / 300 dark | Uppercase section labels (`tone`: muted, foreground, primary) |
| `RichTextContent` `size="md"` | `div`  | 15   | 400                  | Catalog descriptions (TipTap / CMS HTML)                      |
| `CardDescription`             | `div`  | 15   | 400                  | Card header secondary line                                    |

Preserve semantic headings and existing `id`s — content detail routes use
`aria-labelledby` on sections.

## `Heading`

Polymorphic via `as`. Each `variant` maps to one **composite utility** in
[`styles/globals.css`](../src/styles/globals.css) (e.g. `heading-style-section`).
Size and weight tokens live in `@theme`; variants reference composites via
[`heading.variants.ts`](../src/components/ui/heading.variants.ts).

**Override policy:** set typography with `variant` (or `headingVariants()` on Radix
primitives). Do not override heading size/weight via atomic `text-heading-*` /
`font-heading-*` classes in `className` — use layout/color/spacing classes only.

```tsx
import { Heading } from '@rpg/ui'

<Heading variant="display" as="h1">{species.name}</Heading>
<Heading variant="section" as="h2" id="traits-heading">
  Traits
</Heading>
<Heading variant="subsection" as="h3">Wood Elf Heritage</Heading>
```

## `Text`

Polymorphic via `as`. All Tailwind lives in `text.variants.ts`.

```tsx
import { Text } from '@rpg/ui'

<RichTextContent html={species.description} size="md" tone="muted" />
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

| Prop   | Values                 | Default   | Notes                                                                 |
| ------ | ---------------------- | --------- | --------------------------------------------------------------------- |
| `html` | `string`               | required  | Sanitized before render                                               |
| `size` | `sm` \| `md` \| `base` | `base`    | `md` → `prose-md` (15px) for catalog detail; `sm` → `prose-sm` (14px) |
| `tone` | `default` \| `muted`   | `default` | `muted` maps prose tokens to muted foreground                         |

```tsx
import { RichTextContent } from '@rpg/ui'
;<RichTextContent html={trait.description} size="md" tone="muted" />
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

## Secondary body (`text-md`)

At 16px root, **`--text-md` is 15px** — one step between compact UI (`text-sm`,
14px) and primary body (`text-base`, 16px).

| Surface                                             | Size                              |
| --------------------------------------------------- | --------------------------------- |
| `RichTextContent` `size="md"` (`prose-md`)          | 15px via `.prose.prose-md`        |
| `RichTextContent` `size="sm"` (`prose-sm`)          | 14px via `.prose.prose-sm`        |
| `RichTextContent` `size="base"` (`prose`)           | 16px — primary body               |
| `Text` `small`, `destructive`, `emphasis`, `option` | `text-md`                         |
| `CardDescription`                                   | `text-md` (via `Text` small)      |
| Rich-text editor (`size="md"`)                      | `prose-md` (matches catalog read) |
| Rich-text editor (`size="sm"`)                      | `prose-sm`                        |
| Form fields (`size="md"`)                           | `text-md` labels + controls       |
| Form fields (`size="lg"`)                           | `text-base` labels + controls     |

Compact UI chrome (buttons, menus, data tables) stays on **`text-sm` (14px)**.

## Type scale

Primitive sizes live in [`styles/globals.css`](../src/styles/globals.css) `@theme inline`.
They override Tailwind’s built-in `text-*` utilities — components keep using `text-sm`,
`text-2xl`, etc.; the CSS variables are the single source of truth (@ 16px root):

| Token / utility       | px @ 16px root | Typical use                                     |
| --------------------- | -------------- | ----------------------------------------------- |
| `text-xs`             | 12             | Captions, table stat columns                    |
| `text-sm`             | 14             | Compact UI chrome (buttons, menus, data tables) |
| `text-md`             | 15             | Secondary body (`Text` small, `prose-md`, …)    |
| `text-base`           | 16             | Primary body default                            |
| `text-lg`             | 18             | Card titles, lead copy                          |
| `text-xl`             | 20             | Section headings                                |
| `text-2xl`            | 24             | Page titles                                     |
| `text-3xl`            | 30             | Content detail titles                           |
| `text-4xl`            | 36             | Marketing display (e.g. public hero)            |
| `text-5xl`            | 48             | Marketing display (responsive hero)             |
| `text-6xl`–`text-9xl` | 60–128         | Reserved; defined for completeness              |

## Form role aliases

| Role alias / utility         | px @ 16px root | Typical use                                                 |
| ---------------------------- | -------------- | ----------------------------------------------------------- |
| `text-field-group-legend`    | 24             | Top-level form group legends, collapsible section triggers  |
| `text-field-subgroup-legend` | 20             | Nested `kind: 'group'` legends (`legendSize: 'subsection'`) |
| `text-field-array-legend`    | 18             | Repeatable `kind: 'array'` section legends (default)        |

## Heading size tokens

Visual tiers and role aliases live in [`styles/globals.css`](../src/styles/globals.css).
Retune the document ladder via `--text-heading-1` … `--text-heading-5` (@ 16px root):

| Visual tier | Role alias                  | `Heading` variant                         | px  |
| ----------- | --------------------------- | ----------------------------------------- | --- |
| heading-1   | `--text-heading-display`    | `display`                                 | 42  |
| heading-2   | `--text-heading-page`       | `page`                                    | 34  |
| heading-3   | `--text-heading-section`    | `section`                                 | 28  |
| heading-4   | `--text-heading-subsection` | `subsection`, `card` (chrome)             | 19  |
| heading-5   | `--text-heading-group`      | `group`, `label`, `nav`, `brand`, `alert` | 16  |

`variant` controls appearance; `as` controls document semantics. Match the hierarchy
table above in app code.

## Composite typography utilities

Each `Heading` / `Eyebrow` variant maps to one `@utility` composite (e.g.
`heading-style-page`) that bundles size, line-height, weight, tracking, and (for
eyebrow) case. Color is set via `Eyebrow` `tone` (`text-muted-foreground`,
`text-foreground`, `text-primary`). Composites reference `@theme` variables only.

Visual reference: Storybook **`Typography/Composites`**.

Atomic `text-heading-*` / `font-heading-*` utilities remain generated from `@theme`
for token inspection and docs — components use composites via `headingVariants()`.

## Font weight tokens

Primitive weights and role aliases live in [`styles/globals.css`](../src/styles/globals.css).

| Role utility / token            | Value                | Typical use                               |
| ------------------------------- | -------------------- | ----------------------------------------- |
| `--font-weight-heading-display` | 700                  | `Heading` display                         |
| `--font-weight-heading`         | 600                  | page, subsection, card, nav, brand, alert |
| `--font-weight-heading-section` | 300                  | `Heading` section                         |
| `--font-weight-heading-group`   | 500                  | `Heading` group                           |
| `--font-weight-heading-label`   | 500                  | `Heading` label                           |
| `font-field-label`              | 600                  | Form field labels (`fieldLabelVariants`)  |
| `font-body-emphasis`            | 500                  | Button, badge, `Text` emphasis            |
| `font-body`                     | 400                  | `Text` body default                       |
| `font-meta`                     | 300                  | Data-table meta cells                     |
| `--font-weight-eyebrow`         | 500 light / 300 dark | `eyebrow-style-*` composites              |
| `font-data-name`                | 600                  | Data-table name cells                     |
| `font-data-stat`                | 500                  | Data-table stat columns                   |

## Meta typography tokens

Secondary copy sizes sit one step below the Tailwind text scale (at 16px root):

| Token / utility       | px @ 16px root | Use                                                               |
| --------------------- | -------------- | ----------------------------------------------------------------- |
| `text-2xs-meta`       | 9              | Ultra-compact meta; aliased by `text-eyebrow-xs`                  |
| `text-xs-meta`        | 11             | Shared meta base; aliased by `text-eyebrow-sm`                    |
| `text-sm-meta`        | 13             | Shared meta base; aliased by `text-eyebrow-md`, `text-table-body` |
| `text-md`             | 15             | Compact label `lg` (`Badge` / `Chip`); aliases `--text-md`        |
| `tracking-eyebrow-xs` | 1.2px          | Letter-spacing for `Eyebrow` `size="xs"`                          |
| `tracking-eyebrow`    | 1.6px          | Letter-spacing for `Eyebrow` `size="sm"` / `size="md"`            |

Compact-label vocabulary (`appearance`, `tone`, selected-control vs semantic soft) →
[compact-labels.md](./compact-labels.md).

Prefer `eyebrow-style-*` composites or `<Eyebrow>` for uppercase section labels; use
semantic aliases (`text-eyebrow-sm`) only when a composite is not appropriate; use
`text-xs-meta` / `text-sm-meta` directly for role-based typography (e.g. data-table meta).

Detail-page subgroup labels (for example Districts under City structure, or Governed by
under Territorial Authority) use `<Eyebrow size="sm">` with the default muted tone.
Pass **title-case** copy at the call site — the composite applies uppercase. Dashboard
layout for those subgroups is `DetailSectionGroup` (see
[cross-content-relationship-ui.md](../../../apps/dashboard/docs/cross-content-relationship-ui.md#detail-section-layout)).

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

Dialog chrome defaults: `Modal.Header` titles use `card` (19px); `Sheet.Header`
titles default to `sheetTitle` (24px). Both accept `headlineClassName` as the
escape hatch for genuine deviations.

## Dashboard content routes

Content catalog detail routes under `apps/dashboard/src/features/content/**/routes/*-detail.tsx`
must use `@rpg/ui` typography exports. See
[`apps/dashboard/docs/feature-conventions.md`](../../../apps/dashboard/docs/feature-conventions.md).

## Adding copy in apps

1. Reach for `Heading` / `Text` / `RichTextContent` first.
2. If a new scale is needed, add a named variant to `*.variants.ts` in
   `@rpg/ui` rather than inline classes in app code.
3. Run Storybook (light + dark) when touching prose or rich-text spacing.
