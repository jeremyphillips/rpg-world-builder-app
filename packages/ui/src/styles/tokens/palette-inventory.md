# Theme palette inventory (Layer 1)

Canonical list of `--palette-*` theme roles. **Both** `:root` (light) and `.dark`
must define every name in this inventory. If a dark block omits a token, the light
value inherits on `html.dark` and leaks across themes.

Source files:

- Light: [`palette-light.css`](./palette-light.css)
- Dark: [`palette-dark.css`](./palette-dark.css)

Machine-readable manifest: [`palette-inventory.ts`](./palette-inventory.ts) (parity
tests + Storybook).

## Alpha policy

Public semantic surface tokens should resolve to **final usable colors**. Do not
construct layout/selection/chrome hierarchy with Tailwind `/NN` on semantic utilities
(`bg-muted/30`, `border-border/60`, …). Use the surface/border ladder or named
interaction recipes. Status subtle fills (`--*-subtle`) are authored at ~12–14% and
treated as final colors — never stack additional `/NN` on them.

Exact allowlist for intentional solid-control / backdrop opacity:
[`alpha-utility-allowlist.ts`](./alpha-utility-allowlist.ts).

## Warmth anchor

| Token                   | Role                                          |
| ----------------------- | --------------------------------------------- |
| `--palette-neutral-hue` | Hue anchor for `color-mix` (sidebar, overlay) |

## Elevation surfaces

| Token                         | Layer 2 mapping              | Job                                            |
| ----------------------------- | ---------------------------- | ---------------------------------------------- |
| `--palette-surface-base`      | `--background`               | Canvas / page                                  |
| `--palette-surface-subtle`    | `--surface-subtle`           | Barely visible grouping                        |
| `--palette-surface-muted`     | `--surface-muted`, `--muted` | Standard secondary panel / chrome              |
| `--palette-surface-strong`    | `--surface-strong`           | Dense neutral chrome                           |
| `--palette-surface-raised`    | `--card`, `--popover`        | Raised panels                                  |
| `--palette-surface-sunken`    | `--sunken`                   | Recessed / inset fills                         |
| `--palette-surface-secondary` | `--secondary`                | Alternate low-emphasis **interactive** surface |
| `--palette-surface-accent`    | `--accent`                   | Hover / gold chrome (light)                    |

`--secondary` is for shadcn-compatible Button `secondary` and similar interactive
controls — not a generic page/section fill.

## Field control (Layer 1)

Mode-specific concrete values only. Focus and invalid states alias Layer 2 roles
(`--primary`, `--ring`, `--destructive`, `--destructive-subtle`) — not palette steps.

| Token                             | Layer 2 mapping                   |
| --------------------------------- | --------------------------------- |
| `--palette-field-bg`              | `--field-control-bg`              |
| `--palette-field-border`          | `--field-control-border`          |
| `--palette-field-border-hover`    | `--field-control-border-hover`    |
| `--palette-field-placeholder`     | `--field-control-placeholder`     |
| `--palette-field-bg-readonly`     | `--field-control-bg-readonly`     |
| `--palette-field-border-readonly` | `--field-control-border-readonly` |
| `--palette-field-bg-disabled`     | `--field-control-bg-disabled`     |
| `--palette-field-fg-disabled`     | `--field-control-fg-disabled`     |
| `--palette-field-border-disabled` | `--field-control-border-disabled` |

## Switch (Layer 1)

| Token                             | Layer 2 mapping           |
| --------------------------------- | ------------------------- |
| `--palette-switch-track`          | `--switch-track`          |
| `--palette-switch-track-hover`    | `--switch-track-hover`    |
| `--palette-switch-track-disabled` | `--switch-track-disabled` |

## Sidebar

| Token                       | Layer 2        |
| --------------------------- | -------------- |
| `--palette-sidebar-surface` | `--sidebar`    |
| `--palette-sidebar-shade`   | Mix ingredient |

## Foreground roles

| Token                    | Layer 2 mapping (examples)                                  |
| ------------------------ | ----------------------------------------------------------- |
| `--palette-fg-default`   | `--foreground`                                              |
| `--palette-fg-muted`     | `--muted-foreground`                                        |
| `--palette-fg-secondary` | `--secondary-foreground`, `--accent-foreground`             |
| `--palette-fg-on-solid`  | `--primary-foreground`, destructive/info/success fg (light) |
| `--palette-fg-on-status` | Status badge fg (dark); `--warning-foreground` (light)      |

## Chrome, brand, status

Chrome borders: `--palette-border-default` → `--border`; `--palette-border-subtle` →
`--border-subtle`; `--palette-border-strong` → `--border-strong`;
`--palette-border-selected` → `--card-selected-border`. Overlay: `--palette-overlay`.

Interaction recipes (Layer 1 SSOT, Layer 2 public roles): `--palette-control-hover-bg`,
`--palette-control-selected-bg`, `--palette-row-hover-bg`, `--palette-row-selected-bg`,
`--palette-row-selected-border`, `--palette-drop-target-bg`, `--palette-drop-target-border`,
`--palette-segmented-track-bg`.

Brand: `--palette-primary`, `--palette-primary-foreground`, `--palette-on-solid`.

Status chrome: `--palette-destructive*`, `--palette-info*`, `--palette-success*`,
`--palette-warning*` (base + muted + subtle tiers). Destructive subtle is ~12–14%,
comparable to info/success/warning.

## Semantic text (palette)

`--palette-semantic-*` holds oklch source values. Layer 2 exposes `--semantic-*`
for inline/status text — never reference palette steps from UI code.

| Palette source                   | Layer 2 inline text      | Status chrome alias |
| -------------------------------- | ------------------------ | ------------------- |
| `--palette-semantic-info`        | `--semantic-info`        | `--info-*`          |
| `--palette-semantic-success`     | `--semantic-success`     | `--success-*`       |
| `--palette-semantic-warning`     | `--semantic-warning`     | `--warning-*`       |
| `--palette-semantic-destructive` | `--semantic-destructive` | `--destructive-*`   |

## Layer 2 composition rule

Layer 2 roles may reference `--palette-*` theme roles or another established Layer 2
semantic role. They must not contain raw color literals or reference component
recipes (`--catalog-picker-row-surface`, `--surface-raised-shadow`).

## Layer 2 (semantic)

See [`semantic-light.css`](./semantic-light.css) and [`semantic-dark.css`](./semantic-dark.css).
Structure is identical across themes; only `var(--palette-…)` targets differ.

Field control API: `--field-control-*` matrix + public utilities `border-input` /
`bg-input` (and state variants) in `globals.css`. Switch: `--switch-track*`.
