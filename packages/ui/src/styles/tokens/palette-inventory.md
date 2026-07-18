# Palette inventory (Layer 1)

Canonical list of `--palette-*` primitives. **Both** `:root` (light) and `.dark`
must define every name in this inventory. If a dark block omits a token, the light
value inherits on `html.dark` and leaks across themes.

Source files:

- Light: [`palette-light.css`](./palette-light.css)
- Dark: [`palette-dark.css`](./palette-dark.css)

Machine-readable manifest: [`palette-inventory.ts`](./palette-inventory.ts) (parity
tests + Storybook).

## Warmth anchor

| Token                   | Role                                          |
| ----------------------- | --------------------------------------------- |
| `--palette-neutral-hue` | Hue anchor for `color-mix` (sidebar, overlay) |

## Elevation surfaces

| Token                         | Layer 2 mapping       | Job                         |
| ----------------------------- | --------------------- | --------------------------- |
| `--palette-surface-base`      | `--background`        | Canvas / page               |
| `--palette-surface-subtle`    | `--bg-subtle`         | Barely-off-canvas wells     |
| `--palette-surface-raised`    | `--card`, `--popover` | Raised panels               |
| `--palette-surface-sunken`    | `--muted`             | Recessed / inset fills      |
| `--palette-surface-secondary` | `--secondary`         | Alternate plane             |
| `--palette-surface-accent`    | `--accent`            | Hover / gold chrome (light) |
| `--palette-surface-input`     | `--input-bg`          | Recessed field control fill |

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

Chrome: `--palette-border-*`, `--palette-overlay`, `--palette-surface-input` (field fill).

Brand: `--palette-primary`, `--palette-primary-foreground`, `--palette-on-solid`.

Status: `--palette-destructive*`, `--palette-info*`, `--palette-success*`,
`--palette-warning*` (base + muted + subtle tiers).

## Semantic text (palette)

`--palette-semantic-*` holds oklch source values. Layer 2 exposes
`--semantic-*` for components — never reference palette steps from UI code.

## Retired numeric ramp

Removed in favor of role names above:

| Old token                          | Light remap                   | Dark remap                            |
| ---------------------------------- | ----------------------------- | ------------------------------------- |
| `neutral-0`                        | `surface-base`, `fg-on-solid` | —                                     |
| `neutral-50`                       | `surface-subtle`              | `fg-default`, `fg-secondary`          |
| `neutral-100`                      | `surface-raised`              | —                                     |
| `neutral-150`                      | `surface-secondary`           | —                                     |
| `neutral-300`                      | `surface-sunken`              | —                                     |
| `neutral-500` / `muted-foreground` | `fg-muted`                    | `fg-muted`                            |
| `neutral-700`                      | `fg-secondary`                | `semantic-neutral`                    |
| `neutral-750`                      | —                             | `surface-accent`                      |
| `neutral-800`                      | `fg-default`                  | `surface-raised`, `surface-secondary` |
| `neutral-800-muted`                | —                             | `surface-sunken`                      |
| `neutral-900`                      | `fg-on-status`                | `surface-subtle`                      |
| `neutral-950`                      | —                             | `surface-base`, `fg-on-status`        |
| `neutral-400`, `neutral-450`       | _(deleted — unused)_          | _(deleted)_                           |

## Layer 2 (semantic)

See [`semantic-light.css`](./semantic-light.css) and [`semantic-dark.css`](./semantic-dark.css).
Structure is identical across themes; only `var(--palette-…)` targets differ.

Field control chrome: `--input-border`, `--input-bg`, `--input-ring`, invalid
aliases (`--input-border-invalid`, `--input-ring-invalid`, `--input-bg-invalid`),
and `--switch-track` for the Switch unchecked track.
