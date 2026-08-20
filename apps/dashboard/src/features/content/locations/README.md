# content / locations

Places in the world (regions, settlements, structures, buildings). Part of the
[`content`](../README.md) feature; see
[feature-structure.md](../../../../docs/feature-structure.md) for layout.

Locations owns hierarchy authoring, multi-kind create flows (modal + page),
building composition (organizations tab), connected parties on detail, and
bulk parent editing.

## `lib/` layout

```text
lib/
  create/                  # create orchestration (setup/, composition/, session/)
  building-organizations/  # nested building org composition tab
  connected-parties/       # detail connected-parties helpers and copy
  hierarchy/               # parent tree editing
    bulk/                  # bulk change-parent action
  forms/                   # ContentFormDef and form field modules
  overview/                # list route columns, filters, search
  <cross-cutting seams>    # see root policy below
```

### Root policy

`locations/lib/` root is reserved for **cross-cutting location-domain seams**
that do not belong to one stable subconcern:

| File                                     | Role                                              |
| ---------------------------------------- | ------------------------------------------------- |
| `location-authoring-type.ts`             | Cross-type location taxonomy seam                 |
| `location-display.ts`                    | Display registry SSOT (detail, overview, pickers) |
| `location-structure.lib.ts`              | Kind/structure rules shared across surfaces       |
| `location-settlement-structure.lib.ts`   | Settlement structure domain                       |
| `location-contextual-terminology.lib.ts` | Vocabulary helpers spanning surfaces              |
| `location-kind-browse-families.ts`       | Browse/discovery axis                             |

## Component prefix families

| Prefix                                                               | Concern                         |
| -------------------------------------------------------------------- | ------------------------------- |
| `location-create-*`                                                  | Create modal, page, setup hosts |
| `location-connected-parties-*` / `location-inverse-*`                | Connected parties detail        |
| `building-organizations-*`                                           | Building org composition tab    |
| `location-children-*` / `location-parent-*` / `bulk-change-parent-*` | Hierarchy editing               |

## Watch — cross-feature import boundaries

~26 files outside `locations/` import directly from `locations/lib/**`. This
reorganization updates paths but does not resolve ownership.

Follow-up: which imports are legitimate public Location APIs vs responsibilities
that belong in `content/lib/` (relationship, overview, entity picker)?

High-churn candidates:

- `location-display.ts` (display registry — likely stays)
- `location-connected-parties-people-kind-slots.ts` (overlap with `content/lib/relationship/location-connection/`)
- `location-authoring-type.ts` + `location-create-shortcuts.ts` (relationship picker vocabulary)
- `LocationCreateModal` (component imported by relationship nested-create)

## Related docs

- [locations-building-classification.md](../../../../docs/locations-building-classification.md)
- [create-flow.md](../../../../docs/create-flow.md) — building orgs reference implementation
- [form-lib-conventions.md](../../../../docs/form-lib-conventions.md)
