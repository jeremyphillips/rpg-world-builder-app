# Destination list

Grouped navigation rows — shared link-root behavior with navigable `Card`, distinct list chrome.

Source: `packages/ui/src/components/ui/destination-list.tsx`, `destination-list.css`, `navigable-link-root.lib.ts`.

Entity-rich pickers (combobox, menus) stay on `InteractiveList` + `InteractiveListRow`.

## When to use

| Presentation                    | Component                                                       |
| ------------------------------- | --------------------------------------------------------------- |
| Standalone tile (grid/hub cell) | Navigable `Card` (`link` prop)                                  |
| Hub panel with inset dividers   | `DestinationList appearance="panel"` + simple `DestinationRow`  |
| Filled grouped lists (campaign) | `DestinationList appearance="filled" tone="strong"` + row       |
| Popover/search grouped results  | `DestinationList appearance="embedded"` + rich `DestinationRow` |
| Combobox / menu rows            | `InteractiveList` + `InteractiveListRow`                        |

## API

### `DestinationList`

- `appearance?: 'panel' | 'embedded' | 'filled'` (default `panel`)
- `tone?: 'strong'` — list rest chrome when `appearance="filled"` (ignored for panel and embedded)
- `density?: 'compact' | 'comfortable' | 'spacious'` (default `comfortable`) — row padding and the canonical copy pair (14/12, 16/14, 19/14)

Rich `content` inherits that pair unless it sets its own `density`. Standalone identity falls back to comfortable (16/14).

### `DestinationRow` (discriminated union)

**Shared:** `link` (required), `showNavigationChevron?` (default true)

**Simple:** `title`, optional `description`, optional `metadata`

**Rich:** `content` (required), optional `startSlot`, optional `trailingInfo` (passive informational nodes only)

Link-specific attributes (`to`, `href`, `aria-label`, `onClick`, refs) belong on the **`link`** element.

## Navigation

`renderNavigableLinkRoot` ([`navigable-link-root.lib.ts`](../src/components/ui/navigable-link-root.lib.ts)) clones the app link and merges row/card surface classes. Rows use embedded focus rings (`ui-focus-ring--embedded`).

Row link ownership:

| Layer                                          | Responsibility                                                                     |
| ---------------------------------------------- | ---------------------------------------------------------------------------------- |
| `.ui-destination-row` (`destination-list.css`) | Stable link geometry, base text color, no underline                                |
| `interactiveRowVariants`                       | Hover family, hit target (`ui-interactive-row--hit-pointer`), selection/state axes |
| `interactiveFocusVariants`                     | Embedded focus-visible policy                                                      |
| `DestinationList`                              | Panel/embedded/filled chrome, optional filled tone, density vars, dividers         |

## Relationship indicator in search rows

Dashboard `CharacterRelationshipIndicator` supports `presentation="inlinePassive"` inside rich rows: icon is decorative (`aria-hidden`); screen readers get relationship copy from the link `aria-label`; pointer hover still opens the tooltip without an extra tab stop.

## Appearance vs density

|          | `panel`                        | `embedded`                          | `filled` (+ optional `tone="strong"`)        |
| -------- | ------------------------------ | ----------------------------------- | -------------------------------------------- |
| Chrome   | Border, radius, transparent bg | No outer panel border               | Border, card radius; strong → muted + shadow |
| Dividers | Inset `::after` on items       | Full-bleed top border between items | Full-bleed `::after` between items           |

Density controls row inset and publishes `--ui-copy-title-size` / `--ui-copy-supporting-size`. Simple rows and rich identity read the same pair. Search inherits compact (14/12) from its list. Campaign destinations inherit comfortable (16/14).
