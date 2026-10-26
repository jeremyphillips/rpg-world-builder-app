# Pill, Badge, and Chip

`Badge` and `Chip` compose an internal pill (`ui-pill` in `pill.css`). Consumers use the public component APIs.

## Identity

`ui-badge` and `ui-chip` are root identity classes. `ui-pill` owns shared geometry only: inline-flex, alignment, gap, pill radius, a 1px border, medium weight, and the `--ui-pill-bg`, `--ui-pill-fg`, and `--ui-pill-border` variables. Each pill resets those variables so a nested pill does not inherit the outer surface.

Size lives on the component (`ui-badge--sm|md|lg`, `ui-chip--xs|sm|md|lg`). Badge appearance lives on `ui-badge--{outline|soft|strong}-{tone}`. Those modifiers assign the pill variables. They do not repeat the paint longhands. Neutral badges also use `ui-border--default`. Emphasis is `ui-badge--subdued`. Numeric layout is `ui-badge--counter`.

Chip owns `ui-chip--selected`, `ui-chip--interactive`, and `ui-chip__remove`. Removable chips use `ui-chip--removable` for the neutral-soft fill. They do not take a Badge tone class. `ChipGroup` stays layout-only. The dismiss control does not carry `ui-chip`.

`ArrayItemIssueButton` composes `Badge asChild` on a native `button` (`appearance="soft"` `tone="destructive"` `size="sm"`). `compact` sets `layout="counter"`; the full label uses `layout="label"`. Counter alert icons use `Icon size="owner"` so the glyph follows the badge size ladder (`ui-badge--sm` → `--icon-glyph-xs`). `layout="counter"` does not publish its own `--icon-size`; it composes with the size modifier on the same host.

Do not add `ui-badge--compact` or `ui-chip--compact`. Do not add a Chip appearance or tone prop.

## Vocabulary

| Primitive                  | Interaction                               | Use when                                                |
| -------------------------- | ----------------------------------------- | ------------------------------------------------------- |
| `Badge`                    | None (presentational `<span>` by default) | Source labels, status, classification                   |
| `Chip` `mode="selectable"` | Toggle `button` with `aria-checked`       | `ChipsField`, filter toggles                            |
| `Chip` `mode="removable"`  | `span` + remove `button`                  | Combobox selected values, tag removal                   |
| `Button`                   | Action (`ui-button`)                      | Primary actions, destructive submits, array issue jumps |
| `Link` / router `Link`     | Navigation                                | Route changes; may wear badge chrome via composition    |

`ChipGroup` is layout-only (`flex flex-wrap gap-2`). Semantic grouping belongs on a parent
`<fieldset>`/`<legend>` or an opt-in `semanticRole` on `ChipGroup`.

**Badge is not interactive.** It does not carry action semantics. Dismissible or togglable
labels use **Chip**; actions use **Button**. Navigation uses **Link** (or `<a>`), optionally
composed with badge presentation — not `Badge asChild` on a `<button>`.

### Navigation badges (`Badge asChild` + link)

Supported composition: **`Badge asChild`** wraps an **anchor** or app **`Link`**. The link owns
navigation, focus, and keyboard activation; Badge supplies `ui-pill`, `ui-badge`, and its appearance classes. Allowed
utilities on the link: underline / focus affordances — not pill shell geometry (`gap-*`, `h-*`,
`rounded-*` on the label).

Dashboard apps use **`LinkBadge`** (`apps/dashboard/src/lib/link-badge.tsx`) as the single owner
of this stack — features must not duplicate `Badge asChild` + `Link`.

Interactive issue counts (for example `ArrayItemIssueButton`) use **`Badge asChild`** on a native
`button` so they share the badge size ladder and counter layout with presentational counters such as
`ValidationIssueCountBadge`.

`TableBadgeCell` is `Badge size="sm"` for data-table source/status columns.

## Tone vs appearance

**Tone** communicates meaning (`neutral`, `info`, `success`, `warning`, `destructive`).
**Appearance** controls presentation strength (`strong`, `soft`, `outline`).

They are independent — do not shift hue to signal importance or selection. Every tone ×
appearance combination is valid.

**Emphasis** is visual weight, orthogonal to tone and appearance. It is presentation, not
status and not a disabled state.

| Emphasis  | Effect                                                                                           |
| --------- | ------------------------------------------------------------------------------------------------ |
| `default` | Tone foreground                                                                                  |
| `subdued` | Text and icons use `text-muted-foreground`. The well and border stay (for example neutral soft). |

