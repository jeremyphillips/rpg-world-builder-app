# Destination list

Grouped navigation rows — shared link-root behavior with navigable `Card`, distinct list chrome.

Source: `packages/ui/src/components/ui/destination-list.tsx`, `destination-list.css`, `navigable-link-root.lib.ts`.

Entity-rich pickers (combobox, menus) stay on `InteractiveList` + `InteractiveListRow`.

## When to use

| Presentation                    | Component                                                       |
| ------------------------------- | --------------------------------------------------------------- |
| Standalone tile (grid/hub cell) | Navigable `Card` (`link` prop)                                  |
| Hub panel with inset dividers   | `DestinationList appearance="panel"` + simple `DestinationRow`  |
| Popover/search grouped results  | `DestinationList appearance="embedded"` + rich `DestinationRow` |
| Combobox / menu rows            | `InteractiveList` + `InteractiveListRow`                        |

## API

### `DestinationList`

- `appearance?: 'panel' | 'embedded'` (default `panel`)
- `density?: 'compact' | 'comfortable'` (default `comfortable`) — row padding + simple copy sizes only

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
| `DestinationList`                              | Panel/embedded chrome, density vars, dividers                                      |

## Relationship indicator in search rows

Dashboard `CharacterRelationshipIndicator` supports `presentation="inlinePassive"` inside rich rows: icon is decorative (`aria-hidden`); screen readers get relationship copy from the link `aria-label`; pointer hover still opens the tooltip without an extra tab stop.

## Appearance vs density

|          | `panel`                        | `embedded`                          |
| -------- | ------------------------------ | ----------------------------------- |
| Chrome   | Border, radius, transparent bg | No outer panel border               |
| Dividers | Inset `::after` on items       | Full-bleed top border between items |

Density controls `--ui-destination-inset-*` (compact vs comfortable). Rich `IdentityRow` typography is owned by the caller (`size="md"` in search).
