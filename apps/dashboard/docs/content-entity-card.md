# Entity presentation contract

Dashboard content features render catalog entities through the **EntityItem** stack:

```text
EntitySummaryModel → EntityItem / EntityItemAnatomy → ContentEntityCard | DisclosureEntityCard | embedded host
```

Do not import `ContentCardBody` from `@rpg/ui` in `apps/dashboard/src/features/content/**` (enforced by ESLint).

## Surfaces

| Surface                    | When                                                      | Shell owns                                                                                          |
| -------------------------- | --------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| **`ContentEntityCard`**    | Bordered static entity card                               | Border, radius, density inset, `EntityItem` anatomy                                                 |
| **`DisclosureEntityCard`** | Bordered entity card + expandable domain body             | Same outer chrome as CEC + collapse caret, header/body divider, body wash, content-column alignment |
| **`EntityItem`**           | Embedded identity inside picker/search/relationship hosts | Typography and seam geometry only — host owns row chrome                                            |

## Density

| `density`                      | Inset       | Heading / secondary typography |
| ------------------------------ | ----------- | ------------------------------ |
| `comfortable` (detail default) | `px-5 py-3` | base / sm                      |
| `compact` (picker rows)        | `px-3 py-2` | sm / xs                        |

**One owner:** set `density` on the **shell** (`ContentEntityCard`, `DisclosureEntityCard`) only. Embedded `EntityItem` hosts pass density into the item once.

## Disclosure content-column contract

`DisclosureEntityCard` composes `CollapsibleListItem` (borderless, `rowLayout="entity-card"`) inside the shared entity card frame.

| Concern                             | Owner                                                                         |
| ----------------------------------- | ----------------------------------------------------------------------------- |
| Header identity                     | `EntityItemAnatomy`                                                           |
| Collapse caret / optional drag grip | `CollapsibleListItem` leading chrome                                          |
| Header/body divider                 | DEC body wash (`border-t`) — full bleed to shell edge                         |
| Body background wash                | DEC — may bleed to shell edge                                                 |
| Body inner alignment                | Shell-owned `--entity-content-indent` (aliases `--content-column-indent`)     |
| Domain body layout                  | Feature `children` only — no `bodyPadding`, `bodyInset`, or `alignBody` props |

Leading grip and caret columns share one width token (`--leading-chrome-size`). Consumers never compensate body inset manually.

## Composition

### Static detail card

```text
ContentEntityCard          density="comfortable"
  EntityCardFrame border + inset
  EntityItemAnatomy
```

### Expandable entity card

```text
DisclosureEntityCard       density="compact" | "comfortable"
  EntityCardFrame border (p-0 overflow)
  CollapsibleListItem        caret + optional drag grip
    EntityItemAnatomy header
    washed body aligned to --entity-content-indent
      {children}
```

### Picker row (legacy — migrate in Phase 4)

```text
CollapsibleListItem        rowLayout="entity-card" preset="catalog"
  EntityItem                 density="compact"
```

Omit `href` at the drawer/picker layer for choose-and-submit flows unless navigation is intended.

## Relationship rows

Typed cross-content edges on detail pages use `CrossContentRelationshipRow` → `DetailEntityRow` → `EntityItemAnatomy`, not card shells. See [cross-content-relationship-ui.md](./cross-content-relationship-ui.md).

## `disabled`

- **`ContentEntityCard` / `DisclosureEntityCard`:** presentational only (`data-disabled`, `opacity-60`).
- **Host row/button:** owns `disabled`, `aria-disabled`, and focus management.

## Future work

Character-builder pickers (`CatalogPickerItemHeader`, `EquipmentPickerItemHeader`) still use bespoke headers — migrate in Phase 4.
