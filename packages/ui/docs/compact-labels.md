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

## Tone vs appearance

**Tone** communicates meaning (`neutral`, `info`, `success`, `warning`, `destructive`).
**Appearance** controls presentation strength (`outline`, `accent-outline`, `soft`, `neutral`).

They are independent — do not shift hue to signal importance or selection.

- **Selected chips** use **selected-control** tokens (`bg-selected-control`, …), not `tone="success"`.
- **Semantic soft badges** (`appearance="soft"`) are not the same surface as a selected chip.

Shared tone names align with [`SemanticText`](./semantic-text.md) but render bordered pill
surfaces instead of inline copy.

## Size scale

| Size | Font                  | Typical use                          |
| ---- | --------------------- | ------------------------------------ |
| `sm` | 11px (`text-xs-meta`) | Table cells, compact metadata        |
| `md` | 13px (`text-sm-meta`) | Default field chips, removable chips |
| `lg` | 15px (`text-md`)      | Prominent removable chips            |

`sm` is not valid for `Chip mode="removable"`.

## Badge appearances

| Appearance       | Background      | Weight |
| ---------------- | --------------- | ------ |
| `outline`        | transparent     | light  |
| `accent-outline` | transparent     | light  |
| `soft`           | semantic subtle | medium |
| `neutral`        | neutral subtle  | medium |

## Chip states

| Mode / state              | Surface                                                   |
| ------------------------- | --------------------------------------------------------- |
| `selectable` / unselected | `background`, `border-border`, weight 300                 |
| `selectable` / selected   | `selected-control` fill, auto leading `Check`, weight 500 |
| `removable`               | neutral filled surface, trailing remove control           |

## Tokens

Role tokens live in [`globals.css`](../src/styles/globals.css):

- `--semantic-*-border`, `--semantic-*-subtle` — badge soft/outline surfaces
- `--semantic-destructive-on-subtle` — soft destructive badge copy on `destructive-subtle` fill
- `--selected-control`, `--selected-control-foreground`, `--selected-control-border` — chip selection

Status chrome (`--info-subtle`, …) vs inline text (`--semantic-info`, …): [design-tokens.md](./design-tokens.md#status-namespaces).

Typography aliases: `text-xs-meta`, `text-sm-meta` (see [typography.md](./typography.md)).

## Further reading

- [Semantic text](./semantic-text.md) — inline copy with the same tone enum
- [Design tokens](./design-tokens.md) — layers, surfaces, alpha policy
- [Forms](./forms.md) — `ChipsField`, combobox selected-value rendering
