# Palette inventory (Layer 1)

Canonical list of `--palette-*` primitives. **Both** `:root` (light) and `.dark`
must define every name in this inventory. If a dark block omits a token, the light
value inherits on `html.dark` and leaks across themes.

Source files:

- Light: [`palette-light.css`](./palette-light.css)
- Dark: [`palette-dark.css`](./palette-dark.css)

Machine-readable manifest: [`palette-inventory.ts`](./palette-inventory.ts) (parity
tests + Storybook).

## Neutral ramp

| Token                                           | Role                                                                  |
| ----------------------------------------------- | --------------------------------------------------------------------- |
| `--palette-neutral-hue`                         | Adjustable warmth anchor for the neutral scale                        |
| `--palette-neutral-0` … `--palette-neutral-950` | Full lightness ramp (both themes; includes `400`/`450` mid-tan steps) |
| `--palette-neutral-800-muted`                   | Muted fill variant (slightly lower chroma than 800)                   |
| `--palette-muted-foreground`                    | Secondary copy on surfaces                                            |

## Layout surfaces

| Token                         | Semantic role                                           |
| ----------------------------- | ------------------------------------------------------- |
| `--palette-page-surface`      | `--background`                                          |
| `--palette-sidebar-surface`   | `--sidebar`                                             |
| `--palette-sidebar-shade`     | Sidebar mix ingredient (dark); light may mirror sidebar |
| `--palette-card-surface`      | `--card`, `--popover`                                   |
| `--palette-muted-surface`     | `--muted`                                               |
| `--palette-accent-surface`    | `--accent`                                              |
| `--palette-secondary-surface` | `--secondary`                                           |

Elevation (light): `page` → `sidebar` → `muted` → `card` by lightness.

## Chrome

| Token                       | Semantic role            |
| --------------------------- | ------------------------ |
| `--palette-border-default`  | `--border`               |
| `--palette-border-input`    | `--input`                |
| `--palette-border-selected` | `--card-selected-border` |
| `--palette-overlay`         | `--overlay`              |

## Brand & status

Brand: `--palette-primary`, `--palette-primary-foreground`, `--palette-on-solid`.

Status: `--palette-destructive*`, `--palette-info*`, `--palette-success*`,
`--palette-warning*` (base + muted + subtle tiers).

## Semantic text (palette)

`--palette-semantic-*` holds oklch source values. Layer 2 exposes
`--semantic-*` for components — never reference palette steps from UI code.

## Layer 2 (semantic)

See [`semantic-light.css`](./semantic-light.css) and [`semantic-dark.css`](./semantic-dark.css).
Structure is identical across themes; only `var(--palette-…)` targets differ.
