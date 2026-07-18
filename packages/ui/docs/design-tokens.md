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

Layer 2 color roles map to `var(--palette-…)`, `var(--<other-layer-2-role>)`, or
`color-mix` of those roles toward a **concrete surface** (not `transparent`). No raw
color literals and no references to component recipes (`--catalog-picker-row-surface`,
`--surface-raised-shadow`) inside generic semantic role definitions.

## Anchors vs derived scales

Layer 1 neutrals split into **authored anchors** (canvas, panel, field plane, primary ink)
and **formula-derived scales** (wash ladder, muted/disabled text, generic borders, field
strokes). Ratios may differ by theme; role names do not.

Derived roles resolve to **final usable colors** — consumers do not stack `/NN` alpha on them.

See [`palette-inventory.md`](../src/styles/tokens/palette-inventory.md) for the full inventory.

## Ladder vs recipe

| Consumer                      | Consumes          | Examples                                                          |
| ----------------------------- | ----------------- | ----------------------------------------------------------------- |
| Generic containers / grouping | Global **ladder** | `bg-surface-muted`, `border-border-subtle`                        |
| Repeated interaction states   | Named **recipes** | `hover:bg-row-hover`, `bg-control-selected`, `bg-segmented-track` |

Do **not** construct layout, selection, callout, or chrome surfaces by applying arbitrary alpha
to semantic color utilities (`bg-muted/30`, `border-border/60`, …).

Recipes are the public contract; ladder steps are implementation details recipes may alias.

## Surface hierarchy

| Role        | Utility                    | Meaning                                                     |
| ----------- | -------------------------- | ----------------------------------------------------------- |
| Base        | `bg-background`            | Page canvas                                                 |
| Panel       | `bg-card`, `bg-popover`    | Warm elevated panels / overlays                             |
| Subtle wash | `bg-surface-subtle`        | Barely visible grouping                                     |
| Muted wash  | `bg-surface-muted`         | Standard secondary panel / chrome                           |
| Strong wash | `bg-surface-strong`        | Dense neutral chrome (not brand/selected meaning)           |
| Sunken      | `bg-sunken`                | Recessed / inset fill                                       |
| Secondary   | `bg-secondary`             | Alternate **interactive** surface (e.g. Button `secondary`) |
| Field       | `bg-input`, `border-input` | Editable control chrome — near-white in light mode only     |

`bg-muted` aliases `bg-surface-muted` for shadcn compatibility — prefer `bg-surface-*` in new code.

`field-surface.variants.ts` wash variants use the same names: `subtle | muted | strong`.

## Border ladder

| Role    | Utility                | Meaning                               |
| ------- | ---------------------- | ------------------------------------- |
| Subtle  | `border-border-subtle` | Quiet separators, low-emphasis shells |
| Default | `border-border`        | Normal component structure            |
| Strong  | `border-border-strong` | Selected or emphasized structure      |

Status borders stay status-specific (`border-destructive-muted`, …). Recipe borders (e.g.
`border-row-selected-border`) may alias `--border-strong` or a brand/status role.

## Interaction recipes

Shared recipes (Layer 2 → Tailwind). Tinted washes mix toward `--background` (or another
concrete surface), not `transparent`:

| CSS role                | Utility                      | Composition (light/dark)         |
| ----------------------- | ---------------------------- | -------------------------------- |
| `--control-hover-bg`    | `bg-control-hover`           | `color-mix(accent → background)` |
| `--control-selected-bg` | `bg-control-selected`        | `color-mix(accent → background)` |
| `--row-hover-bg`        | `hover:bg-row-hover`         | `--surface-subtle`               |
| `--row-selected-bg`     | `bg-row-selected`            | `--surface-strong`               |
| `--row-selected-border` | `border-row-selected-border` | `--border-strong`                |
| `--drop-target-bg`      | `bg-drop-target`             | `color-mix(accent → background)` |
| `--drop-target-border`  | `border-drop-target-border`  | `--primary`                      |
| `--segmented-track-bg`  | `bg-segmented-track`         | `--surface-strong`               |

Add a new recipe only when the state is reused, owned by a shared primitive, or must stay
independently tunable across light/dark. One-offs stay in local CVA using the ladder or status
roles.

## Alpha policy

Public semantic surface tokens resolve to **final usable colors**. Status subtle fills
(`bg-info-subtle`, `bg-destructive-subtle`, …) are authored at ~12–14% and used as-is.

**Never** stack `/NN` on `*-subtle` or `*-muted` status roles (`bg-destructive-subtle/50`).

Solid-control, backdrop, and selective text opacity are allowed only via the exact allowlist in
[`alpha-utility-allowlist.ts`](../src/styles/tokens/alpha-utility-allowlist.ts), enforced by
`alpha-utility-ban.test.ts`.

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
- **Global fill:** `--field-control-bg` → `--palette-surface-field` everywhere. No
  parent-scoped re-scoping in `globals.css` under `.bg-card` / `.bg-surface-*`.
- **Rare overrides:** set `--field-control-bg` locally in the component that creates an
  unusual shell context.
- **Single recipe owner:** [`field-input-chrome.variants.ts`](../src/components/ui/field-input-chrome.variants.ts).
- Individual controls import that recipe; do not reconstruct field chrome with ad-hoc opacity stacks.

Switch unchecked track uses `--switch-track*` — separate from field border ownership.

## Visual acceptance checklist

Review in Storybook (both modes) without pixel-matching:

- Page → panel → field
- Page → subtle wash → field
- Panel → read-only field
- Panel → disabled field (disabled quieter than readonly and default)
- Muted text on page and on panel
- Placeholder on field
- Default / subtle / strong border on page and on panel
- Control-hover / row-hover on page and on panel (opaque mix holds up)

## Shared tone enum

`neutral | info | success | warning | destructive` across `SemanticText`, `Badge`, `Chip`,
field group accents, and app status call sites. See [compact-labels.md](./compact-labels.md) and
[semantic-text.md](./semantic-text.md).

## Enforcement

Token tests in `packages/ui/src/styles/tokens/`:

- Palette name parity (light ↔ dark)
- Semantic role parity + Layer 2 composition rule
- Neutral foundation absence checks (`neutral-foundation-absence.test.ts`)
- Field-control role completeness
- Contrast smoke checks on key pairs
- Alpha utility ban (`alpha-utility-ban.test.ts`)

`field-input-chrome.variants.test.ts` guards approved utility tokens for field shells.
