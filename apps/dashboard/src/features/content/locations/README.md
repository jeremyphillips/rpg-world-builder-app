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
  create/
    setup/                 # per-kind setup, modal setup, setup chrome
    composition/           # nested building/settlement composition
    session/               # session, draft, page orchestration
    location-create-*.ts   # shortcuts, authoring capabilities (create root)
  building-organizations/  # nested building org composition tab
  connected-parties/       # detail connected-parties helpers and copy
  hierarchy/
    bulk/                  # bulk change-parent action
    location-parent-*      # parent picker, replacement, graph
  forms/                   # ContentFormDef and form field modules
  overview/                # list route columns, filters, search
  location-display.ts      # display registry SSOT (lib root)
  location-authoring-type.ts
  location-structure.lib.ts
  …                        # other cross-cutting seams (see below)
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

Form modules live under `lib/forms/` (not lib root) to keep the root small while
matching the form suffix split in
[form-lib-conventions.md](../../../../docs/form-lib-conventions.md).

Overview list config lives under `lib/overview/`; `location-display.ts` stays at
root because it is consumed across detail, overview, organizations, and pickers.

## `components/` layout

Concern subfolders mirror `lib/` where responsibilities align (see
[`organizations/README`](../organizations/README.md) for the pairing pattern).

```text
components/
  create/                  # modal, page, form shell orchestration (root)
    setup/                 # setup host, session, per-kind setup panels
    composition/           # settlement composition context + form slot
  connected-parties/       # detail sections, inverse relationship drawers
  hierarchy/               # children, parent replacement, bulk change
  building-organizations/  # building org composition tab UI
  detail/                  # detail identity + metadata chrome
```

| Concern              | Logic                         | UI                                   |
| -------------------- | ----------------------------- | ------------------------------------ |
| Create orchestration | `lib/create/session/`, root   | `components/create/`                 |
| Create setup gate    | `lib/create/setup/`           | `components/create/setup/`           |
| Create composition   | `lib/create/composition/`     | `components/create/composition/`     |
| Connected parties    | `lib/connected-parties/`      | `components/connected-parties/`      |
| Hierarchy            | `lib/hierarchy/`              | `components/hierarchy/`              |
| Building orgs tab    | `lib/building-organizations/` | `components/building-organizations/` |
| Detail presentation  | `lib/location-display.ts`     | `components/detail/`                 |

Settlement starting-districts form slot (`components/create/composition/`) is wired
via intentional `kind: 'slot'` in `lib/forms/location-form-fields.ts` per
[form-lib-conventions.md](../../../../docs/form-lib-conventions.md).

## Key files

| Area                    | Path                                                                                                   |
| ----------------------- | ------------------------------------------------------------------------------------------------------ |
| Form def                | `lib/forms/location-form-def.ts`                                                                       |
| Display registry        | `lib/location-display.ts`                                                                              |
| List route              | `routes/locations-overview.tsx`                                                                        |
| Overview columns        | `lib/overview/locations-overview-columns.tsx`                                                          |
| Building orgs reference | `lib/building-organizations/`, `components/building-organizations/building-organizations-composer.tsx` |
| Create modal            | `components/create/location-create-modal.tsx`                                                          |

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
