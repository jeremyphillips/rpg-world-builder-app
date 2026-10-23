# Semantic text

`SemanticText` renders **inline** status copy — table cells, picker metadata, import preview
values. It always renders a `<span>`.

For bordered pill surfaces use [`Badge`](./compact-labels.md). For full alert/callout panels use
`Alert` or group `chrome: { variant: 'callout' }`.

## Tone

`neutral | info | success | warning | destructive` — same enum as compact labels.

| Tone          | Typical use                                 |
| ------------- | ------------------------------------------- |
| `neutral`     | Secondary metadata, unset placeholders      |
| `info`        | Informational / neutral-positive context    |
| `success`     | Confirmed, proficient, complete             |
| `warning`     | Caution, missing proficiency, review needed |
| `destructive` | Error, blocking, cannot afford              |

## Emphasis

`low | medium | high` — font weight only. `info` + `low` uses `--semantic-info-muted`.

Default type is the xs metrics on `.ui-semantic-text`, including `--icon-inline`. A `text-sm` class on the element still overrides font size because utilities follow the components layer, and that utility also sets `--icon-inline`. Do not add a second size prop.

```tsx
import { SemanticText } from '@rpg/ui'

<SemanticText tone="info" emphasis="low">Standard gear</SemanticText>
<SemanticText tone="warning" emphasis="medium" icon={<TriangleAlert aria-hidden />}>
  Not proficient
</SemanticText>
<SemanticText tone="success" className="text-sm">Updated</SemanticText>
```

## Tokens

Inline hues: `--semantic-info`, `--semantic-success`, … mapped in Layer 2 from palette sources.
Status **fills** for alerts use `--info-subtle`, etc. — see [design-tokens.md](./design-tokens.md#status-namespaces).

Source: [`semantic-text.css`](../src/components/ui/semantic-text/semantic-text.css) and [`semantic-text.variants.ts`](../src/components/ui/semantic-text/semantic-text.variants.ts). ClassReference covers tone, emphasis, size, and the icon slot.
