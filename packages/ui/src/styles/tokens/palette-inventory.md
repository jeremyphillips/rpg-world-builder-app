# Theme palette inventory (Layer 1)

Canonical list of `--palette-*` theme roles. **Both** `:root` (light) and `.dark`
must define every name in this inventory. If a dark block omits a token, the light
value inherits on `html.dark` and leaks across themes.

Source files:

- Light: [`palette-light.css`](./palette-light.css)
- Dark: [`palette-dark.css`](./palette-dark.css)

Machine-readable manifest: [`palette-inventory.ts`](./palette-inventory.ts) (parity
tests + Storybook).

## Model: anchors → derived scales → semantic aliases

| Kind                 | Examples                                                                     | Rule                                                                               |
| -------------------- | ---------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| **Authored anchors** | `surface-base`, `surface-panel`, `fg-default`, `primary`, `neutral-contrast` | Independent oklch identity — not derived from the wash ladder                      |
| **Mix ingredient**   | `neutral-contrast`                                                           | Gold wash ingredient per mode (chromatic — not achromatic neutral)                 |
| **Derived surfaces** | `surface-field`, `surface-subtle`, `surface-muted`, …                        | `color-mix` from anchors — field lifts canvas toward white (light) or panel (dark) |
| **Semantic aliases** | `field-placeholder` → `fg-muted`, `field-bg` → `surface-field`               | Preserve component intent even when values match                                   |

Interaction recipes (`control-hover`, `row-hover`, …) live at **Layer 2** only — not in this inventory.

## Alpha policy

Public semantic surface tokens should resolve to **final usable colors**. Do not
construct layout/selection/chrome hierarchy with Tailwind `/NN` on semantic utilities
(`bg-muted/30`, `border-border/60`, …). Use the surface/border ladder or named
interaction recipes. Status subtle fills (`--*-subtle`) are authored at ~12–14% and
treated as final colors — never stack additional `/NN` on them.

Exact allowlist for intentional solid-control / backdrop opacity:
[`alpha-utility-allowlist.ts`](./alpha-utility-allowlist.ts).

## Warmth anchor

| Token                        | Role                                                              |
| ---------------------------- | ----------------------------------------------------------------- |
| `--palette-neutral-hue`      | Hue anchor for sidebar and overlay recipes                        |
| `--palette-neutral-contrast` | Mix ingredient for wash ladder; aliases `surface-accent` in light |

## Elevation surfaces

| Token                         | Layer 2 mapping              | Job                                                                         |
| ----------------------------- | ---------------------------- | --------------------------------------------------------------------------- |
| `--palette-surface-base`      | `--background`               | Canvas / page                                                               |
| `--palette-surface-subtle`    | `--surface-subtle`           | Derived wash — barely visible grouping                                      |
| `--palette-surface-muted`     | `--surface-muted`, `--muted` | Derived wash — standard secondary panel                                     |
| `--palette-surface-strong`    | `--surface-strong`           | Derived wash — dense neutral chrome                                         |
| `--palette-surface-panel`     | `--card`, `--popover`        | Authored warm elevated panels / overlays                                    |
| `--palette-surface-field`     | `--palette-field-bg` (alias) | Derived editable plane — canvas lifted toward white (light) or panel (dark) |
| `--palette-surface-sunken`    | `--sunken`                   | Recessed / inset fills (derived or thin-authored)                           |
| `--palette-surface-secondary` | `--secondary`                | Aliases `surface-panel` in light; alternate interactive surface in dark     |
| `--palette-surface-accent`    | `--accent`                   | Aliases `neutral-contrast` in light; hover chrome in dark                   |

`--secondary` is for shadcn-compatible Button `secondary` and similar interactive
controls — not a generic page/section fill.

## Field control (Layer 1)

Global fill via `--palette-field-bg` → `--field-control-bg`. **No** parent-context
`field-bg-on-*` matrix — rare shell overrides set `--field-control-bg` locally in the
component that creates the unusual context.

