# Compact labels

`Badge` and `Chip` share an internal compact-label recipe (`compact-label.variants.ts`).
Consumers use the public component APIs — not the internal CVA.

## Vocabulary

| Primitive                  | Interaction                               | Use when                                                          |
| -------------------------- | ----------------------------------------- | ----------------------------------------------------------------- |
| `Badge`                    | None (presentational `<span>` by default) | Source labels, status, classification, link styling via `asChild` |
| `Chip` `mode="selectable"` | Toggle `button` with `aria-checked`       | `ChipsField`, filter toggles                                      |
| `Chip` `mode="removable"`  | `span` + remove `button`                  | Combobox selected values, tag removal                             |

`ChipGroup` is layout-only (`flex flex-wrap gap-2`). Semantic grouping belongs on a parent
`<fieldset>`/`<legend>` or an opt-in `semanticRole` on `ChipGroup`.

**Badge is not interactive.** It communicates classification or status. Dismissible,
selectable, clickable, or togglable labels use **Chip** or **Button** instead. The
`asChild` pattern remains for link-styled badges only.

## Tone vs appearance

**Tone** communicates meaning (`neutral`, `info`, `success`, `warning`, `destructive`).
**Appearance** controls presentation strength (`strong`, `soft`, `outline`).

They are independent — do not shift hue to signal importance or selection. Every tone ×
appearance combination is valid.

- **Selected chips** use **selected-control** tokens (`bg-selected-control`, …), not `tone="success"`.
- **Semantic soft badges** (`appearance="soft"`) are not the same surface as a selected chip.

Shared tone names align with [`SemanticText`](./semantic-text.md) but render bordered pill
surfaces instead of inline copy.

Theme tokens own light/dark differences for each role (`--semantic-info-outline-foreground`,
`--semantic-info-soft-bg`, `--semantic-info-strong-bg`, …). Badge maps tone × appearance to
one stable utility class per role — no `dark:` policy in component recipes.

## Badge anatomy

```text
Badge (<span> by default)
├── leadingIcon?   — canonical icon slot (size from badge size)
└── label          — children text
```

Badge owns: fixed height per size, horizontal padding, typography, border width, radius,
icon size, icon/text gap, vertical centering.

Consumers own: label, tone, appearance, optional semantic icon choice. Do not add layout or
chrome overrides (`gap-*`, `size-*`, `rounded-*`, `py-*`) to make a Badge fit.

## Size scale

| Size | Height | Font                  | Typical use                          |
| ---- | ------ | --------------------- | ------------------------------------ |
| `sm` | 22px   | 11px (`text-xs-meta`) | Table cells, compact metadata        |
| `md` | 31px   | 13px (`text-sm-meta`) | Default field chips, removable chips |
| `lg` | 41px   | 15px (`text-md`)      | Prominent removable chips            |

`sm` is not valid for `Chip mode="removable"`.

## Badge appearances

| Appearance | Background role          | Weight |
| ---------- | ------------------------ | ------ |
| `strong`   | `--semantic-*-strong-bg` | medium |
| `soft`     | `--semantic-*-soft-bg`   | medium |
| `outline`  | transparent              | medium |

## Chip states

| Mode / state              | Surface                                                   |
| ------------------------- | --------------------------------------------------------- |
| `selectable` / unselected | `background`, `border-border`, weight 300                 |
| `selectable` / selected   | `selected-control` fill, auto leading `Check`, weight 500 |
| `removable`               | neutral filled surface, trailing remove control           |

## Tokens

Role tokens live in [`globals.css`](../src/styles/globals.css):

- `--semantic-*-border`, `--semantic-*-soft-bg`, `--semantic-*-strong-bg` — badge surfaces
- `--semantic-*-outline-foreground`, `--semantic-*-soft-foreground`, `--semantic-*-strong-foreground` — badge copy
- `--selected-control`, `--selected-control-foreground`, `--selected-control-border` — chip selection

Status chrome (`--info-subtle`, …) vs inline text (`--semantic-info`, …): [design-tokens.md](./design-tokens.md#status-namespaces).

Typography aliases: `text-xs-meta`, `text-sm-meta` (see [typography.md](./typography.md)).

## Further reading

- [Semantic text](./semantic-text.md) — inline copy with the same tone enum
- [Design tokens](./design-tokens.md) — layers, surfaces, alpha policy
- [Forms](./forms.md) — `ChipsField`, combobox selected-value rendering
