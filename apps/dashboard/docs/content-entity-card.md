# Entity presentation contract

Entity identity uses one stack:

```text
EntitySummaryModel → EntitySummary → EntityItem → embedded host | ContentEntityCard | DisclosureEntityCard
```

`EntitySummaryModel` contains identity content only: `heading`, optional
`classification`, `description`, `status`, and `media`. It never carries navigation.
`EntityItem` adds optional heading navigation, leading controls, an action, and density.

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
full-row navigation, omit `EntityItem.href`.

## Density

`EntityItem` owns identity typography, rhythm, media/leading/action geometry, and its
embedded density inset. `ContentEntityCard` and `DisclosureEntityCard` own their
bordered shell and pass their density to the internal item.

Set density exactly once:

- standalone cards: set it on CEC or DEC;
- embedded hosts: set it on `EntityItem`;
- never size a shell and nested item independently.

## Disclosure content-column contract

DEC owns the collapse caret, optional drag grip, header/body divider, body wash, and
body alignment. Horizontal inset splits into two independent rules:

- **inline start:** density inset + leading-chrome indent (`--entity-content-indent`)
- **inline end:** density inset only (`--entity-density-inline`)

Leading chrome changes where entity/domain content begins. Trailing header actions
never change where disclosed content ends — delete, Add, commerce, and overflow
controls must not drive body padding.

The divider and body wash remain edge-to-edge. Grip and caret columns share one
`--leading-chrome-size`; consumers must not add compensating body or leading padding.

The outer DEC shell owns `bg-card` / `--surface-current: card` so nested form hosts
(for example grant arrays inside feature `ArrayItem` shells) cannot bleed parent fill
into the header. Body wash still uses `bg-surface-muted` on top of that card plane.

Feature code may lay out genuine domain content inside DEC children. It must not
override entity heading typography, padding, border, radius, divider, alignment, or
action placement.

## Relationship rows

Typed cross-content edges on detail pages use `CrossContentRelationshipRow` → `DetailEntityRow` → `EntityItemAnatomy`, not card shells. See [cross-content-relationship-ui.md](./cross-content-relationship-ui.md).

## Closed consumer API

`EntityItem`, CEC, and DEC deliberately expose no `className`, `style`, padding,
inset, header/body, or divider styling props. Provide semantic data and controls
through `entity`, `leading`, `action`, and DEC `children` only.

`ContentCardHeading`, `ContentCardBody`, and `EntityCardFrame` are internal
implementation details. Feature code uses the entity surfaces above rather than
composing those internals directly.

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
