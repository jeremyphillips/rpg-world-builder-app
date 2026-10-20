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
- `tone?: 'strong'` — `--surface-strong` fill when `appearance="filled"` (ignored for panel and embedded); does not apply shadow
- `elevation?: 'flat' | 'subtle' | 'raised'` — depth when `appearance="filled"` (default `flat`; campaign shells use `subtle`). Same tokens as `Card` elevation.
- `density?: 'compact' | 'comfortable' | 'spacious'` (default `comfortable`) — item padding and the canonical copy pair (14/12, 16/14, 19/14)

Rich `content` inherits that pair unless it sets its own `density`. Standalone identity falls back to comfortable (16/14).

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

## Relationship indicator in search rows

Dashboard `CharacterRelationshipIndicator` supports `presentation="inlinePassive"` inside rich items: icon is decorative (`aria-hidden`); screen readers get relationship copy from the link `aria-label`; pointer hover still opens the tooltip without an extra tab stop.

## Appearance vs density

|          | `panel`                        | `embedded`                          | `filled` (+ optional `tone="strong"`)                                                |
| -------- | ------------------------------ | ----------------------------------- | ------------------------------------------------------------------------------------ |
| Chrome   | Border, radius, transparent bg | No outer panel border               | Border, card radius; strong → `--surface-strong` fill; optional elevation for shadow |
| Dividers | Inset `::after` on items       | Full-bleed top border between items | Full-bleed `::after` between items                                                   |

Density controls item inset and publishes `--ui-copy-title-size` / `--ui-copy-supporting-size`. Simple items and rich identity read the same pair. Search inherits compact (14/12) from its list. Campaign destinations inherit comfortable (16/14).