Do not paint subdued labels with `text-foreground-disabled`, field-disabled wells, or
`disabled:opacity-50`. Those tokens mean an unavailable control. `Badge` has no `disabled`
prop. Pass `emphasis="subdued"` for completed or exhausted labels.

- **Selected chips** use **selected-control** tokens (`bg-selected-control`, …), not `tone="success"`.
- **Selectable chip hover** — unselected chips use `--control-hover-bg` on hover/active (styled in
  `chip.css`, not Tailwind `bg-*`, so hover is not overridden). Selected chips keep the
  selected-control surface with **no** hover/active change. Weight stays medium on the pill.
- **Semantic soft badges** (`appearance="soft"`) are not the same surface as a selected chip.

Shared tone names align with [`SemanticText`](./semantic-text.md) but render bordered pill
surfaces instead of inline copy.

Theme tokens own light/dark differences for each role (`--semantic-info-outline-foreground`,
`--semantic-info-soft-bg`, `--semantic-info-strong-bg`, …). Badge maps tone × appearance to
one stable class per role and reads those tokens directly. Do not point the pill variables at
the `@theme` `--color-semantic-*` aliases: those are computed on `:root` and stay on the light
value inside `.dark`.

**Neutral borders** use the same surface-relative `color-mix` as `border-semantic-neutral-border`,
declared in `ui-border.css` and applied by neutral badge and removable chip modifiers (not via `@theme`) so `--surface-current` from card,
popover, and other establishing shells resolves at use time.

## Badge anatomy

```text
Badge (<span> by default)
├── leadingIcon?   — canonical icon slot (size from badge size)
└── label          — children text
```

Badge owns: fixed height per size, horizontal padding, typography, a 1px border, radius,
icon size, icon/text gap, vertical centering.

Consumers own: label, tone, appearance, optional semantic icon choice. Do not add layout or
chrome overrides (`gap-*`, `size-*`, `rounded-*`, `py-*`) to make a Badge fit.

## Size scale

Badge and Chip do not share a size ladder. Chip heights use the field-control tokens. Pass the field `size` through; there is no chip remap.

| Component | Size | Height                          | Font                                      |
| --------- | ---- | ------------------------------- | ----------------------------------------- |
| Badge     | `sm` | 22px                            | 10px (`--text-fine-xs`)                   |
| Badge     | `md` | 26px                            | 12px (`--text-xs`)                        |
| Badge     | `lg` | 32px                            | 14px (`--text-sm`)                        |
| Chip      | `xs` | `--control-height-compact` 24px | 10px (`--text-fine-xs`), 14px line-height |
| Chip      | `sm` | `--control-height-sm` 32px      | 11px (`--text-chip-sm`)                   |
| Chip      | `md` | `--control-height-md` 36px      | 13px (`--text-chip-md`)                   |
| Chip      | `lg` | `--control-height-xl` 44px      | 15px (`--text-chip-lg`)                   |

Field `lg` is `--control-height-xl`, not the 40px button `--control-height-lg`.

## Badge appearances

| Appearance | Background role          | Weight |
| ---------- | ------------------------ | ------ |
| `strong`   | `--semantic-*-strong-bg` | medium |
| `soft`     | `--semantic-*-soft-bg`   | medium |
| `outline`  | transparent              | medium |

## Chip states

| Mode / state              | Surface                                                      |
| ------------------------- | ------------------------------------------------------------ |
| `selectable` / unselected | `background`, `border-border`, medium weight                 |
| `selectable` / selected   | `selected-control` fill, auto leading `Check`, medium weight |
| `removable`               | neutral filled surface, trailing remove control              |

## Tokens

Role tokens live in [`globals.css`](../src/styles/globals.css):

- `--semantic-*-border`, `--semantic-*-soft-bg`, `--semantic-*-strong-bg` — badge surfaces
- `--semantic-*-outline-foreground`, `--semantic-*-soft-foreground`, `--semantic-*-strong-foreground` — badge copy
- `--selected-control`, `--selected-control-foreground`, `--selected-control-border` — chip selection
- `--text-chip-sm|md|lg` — Chip sm/md/lg type (aliases `text-fine-sm` / `text-fine-md` / `text-md`)

Status chrome (`--info-subtle`, …) vs inline text (`--semantic-info`, …): [design-tokens.md](./design-tokens.md#status-namespaces).

Typography detail: [typography.md](./typography.md).

## Further reading

- [Semantic text](./semantic-text.md) — inline copy with the same tone enum
- [Design tokens](./design-tokens.md) — layers, surfaces, alpha policy
- [Forms](./forms.md) — `ChipsField`, combobox selected-value rendering