| Token                             | Layer 2 mapping                   |
| --------------------------------- | --------------------------------- |
| `--palette-field-bg`              | `--field-control-bg`              |
| `--palette-field-bg-readonly`     | `--field-control-bg-readonly`     |
| `--palette-field-bg-disabled`     | `--field-control-bg-disabled`     |
| `--palette-field-border`          | `--field-control-border`          |
| `--palette-field-border-hover`    | `--field-control-border-hover`    |
| `--palette-field-placeholder`     | `--field-control-placeholder`     |
| `--palette-field-fg-disabled`     | `--field-control-fg-disabled`     |
| `--palette-field-border-readonly` | `--field-control-border-readonly` |
| `--palette-field-border-disabled` | `--field-control-border-disabled` |

Focus and invalid states alias Layer 2 roles (`--primary`, `--ring`, `--destructive`,
`--destructive-subtle`) — not palette steps.

## Switch (Layer 1)

| Token                             | Layer 2 mapping           |
| --------------------------------- | ------------------------- |
| `--palette-switch-track`          | `--switch-track`          |
| `--palette-switch-track-hover`    | `--switch-track-hover`    |
| `--palette-switch-track-disabled` | `--switch-track-disabled` |

## Sidebar

| Token                       | Layer 2                                                                               |
| --------------------------- | ------------------------------------------------------------------------------------- |
| `--palette-sidebar-surface` | `--sidebar` (dark); light aliases `--surface-strong`                                  |
| `--palette-sidebar-shade`   | Mix ingredient                                                                        |
| `--sidebar-nav-item-fg`     | Inactive sidebar nav ink — `--foreground-subtle` (light), `--muted-foreground` (dark) |

## Foreground roles

| Token                    | Layer 2 mapping (examples)                                      |
| ------------------------ | --------------------------------------------------------------- |
| `--palette-fg-default`   | `--foreground`, `--secondary-foreground`, `--accent-foreground` |
| `--palette-fg-subtle`    | `--foreground-subtle` (between default and muted)               |
| `--palette-fg-muted`     | `--muted-foreground` (derived toward canvas)                    |
| `--palette-fg-disabled`  | `--field-control-fg-disabled` (stronger derived mix)            |
| `--palette-fg-on-solid`  | `--primary-foreground`, destructive/info/success fg (light)     |
| `--palette-fg-on-status` | Status badge fg (dark); `--warning-foreground` (light)          |

## Chrome, brand, status

Chrome borders: derived `color-mix(fg-default → surface-base)` at `--palette-border-*` →
Layer 2 `--border*`. Overlay: `--palette-overlay` (documented alpha exception).

Brand: `--palette-primary`, `--palette-primary-foreground`, `--palette-on-solid`.

Status chrome: `--palette-destructive*`, `--palette-info*`, `--palette-success*`,
`--palette-warning*` (base + muted + subtle tiers). Unchanged by the neutral foundation reset.

## Semantic text (palette)

`--palette-semantic-*` holds oklch source values. Layer 2 exposes `--semantic-*`
for inline/status text — never reference palette steps from UI code.

## Layer 2 composition rule

Layer 2 roles may reference `--palette-*` theme roles, another established Layer 2
semantic role, or `color-mix` of those roles toward a **concrete surface** (never
`transparent` as the default wash pattern). Layer 2 must not contain independent
authored `oklch`/`hex` constants or reference component-only recipes
(`--catalog-picker-row-surface`, `--surface-raised-shadow`).

## Layer 2 (semantic)

See [`semantic-light.css`](./semantic-light.css) and [`semantic-dark.css`](./semantic-dark.css).
Structure is identical across themes; only `var(--palette-…)` targets differ.

Field control API: `--field-control-*` matrix + public utilities `border-input` /
`bg-input` (and state variants) in `globals.css`. Switch: `--switch-track*`.

Interaction recipes: composed in `semantic-*.css` — e.g.
`color-mix(in oklch, var(--accent) 35%, var(--background))` for control hover.
