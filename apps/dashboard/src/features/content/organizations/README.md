# content / organizations

Organizations (factions, guilds, governments, and similar groups). Part of the
[`content`](../README.md) feature; see
[feature-structure.md](../../../../docs/feature-structure.md) for layout.

Organization detail surfaces two nested relationship domains: **members** (roster
and membership guidance) and **location connections** (sites, geographic
presence, territorial authority). Create/edit uses familiar starting points
(presets) with ephemeral projection onto domain, form, functions, and practices.

Form projection lives in [`content/lib/forms/organization-form-projection.ts`](../lib/forms/organization-form-projection.ts).
Cross-type relationship chrome lives in [`content/lib/relationship/`](../lib/relationship/).

## `lib/` root rule

`organizations/lib/` root holds **catalog-level seams** referenced across
multiple organization subdomains. Nested folders hold concern-specific behavior.

| Root file                            | Role                                                                       |
| ------------------------------------ | -------------------------------------------------------------------------- |
| `organization-form-def.ts`           | `ContentFormDef` registry wiring                                           |
| `organization-display.ts`            | Detail VM + section labels spanning members and location connections       |
| `organizations-overview-columns.tsx` | Per-type overview table/filter recipe (same convention as species/classes) |

## Building composition boundary

**Building → Organizations composition remains owned by [`locations/`](../locations).**
Ownership follows the **parent authoring transaction**, not the child entity type.
Embedded org create (`building-organizations-*`, composer, drafts, create-tab
controller) stays in locations even when filenames contain "organization."

## Key files

| Area                                                   | Path                                                                                                |
| ------------------------------------------------------ | --------------------------------------------------------------------------------------------------- |
| Form def                                               | `lib/organization-form-def.ts`                                                                      |
| Form projection (SSOT)                                 | [`content/lib/forms/organization-form-projection.ts`](../lib/forms/organization-form-projection.ts) |
| Display / detail VM                                    | `lib/organization-display.ts`                                                                       |
| Overview columns                                       | `lib/organizations-overview-columns.tsx`                                                            |
| Members logic                                          | `lib/members/`                                                                                      |
| Members UI                                             | `components/members/`                                                                               |
| Location connections logic                             | `lib/location-connections/`                                                                         |
| Location connections UI                                | `components/location-connections/`                                                                  |
| Authoring runtime (practice ranking)                   | `lib/authoring/`                                                                                    |
| Authoring UI (preset bridge, form shell, create modal) | `components/authoring/`                                                                             |
| Preset/taxonomy regression corpus                      | `lib/presets/`                                                                                      |
| Story/test fixtures                                    | `fixtures.ts`                                                                                       |

## Cross-feature dependencies

Other sub-areas import organization internals directly (within the `content`
boundary). Classification — path updates only in reorgs; extractions deferred.

| Consumer                                            | Import                                        | Classification                                 |
| --------------------------------------------------- | --------------------------------------------- | ---------------------------------------------- |
| `content/index.ts`                                  | `fixtures.ts`                                 | Legitimate public (barrel-exported)            |
| `locations/` building compose                       | authoring shell, context, member discoverable | Legitimate embedded authoring                  |
| `locations/` connected parties                      | org API, `useOrganizations`                   | Legitimate public API                          |
| `locations/` inverse drawers                        | display VM, member picker constant            | Presentation API / implementation leak (watch) |
| `content/lib/forms/organization-form-projection.ts` | practice ranking, member chip-options         | Inverted dependency (watch)                    |
| `content/lib/relationship/picker/`                  | create modal, browse scope, API/query keys    | Shared cross-content (watch)                   |

## Related docs

- [organizations-classification.md](../../../../docs/organizations-classification.md) — domain, form, functions, practices, members
- [organization-location-connections.md](../../../../docs/organization-location-connections.md) — forward location connection families
- [form-lib-conventions.md](../../../../docs/form-lib-conventions.md) — preset authoring conventions
- [cross-content-relationship-ui.md](../../../../docs/cross-content-relationship-ui.md) — relationship list/drawer shared infra
