# Destination list

Grouped navigation items — shared link-root behavior with navigable `Card` and static `EntityCard`, distinct list chrome.

Source: `packages/ui/src/components/ui/destination-list.tsx`, `destination-list.css`, `navigable-link-root.lib.ts`.

Entity-rich pickers (combobox, menus) stay on `InteractiveList` + `InteractiveListRow`. For choosing among `Card`, entity surfaces, and list rows, see the dashboard [card-guide](../../../apps/dashboard/docs/card-guide.md).

## When to use

| Presentation                    | Component                                                                     |
| ------------------------------- | ----------------------------------------------------------------------------- |
| Standalone tile (grid/hub cell) | Navigable `Card` (`link` prop)                                                |
| Standalone entity surface       | Static `EntityCard` with `link` (dashboard)                                   |
| Hub panel with inset dividers   | `DestinationList appearance="panel"` + simple `DestinationItem`               |
| Filled grouped lists (campaign) | `DestinationList appearance="filled" tone="strong" elevation="subtle"` + item |
| Popover/search grouped results  | `DestinationList appearance="embedded"` + rich `DestinationItem`              |
| Combobox / menu rows            | `InteractiveList` + `InteractiveListRow`                                      |

## API

### `DestinationList`

- `appearance?: 'panel' | 'embedded' | 'filled'` (default `panel`)
- `tone?: 'strong'` — strong rest plane when `appearance="filled"` (defaults to `strong` when omitted); ignored for panel and embedded; does not apply shadow
- `elevation?: 'flat' | 'subtle' | 'raised'` — depth when `appearance="filled"` (default `flat`; campaign shells use `subtle`). Same tokens as `Card` elevation.
- `density?: 'compact' | 'comfortable' | 'spacious'` (default `comfortable`) — item padding and the shared copy-scale contract (`copy-scale.css`: title, classification, supporting sizes, `--ui-anatomy-row-gap`, `--ui-anatomy-leading-size`, leading/trailing gaps)

Rich `content` inherits those CSS variables from the list. Do not pass a second density on embedded `EntityAnatomyHost` when the list already publishes the step you need (campaign collections use spacious from `CampaignDestinationSection`). Explicit `density` on nested anatomy or `IdentityRow` overrides the ancestor — use only when intentional.

Compact-only presentation (status badge `sm`, caption classes, `InlineMetadata` density props) still resolves in React when anatomy receives an explicit `density` prop; omitting the prop is not the same as inheriting compact. See [row-anatomy.md](./row-anatomy.md).

### `DestinationItem` (discriminated union)

**Shared:** `link` (required), `showNavigationChevron?` (default true)

**Simple:** `title`, optional `description`, optional `metadata`

**Rich:** `content` (required), optional `startSlot`, optional `trailingInfo` (passive informational nodes only — no buttons or nested links)

Link-specific attributes (`to`, `href`, `aria-label`, `onClick`, refs) belong on the **`link`** element.

## Navigation

`renderNavigableLinkRoot` clones the app-supplied link and merges surface classes. The same helper powers `ButtonLink` ([button-link.md](./button-link.md)). Destination items use embedded focus rings (`ui-focus-ring--embedded`). Navigable cards and static `EntityCard` use standalone focus (`ui-focus-ring`).

Item link ownership:

| Layer                                                 | Responsibility                                                                     |
| ----------------------------------------------------- | ---------------------------------------------------------------------------------- |
| `.ui-destination-item__link` (`destination-list.css`) | Stable link geometry, base text color, no underline                                |
| `interactiveRowVariants`                              | Hover family, hit target (`ui-interactive-row--hit-pointer`), selection/state axes |
| `interactiveFocusVariants`                            | Embedded focus-visible policy                                                      |
| `DestinationList`                                     | Panel/embedded/filled chrome, optional filled tone, density vars, dividers         |

## Shared surface interaction

Opaque hover and pressed colors for interactive **strong** surfaces share one CSS owner:
`surface-interaction.css`. Publishers set immutable `--ui-surface-bg` on the shell; the file
derives `--ui-surface-hover-bg` and `--ui-surface-pressed-bg` with the same 94% / 88%
`color-mix` recipe used by interactive `Card` (opaque tones including `quiet`, `subtle`, and `strong`).

| Publisher                                                          | Rest                                                   |
| ------------------------------------------------------------------ | ------------------------------------------------------ |
| Interactive `Card` (`transparent` / `quiet` / `subtle` / `strong`) | `--ui-surface-bg` on `.ui-card`                        |
| `DestinationList` `appearance="filled"` + strong tone              | `--ui-surface-bg: var(--surface-strong)` on the `<ul>` |

Filled strong lists publish `--ui-surface-bg` on the `<ul>`; navigation row links compose
`interactiveRowVariants` (`--hover` → shared surface hover/pressed). Panel and embedded lists inherit
the canvas or ancestor publisher — row links stay transparent at rest. Cross-links:
[semantic-control-css.md](./semantic-control-css.md), [design-tokens.md](./design-tokens.md).

## Relationship indicator in search rows

Dashboard `CharacterRelationshipIndicator` supports `presentation="inlinePassive"` inside rich items: icon is decorative (`aria-hidden`); screen readers get relationship copy from the link `aria-label`; pointer hover still opens the tooltip without an extra tab stop.

## Appearance vs density

|          | `panel`                        | `embedded`                          | `filled` (+ optional `tone="strong"`)                                                |
| -------- | ------------------------------ | ----------------------------------- | ------------------------------------------------------------------------------------ |
| Chrome   | Border, radius, transparent bg | No outer panel border               | Border, card radius; strong → `--surface-strong` fill; optional elevation for shadow |
| Dividers | Inset `::after` on items       | Full-bleed top border between items | Full-bleed `::after` between items                                                   |

Density controls item inset and publishes the copy-scale variables on `.ui-destination-list--*`. Simple items alias those vars for title/description classes; rich identity (`IdentityRow`, `EntityAnatomyHost`) consumes the same inherited vars. Search lists use compact (14/12). Dashboard campaign destination sections publish spacious (19/14); invitation destination lists on the campaigns index use comfortable (16/14) explicitly.
