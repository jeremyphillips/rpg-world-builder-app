# Design tokens

Color system for `@rpg/ui`. SSOT for Layer 1 inventory and parity rules:
[`src/styles/tokens/palette-inventory.md`](../src/styles/tokens/palette-inventory.md).

Storybook catalog: **Design tokens → Color palette** (`color-palette.stories.tsx`).

## Three layers

```text
Layer 1  palette-light.css / palette-dark.css   --palette-*   (oklch SSOT)
Layer 2  semantic-light.css / semantic-dark.css --background, --field-control-*, …
Layer 3  globals.css @theme + custom utilities  bg-*, text-*, border-input, …
         component *.variants.ts               CVA recipes
```

**Components consume Layer 2 / Tailwind utilities only** — never `--palette-*` in UI code.

Layer 2 color roles map to `var(--palette-…)` or `var(--<other-layer-2-role>)` only. No raw
color literals and no references to component recipes (`--catalog-picker-row-surface`,
`--surface-raised-shadow`) inside semantic role definitions.

## Surface hierarchy

| Role        | Utility                    | Meaning                                                                                 |
| ----------- | -------------------------- | --------------------------------------------------------------------------------------- |
| Base        | `bg-background`            | Page canvas                                                                             |
| Raised      | `bg-card`, `bg-popover`    | Elevated panels / overlays                                                              |
| Subtle wash | `bg-muted`                 | Low-emphasis background                                                                 |
| Sunken      | `bg-sunken`                | Recessed / inset fill                                                                   |
| Secondary   | `bg-secondary`             | Alternate **interactive** surface (e.g. Button `secondary`) — not a generic layout fill |
| Field       | `bg-input`, `border-input` | Editable control chrome (via `field-input-chrome.variants.ts`)                          |

Prefer these named surfaces over opacity modifiers (`bg-muted/30`, …) in new code. Existing
centralized tiers in `field-surface.variants.ts` (`subtle` / `medium` / `strong`) still use
`bg-muted/10|30|50` — treat that as shared recipe debt, not a pattern to copy into features.

## Alpha policy

Public semantic surface tokens should resolve to **final usable colors**. Status subtle fills
(`bg-info-subtle`, `bg-destructive-subtle`, …) are authored at ~12–14% and used as-is.

Avoid stacking opacity utilities on tokens that already contain alpha unless the blend is
intentional and documented.

## Status namespaces

Two parallel vocabularies share names (`info`, `success`, `warning`, `destructive`) but different
jobs:

| Namespace     | CSS examples                                         | Use                                                 |
| ------------- | ---------------------------------------------------- | --------------------------------------------------- |
| Status chrome | `--info-*`, `bg-info-subtle`, `border-warning-muted` | Alerts, callouts, solid badges, field status panels |
| Semantic text | `--semantic-info`, `text-semantic-warning`           | Inline copy (`SemanticText`), soft badge text       |

Do not merge text-tuned values onto solid status hues.

## Field control chrome

- Layer 2: `--field-control-*` matrix in `semantic-*.css`.
- Public utilities: `border-input`, `bg-input`, and state variants in `globals.css`.
- **Single recipe owner:** [`field-input-chrome.variants.ts`](../src/components/ui/field-input-chrome.variants.ts) — shell, focus, invalid, disabled, readonly, autofill.
- Individual controls import that recipe; do not reconstruct field chrome with ad-hoc `disabled:bg-muted` or opacity stacks.

Switch unchecked track uses `--switch-track*` — separate from field border ownership.

## Shared tone enum

`neutral | info | success | warning | destructive` across `SemanticText`, `Badge`, `Chip`,
field group accents, and app status call sites. See [compact-labels.md](./compact-labels.md) and
[semantic-text.md](./semantic-text.md).

## Enforcement

Token tests in `packages/ui/src/styles/tokens/`:

- Palette name parity (light ↔ dark)
- Semantic role parity + Layer 2 composition rule
- Field-control role completeness
- Contrast smoke checks on key pairs

`field-input-chrome.variants.test.ts` guards approved utility tokens for field shells.
