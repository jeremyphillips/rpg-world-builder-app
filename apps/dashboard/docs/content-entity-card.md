# Entity presentation contract

Entity identity uses one stack:

```text
EntitySummaryModel → EntitySummary → EntityItemAnatomy → embedded host | ContentEntityCard | DisclosureEntityCard
```

`EntitySummaryModel` contains identity content only: `heading`, optional
`classification`, `description`, `status`, and `media`. It never carries navigation.
`EntityItem` adds optional heading navigation (`headingHref`), a single leading utility,
semantic trailing (`action` | `indicator` | `group`), and density.

## Choose a surface

| Need                                                                                   | Surface                                |
| -------------------------------------------------------------------------------------- | -------------------------------------- |
| Identity inside a search result, combobox, preview, destination, or master-detail host | `EntityItem`                           |
| Bordered static identity                                                               | `ContentEntityCard`                    |
| Bordered identity with expandable domain content                                       | `DisclosureEntityCard`                 |
| Detail hierarchy or typed relationship                                                 | `DetailEntityRow` / `RelationshipList` |
| Anonymous form value or choice affordance                                              | Purpose-built form/choice component    |

The host keeps its own navigation, hover, selection, separators, drag behavior, and
domain controls. Never put a full-row link in `EntitySummaryModel`; when a host owns
full-row navigation, omit `EntityItem.headingHref`.

## Density

`EntityItemAnatomy` owns identity typography, rhythm, media/leading/trailing geometry.
Embedded hosts own collection inset (horizontal padding, hover, separators).
`ContentEntityCard` and `DisclosureEntityCard` own their bordered shell inset and pass
density to the internal anatomy.

Set density exactly once:

- standalone cards: set it on CEC or DEC;
- embedded hosts: set it on `EntityItem` and add host-owned row inset;
- never size a shell and nested item independently.

## Leading offset contract

Leading utilities (grip, disclosure caret, or a single host utility) determine
content-start via `--entity-leading-offset`, published once on the surface root
(DEC `article`, CEC `EntityCardFrame`, embedded `EntityItem` when no outer surface
already published). `EntityItemAnatomy` and `EntityLeadingRail` consume the var only.

DEC body inline-start = density inset + `--entity-leading-offset`. Inline-end = density
inset only — trailing header actions never change disclosed content end padding.

## Disclosure content-column contract

DEC owns the collapse caret, optional drag grip (via `dragHandleProps`), header/body
divider, body wash, and body alignment. CollapsibleListItem supplies disclosure
behavior only; leading controls render in `EntityLeadingRail` inside anatomy.

The divider and body wash remain edge-to-edge. Grip and caret columns share one
`--leading-chrome-size`; consumers must not add compensating body or leading padding.

The outer DEC shell owns `bg-card` / `--surface-current: card` so nested form hosts
(for example grant arrays inside feature `ArrayItem` shells) cannot bleed parent fill
into the header. Body wash still uses `bg-surface-muted` on top of that card plane.

Feature code may lay out genuine domain content inside DEC children. It must not
override entity heading typography, padding, border, radius, divider, alignment, or
trailing placement.

## Trailing kinds

| Kind        | Use                                               |
| ----------- | ------------------------------------------------- |
| `action`    | Add, delete, overflow, selection controls         |
| `indicator` | Destination chevrons, quiet `×qty` labels         |
| `group`     | Commerce stacks (qty + Add, secondary price/meta) |

## Relationship rows

Typed cross-content edges on detail pages use `CrossContentRelationshipRow` → `DetailEntityRow` → `EntityItemAnatomy`, not card shells. See [cross-content-relationship-ui.md](./cross-content-relationship-ui.md).

## Closed consumer API

`EntityItem`, CEC, and DEC deliberately expose no `className`, `style`, padding,
inset, header/body, or divider styling props. Provide semantic data and controls
through `entity`, `leading`, `trailing`, `headingHref`, and DEC `children` only.

`ContentCardHeading`, `ContentCardBody`, `EntityCardFrame`, `EntityItemAnatomy`, and
`EntityLeadingRail` are internal implementation details. Feature code uses the entity
surfaces above rather than composing those internals directly.

## Form arrays — form-owned ≠ form-styled

Entity-backed grant / catalog arrays keep RHF registration, validation,
append/remove/reorder, and dirty state in the form layer. Their **presentation**
uses `ArrayItemConfig.renderShell` → `EntityDisclosureArrayItemShell` →
`DisclosureEntityCard`, not the generic `ArrayItem` card chrome.

Anonymous configuration arrays (modifiers, tags, wealth tiers without a catalog
identity) stay on the default ArrayItem shell. Do not invent fake
`EntitySummaryModel` rows for those.

## Disabled state

CEC and DEC expose presentational disabled state. Hosts still own interactive
`disabled`, `aria-disabled`, and focus behavior.
