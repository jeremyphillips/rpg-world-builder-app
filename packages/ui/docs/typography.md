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

| Variant / component               | `as`   | px      | Weight               | Use case                                                                               |
| --------------------------------- | ------ | ------- | -------------------- | -------------------------------------------------------------------------------------- |
| `Heading` `display`               | `h1`   | 42      | 700                  | Hero, content detail entity titles                                                     |
| `Heading` `page`                  | `h1`   | 34      | 600                  | Route titles (`PageHeader`)                                                            |
| `Heading` `heroTitle`             | `h1`   | 18→34   | 600                  | Page hero titles (`Hero`, campaign overview) — 18px mobile, 20px md, 34px lg+          |
| `Heading` `section`               | `h2`   | 28      | 600                  | Top-level in-page sections                                                             |
| `Heading` `subsection`            | `h3`   | 18      | 600                  | Nested blocks within a section                                                         |
| `Heading` `group`                 | `h4`   | 16      | 500                  | Headings inside subsections                                                            |
| `Heading` `card`                  | Radix  | 18      | 600                  | Legacy / non-card surfaces; **not** generic `Card` headers (see below)                 |
| `Heading` `dialogTitle`           | Radix  | 18→20   | 600                  | `Modal.Header` / `Sheet.Header` default (18px mobile, 20px md+)                        |
| `Heading` `confirmDialogTitle`    | Radix  | 18      | 600                  | `ConfirmDialog` title — compact, non-responsive                                        |
| `Heading` `nav` / `brand`         | `span` | 16      | 600                  | Topbar title, sidebar product name                                                     |
| `Heading` `alert`                 | Radix  | 16      | 600                  | Inline `Alert` titles                                                                  |
| `Heading` `label`                 | `p`    | 16      | 500                  | Inline non-outline titles (trait names)                                                |
| `Text` `body`                     | `p`    | inherit | inherit              | Foreground color only. Size and line height inherit (16px / 24px at the document root) |
| `Text` `body-compact`             | `p`    | 14      | 400                  | Primary foreground plain copy at detail density (mechanical lines, non-HTML prose)     |
| `Text` `supporting`               | `p`    | 14      | 400                  | Secondary explanatory copy (preferred over `muted` + `text-sm`)                        |
| `Text` `caption`                  | `p`    | 12      | 400                  | Small supplemental metadata                                                            |
| `Text` `micro`                    | `span` | 10      | 400                  | Fine metadata owner — pair with `SemanticText` for toned inline status (PreviewRail)   |
| `Text` `label`                    | `p`    | 14      | 500                  | Compact UI descriptor — not a native form `<label>`                                    |
| `Text` `muted`                    | `p`    | inherit | 400                  | Color-only muted treatment (legacy — prefer `supporting` / `caption`)                  |
| `Text` `lead`                     | `p`    | 18      | 400                  | Marketing subheads                                                                     |
| `Text` `destructive`              | `p`    | inherit | inherit              | Status color only. Size, line height, and weight inherit — pair with `role="alert"`    |
| `Eyebrow` `xs` / `sm` / `md`      | `p`    | 9–13    | 500 light / 300 dark | Uppercase section labels (`tone`: muted, foreground, primary)                          |
| `RichTextContent` `size="md"`     | `div`  | 15      | 400                  | Catalog descriptions (TipTap / CMS HTML)                                               |
| Generic `Card` header title       | `h3`   | 14–18   | 600 (`heading`)      | `ui-card__title` — size from `Card` `density`; weight from heading role                |
| Anatomy title (`ui-copy-title`)   | varies | 14–18   | 600 (`heading`)      | 14/20, 16/22, 18/26 by density — [row-anatomy.md](./row-anatomy.md#anatomy-title-copy) |
| Generic `Card` header description | `p`    | 12–14   | shell vars           | `ui-card__description` — comfortable/spacious 14px; compact 12px                       |

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

Polymorphic via `as`. Each `variant` maps 1:1 to a `text-style-*` composite in
[`text.variants.ts`](../src/components/ui/text.variants.ts). Storybook
**Typography/Text → Role catalog** lists every variant (grouped by policy category).

### Role contract

A typography role (`body-compact`, `caption`, `supporting`, `label`, and the other
size-setting `text-style-*` roles) establishes the typography contract: size, line
height, and any default color or weight that role declares.

A tone-only variant (`info`, `success`, `warning`, `destructive`) establishes color.
It does not establish size or weight. `muted` and `body` are already color-only.
`body` inherits size and line height. It does not specify 16px. At the document root
that inheritance computes to 16px / 24px. The 15px tone lock is retired on purpose:
a size-less tone inherits from its parent, and a `text-sm` or `text-xs` on the same
element keeps both the size and the tone color.

| Category              | Variants                                                                  | Policy                                     |
| --------------------- | ------------------------------------------------------------------------- | ------------------------------------------ |
| Primary content roles | `body`, `body-compact`, `supporting`, `caption`, `micro`, `label`, `lead` | Preferred for new copy                     |
| Contextual roles      | `option`                                                                  | Choice-row contexts                        |
| Existing treatments   | `muted`, `emphasis`                                                       | Legacy — do not expand without an audit    |
| Semantic state        | `info`, `success`, `warning`, `destructive`                               | Status color only; size and weight inherit |

Do not hand-roll stacks that duplicate a role (`text-sm text-muted-foreground` →
`supporting` or `text-style-supporting`). Do not invent combination names
(`supporting-error`, `caption-success`).

`Text variant="label"` is a visual descriptor on a `p`. Form labels, legends, hints,
and errors use `text-style-field-*` and field components — not `Text` `label`.

### Role versus tone

`SemanticText` is a separate contract: emphasis weight, the icon slot, and the
`--semantic-*` readability palette. It is not the color mechanism for a tone `Text`.
A **typography owner** must establish font size, line height, and `--icon-inline`
for inline glyphs — usually `Text` (`caption`, `supporting`, `micro`, …) or a parent
with a size-setting `text-style-*`. Compose `Text variant="micro"` + `SemanticText`
for fine (10px) toned status copy (PreviewRail).

`Text` state variants (`info`, `success`, `warning`, `destructive`) set status color
and inherit size and weight. Pass `text-sm` or `text-xs` when that tone needs a
specific size. There is no `tone` prop on `Text`.

### Usage

```tsx
import { Link, RichTextContent, Text } from '@rpg/ui'

<Text variant="supporting">Secondary detail under a section title.</Text>
<Text variant="body-compact">+5 to hit, reach 5 ft., one target.</Text>
<RichTextContent html={species.description} size="sm" />
<Text variant="destructive" role="alert">
  Could not load species.
</Text>
<Link href="/classes">← Classes</Link>
```

Paragraph copy uses `<Text variant="…">`. Non-paragraph elements (`span`, `dt`, `dd`)
and CVA branches use the matching `text-style-*` utility. `className` on `Text` is
for layout (`truncate`, `mt-2`) and allowed color corrections on `label`
(`text-foreground`, `text-destructive`) — never `text-style-*` utilities on `Text`
(`packages/ui/src/lib/typography/text-style-stack-ratchet.repo.test.ts` enforces this). Raw
`<p>` tags must not carry `text-style-*`, `font-body-emphasis`, or `heading-style-*` in
`className` — use `<Text>` or `<Heading>` instead (same ratchet).

Form hints and errors inside `Field.*`, `Form`, and field wrappers already compose
field typography — do not re-add `text-sm text-muted-foreground` on those surfaces.

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
| `Text` `emphasis`, `option`                         | `text-md`                         |
| Generic `Card` `ui-card__description` (comfortable) | 14px (`text-sm` via shell var)    |
| Rich-text editor (`size="md"`)                      | `prose-md` (matches catalog read) |
| Rich-text editor (`size="sm"`)                      | `prose-sm`                        |
| Form fields (`size="md"`)                           | `text-md` labels + controls       |
| Form fields (`size="lg"`)                           | `text-base` labels + controls     |

Compact UI chrome (buttons, menus, data tables) stays on **`text-sm` (14px)**.

## Type scale

Primitive sizes live in [`styles/globals.css`](../src/styles/globals.css) `@theme inline`.
They override Tailwind’s built-in `text-*` utilities — components keep using `text-sm`,
`text-2xl`, etc.; the CSS variables are the single source of truth (@ 16px root):

| Token / utility | px @ 16px root | Typical use                                      |
| --------------- | -------------- | ------------------------------------------------ |
| `text-fine-xs`  | 10             | Eyebrow `xs`, compact control-action labels      |
| `text-fine-sm`  | 11             | Eyebrow `sm`, Chip `sm` (`--text-chip-sm`)       |
| `text-fine-md`  | 13             | Eyebrow `md`, Chip `md`, table body              |
| `text-xs`       | 12             | Captions, table stat columns                     |
| `text-sm`       | 14             | Compact UI chrome (buttons, menus, data tables)  |
| `text-md`       | 15             | Secondary body (`prose-md`, emphasis, option)    |
| `text-base`     | 16             | Primary body default                             |
| `text-lg`       | 18             | Lead copy; subsection and card headings          |
| `text-xl`       | 20             | Dialog title from `md`; sheet section headings   |
| `text-2xl`      | 24             | Form group legends (`--text-field-group-legend`) |
| `text-3xl`      | 28             | Section headings (curated; not the 30px default) |
| `text-4xl`      | 34             | Page headings (curated; not the 36px default)    |

Fine (10–13px) and standard (`text-xs` through `text-4xl`) are one scale. Nothing above `text-4xl` is declared. Most fine sizes have no line-height companion; `--text-fine-xs--line-height` (14px) backs `Text` `micro` and Chip `xs`.

## Form legend tokens

Legend sizes live on `:root` and are read by `text-style-field-legend` composites. They do not emit `text-field-*` utilities.

| Token                          | px @ 16px root | Typical use                                                 |
| ------------------------------ | -------------- | ----------------------------------------------------------- |
| `--text-field-group-legend`    | 24             | Top-level form group legends, collapsible section triggers  |
| `--text-field-subgroup-legend` | 20             | Nested `kind: 'group'` legends (`legendSize: 'subsection'`) |
| `--text-field-array-legend`    | 18             | Repeatable `kind: 'array'` section legends (default)        |

## Heading size tokens

Role tokens live on `:root` in [`styles/globals.css`](../src/styles/globals.css). They share a primitive pair (size and line-height). Display (42px) and ability-score `md` (32px) are the only off-scale literals. Retune a role by pointing it at another primitive, not by adding a numbered heading token.

| Role token                  | Points at                                          | `Heading` variant / utility              | px    |
| --------------------------- | -------------------------------------------------- | ---------------------------------------- | ----- |
| `--text-heading-display`    | literal                                            | `display`                                | 42    |
| `--text-heading-page`       | `text-4xl`                                         | `page`                                   | 34    |
| —                           | `text-lg` → `text-xl` at `md` → `text-4xl` at `lg` | `heroTitle` (`heading-style-hero-title`) | 18→34 |
| `--text-heading-section`    | `text-3xl`                                         | `section`                                | 28    |
| `--text-heading-subsection` | `text-lg`                                          | `subsection`                             | 18    |
| `--text-heading-card`       | `text-lg`                                          | `card` (line-height is `--leading-none`) | 18    |
| `--text-heading-group`      | `text-base`                                        | `group`                                  | 16    |
| `--text-heading-label`      | `text-base`                                        | `label`                                  | 16    |
| `--text-base`               | primitive                                          | `nav`, `brand`, `alert`                  | 16    |

`variant` controls appearance; `as` controls document semantics. Match the hierarchy
table above in app code.

## Media preview size

`size-image-preview` maps to `--spacing-image-preview` → `--image-preview-size` in
[`styles/globals.css`](../src/styles/globals.css):

| Viewport        | Size  |
| --------------- | ----- |
| below `sm`      | 120px |
| `sm`–below `lg` | 90px  |
| `lg`+           | 120px |

Shared by `Hero` mark frames and `MediaFieldSummary` compact previews.

## Composite typography utilities

Each `Heading` / `Eyebrow` variant maps to one `@utility` composite (e.g.
`heading-style-page`) that bundles size, line-height, weight, tracking, and (for
eyebrow) case. Color is set via `Eyebrow` `tone` (`text-muted-foreground`,
`text-foreground`, `text-primary`). Heading composites read `:root` role tokens.
Weight utilities still come from `@theme`.

Visual reference: Storybook **`Typography/Composites`** (variants) and **`Typography/Scale`**
(primitives and which token each role points at).

Components use composites via `headingVariants()`. Heading roles are not `text-heading-*` utilities.

## Font weight tokens

Primitive weights and role aliases live in [`styles/globals.css`](../src/styles/globals.css).

| Role utility / token            | Value                | Typical use                                                       |
| ------------------------------- | -------------------- | ----------------------------------------------------------------- |
| `--font-weight-heading-display` | 700                  | `Heading` display                                                 |
| `--font-weight-heading`         | 600                  | page, section, subsection, card, nav, brand, alert, sheet section |
| `--font-weight-heading-group`   | 500                  | `Heading` group                                                   |
| `--font-weight-heading-label`   | 500                  | `Heading` label                                                   |
| `font-field-label`              | 600                  | Form field labels (`fieldLabelVariants`)                          |
| `font-body-emphasis`            | 500                  | Button, badge, `Text` emphasis                                    |
| `font-body`                     | 400                  | `Text` body default                                               |
| `font-meta`                     | 300                  | Data-table meta cells                                             |
| `--font-weight-eyebrow`         | 500 light / 300 dark | `eyebrow-style-*` composites                                      |
| `font-data-name`                | 600                  | Data-table name cells                                             |
| `font-data-stat`                | 500                  | Data-table stat columns                                           |

## Fine sizes

Fine sizes are the small end of the same primitive scale, not a metadata tier. A role can share a fine size and keep its own line height, weight, and spacing.

| Token / utility       | px @ 16px root | Shared by                                                                                                        |
| --------------------- | -------------- | ---------------------------------------------------------------------------------------------------------------- |
| `text-fine-xs`        | 10             | `Text` `micro`, `text-eyebrow-xs`, `text-control-action-xs` (14px line-height via `--text-fine-xs--line-height`) |
| `text-fine-sm`        | 11             | `text-eyebrow-sm`, `--text-chip-sm`, floating-label `sm` floor                                                   |
| `text-fine-md`        | 13             | `text-eyebrow-md`, `--text-chip-md`, `text-table-body`                                                           |
| `text-md`             | 15             | Chip `lg` (`--text-chip-lg`)                                                                                     |
| `tracking-eyebrow-xs` | 1.2px          | Letter-spacing for `Eyebrow` `size="xs"`                                                                         |
| `tracking-eyebrow`    | 1.6px          | Letter-spacing for `Eyebrow` `size="sm"` / `size="md"`                                                           |

The standard group above runs `text-xs` (12px) through `text-4xl` (34px).

Badge and Chip (`appearance`, `tone`, selected-control vs semantic soft) →
[pill-badge-chip.md](./pill-badge-chip.md).

Prefer `eyebrow-style-*` composites or `<Eyebrow>` for uppercase section labels. Use `text-fine-*` when the call site is choosing a size directly and no semantic role already owns it.

Detail-page subgroup labels (for example Districts under City structure, or Governed by
under Territorial Authority) use `<Eyebrow size="sm">` with the default muted tone.
Pass **title-case** copy at the call site — the composite applies uppercase. Dashboard
layout for grouped collection subgroups is `DetailCollectionGroup`; relationship
sections use `EntityRowList.Group` with the same eyebrow/header chrome via shared
collection-body tokens (see
[cross-content-relationship-ui.md](../../../apps/dashboard/docs/cross-content-relationship-ui.md#collection-oriented-detail-surfaces)).

## Internal primitives

Library-owned copy (modal descriptions, field hints, dropzone helpers, data-table
empty states) must pull from `textVariants`, `headingVariants`, or co-located
`*.variants.ts` files — not inline `text-*` strings in JSX.

When a Radix primitive requires a specific element (`Dialog.Title`,
`AlertDialog.Description`), apply variant classes directly:

```tsx
<DialogPrimitive.Title className={headingVariants({ variant: 'dialogTitle' })}>
  {headline}
</DialogPrimitive.Title>
```

Dialog chrome defaults: standard `Modal.Header` and `Sheet.Header` titles inherit
the shared `dialogTitle` style from `DialogPanelHeader` — **18px on mobile**,
**20px from the `md` breakpoint (48rem)**. Compact `ConfirmDialog` titles use
`confirmDialogTitle` (18px at all sizes) on a separate AlertDialog path.
Both Modal and Sheet accept `headlineClassName` as the escape hatch for genuine
deviations; do not pass a heading class merely to get normal overlay typography.

## Dashboard content routes

Content catalog detail routes under `apps/dashboard/src/features/content/**/routes/*-detail.tsx`
must use `@rpg/ui` typography exports. See
[`apps/dashboard/docs/feature-conventions.md`](../../../apps/dashboard/docs/feature-conventions.md).

## Adding copy in apps

1. Reach for `Heading` / `Text` / `RichTextContent` first; use existing
   `text-style-*` composites before inventing new stacks.
2. If a new **typography axis** is needed (a stable role the design system should
   own), add a named variant or `@utility` in `@rpg/ui` — not one-off `text-*`
   classes in app code. Do not add `*.variants.ts` entries that only rename static
   utilities; see [AGENTS.md](../../../AGENTS.md#styling-conventions).
3. Run Storybook (light + dark) when touching prose or rich-text spacing.
