# Array item presentation (internals)

Resolver pipeline for `kind: 'array'` item chrome. Author-facing guidance lives in
[array-field-authoring.md](./array-field-authoring.md).

## Pipeline

```text
fields[]  →  normalizeArrayItemContent()  →  resolveArrayItemPresentation()
           →  resolveArrayItemPresentationAnatomy()  →  renderer switch
```

## Normalizer

`normalizeArrayItemContent(fields)` in `array-item-content-normalizer.lib.ts` maps raw
`fields` to semantic groups before layout resolution:

- One inline-eligible group (bare leaf, single leaf row, `inlineSentence`) → `contentLayout: 'inline'`
- Multiple top-level fields → `contentLayout: 'stacked'`

Presentation uses normalized content for compact items; detailed variant always uses stacked body layout.

## Collapsible rule

```text
collapsible: true  →  disclosure === 'collapsible'
```

Variant (`compact` / `detailed`) controls density only. `resolveArrayFieldRendererChrome` passes
`item.collapsible` through without gating on variant.

## Anatomies

| Anatomy          | Trigger                             |
| ---------------- | ----------------------------------- |
| `flatNoHeader`   | No header anatomy, flat disclosure  |
| `flatWithHeader` | Visible item label, non-collapsible |
| `disclosure`     | `collapsible: true`                 |

## Actions

`resolveArrayItemActionsLocation()` — internal only:

- `header` when header anatomy is present
- `itemRow` for `flatNoHeader` (embedded in compact row grid)
