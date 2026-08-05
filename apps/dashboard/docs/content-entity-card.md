# Content entity card contract

Dashboard content features render catalog entities through **`ContentEntityCard`** — the only public entity presentation API. Do not import `ContentCardBody` from `@rpg/ui` in `apps/dashboard/src/features/content/**` (enforced by ESLint).

## Invariants

> A consuming surface may change `ContentEntityCard` **density** / **chrome**, but must not reconstruct internal spacing, typography, or action layout from unrelated shell primitives.

> **embedded removes only card-owned outer chrome. It does not remove or alter entity-owned inset, typography, rhythm, or slots.**

## Chrome (`standalone` | `embedded`)

`chrome` answers one question: **who draws the outer shell?**

| `chrome`               | Border / bg                       | Density inset                       |
| ---------------------- | --------------------------------- | ----------------------------------- |
| `standalone` (default) | Card draws `border border-border` | Entity-owned via `density`          |
| `embedded`             | Host draws row chrome             | **Same inset tokens as standalone** |

`chrome` is visual-only — it does not encode navigation or interaction policy.

## Density

| `density`                      | Inset       | Heading / secondary typography |
| ------------------------------ | ----------- | ------------------------------ |
| `comfortable` (detail default) | `px-5 py-3` | base / sm                      |
| `compact` (picker rows)        | `px-4 py-3` | sm / xs                        |

**One owner:** `ContentEntityCard.density` → `ContentCard.density`. Picker/list primitives must not expose entity density.

## Spacing ownership

| Layer                                    | Owns                                                                                   | Must not own                                                   |
| ---------------------------------------- | -------------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| **`ContentEntityCard`**                  | Entity inset, typography, slots, vertical rhythm inside the card                       | Row border/bg, interaction disabling (ARIA), navigation policy |
| **`CollapsibleListItem` (catalog host)** | Row border/bg/radius, hover/selected, structural leading-chrome gutters, inter-row gap | Entity content inset, entity density                           |
| **`CatalogPickerSheet`**                 | Search, sheet layout, list gap, picker navigation policy                               | Entity presentation                                            |

When `rowLayout="entity-card"`, the catalog host drops **content-area** inset and duplicate header vertical padding — not structural gutters or list gap.

## Composition

### Detail surface

```text
ContentEntityCard          chrome="standalone" density="comfortable"
  article border + px-5 py-3
  heading / subheading / endSlot
```

### Picker row

```text
CollapsibleListItem        rowLayout="entity-card" rowPreset="catalog"
  ContentEntityCard        chrome="embedded" density="compact"
    px-4 py-3 (entity-owned)
    heading / subheading / endSlot
```

Omit `href` at the drawer/picker layer for choose-and-submit flows. The card supports `href` in both chrome modes when navigation is intended.

## `disabled`

- **`ContentEntityCard`:** presentational only (`data-disabled`, `opacity-60`).
- **Host row/button:** owns `disabled`, `aria-disabled`, and focus management.

## Future work

Character-builder pickers (`CatalogPickerItemHeader`, `EquipmentPickerItemHeader`) still use bespoke headers — migrate separately to avoid global catalog inset changes.
