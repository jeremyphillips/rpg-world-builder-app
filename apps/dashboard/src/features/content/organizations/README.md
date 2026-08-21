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

## `components/` ownership

| Folder                             | Owns                                                                                                                                                                                        |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `components/create/`               | Organization **create-lifecycle** UI and state (provider, preset bridge, nested create modal). Used by org create route, nested-create, and embedded building create. **Not** used on edit. |
| `components/members/`              | Detail members surface (section, drawer orchestrator, member picker).                                                                                                                       |
| `components/location-connections/` | Detail org→location connections (section, list row, link drawer).                                                                                                                           |

Flat layout in `members/` and `location-connections/` is a **local** decision for
today's file count and filename-role vocabulary — not a standing rule that
Organization families must stay flat. Re-evaluate when private children,
controllers, or unrelated surfaces accumulate in one folder.

### Composition trees

```text
components/create/
  consumer → OrganizationAuthoringFormShell → OrganizationAuthoringProvider
    └── form + OrganizationAuthoringPresetBridge

components/members/
  OrganizationMembersDetailSection
  ├── OrganizationMembersSection
  └── OrganizationMembersDetailDrawers
        └── OrganizationMemberPickerDrawer

components/location-connections/
  OrganizationLocationConnectionsDetailSection
  ├── OrganizationLocationConnectionsSection
  │     └── OrganizationLocationConnectionListRow
  └── OrganizationLocationConnectionLinkDrawer
```

### Supported cross-feature entry points

| Consumer                     | May import                                                             |
| ---------------------------- | ---------------------------------------------------------------------- |
| `relationship/nested-create` | `components/create/organization-create-modal.client.tsx` only          |
| Locations building composer  | `components/create/` (FormShell, context, PresetBridge)                |
| Org detail route             | `*-detail-section` composition roots in members / location-connections |

Do not import private children (section, list row, picker, link drawer) from
other features. Domain contracts live in `lib/members/` and
`lib/location-connections/`.

## `lib/` root rule

`organizations/lib/` root holds **catalog-level seams** referenced across
multiple organization subdomains. Nested folders hold concern-specific behavior.

| Root file                            | Role                                                                       |
| ------------------------------------ | -------------------------------------------------------------------------- |
| `organization-form-def.ts`           | `ContentFormDef` registry wiring                                           |
| `organization-display.ts`            | Detail VM + section labels spanning members and location connections       |
| `organizations-overview-columns.tsx` | Per-type overview table/filter recipe (same convention as species/classes) |

| Folder                      | Owns                                                                                |
| --------------------------- | ----------------------------------------------------------------------------------- |
| `lib/authoring/`            | Reusable authoring-domain/runtime logic (practice combobox ranking) — not create UI |
| `lib/presets/`              | Preset/domain data and regression corpus                                            |
| `lib/members/`              | Member picker contracts, selection policy, row builders                             |
| `lib/location-connections/` | Forward connection cards/VMs, surface copy, mutation context, browse scope          |

## Building composition boundary

**Building → Organizations composition remains owned by [`locations/`](../locations).**
Ownership follows the **parent authoring transaction**, not the child entity type.
Embedded org create (`building-organizations-*`, composer, drafts, create-tab
controller) stays in locations even when filenames contain "organization."

## Key files

| Area                    | Path                                                                                                |
| ----------------------- | --------------------------------------------------------------------------------------------------- |
| Form def                | `lib/organization-form-def.ts`                                                                      |
| Form projection (SSOT)  | [`content/lib/forms/organization-form-projection.ts`](../lib/forms/organization-form-projection.ts) |
| Display / detail VM     | `lib/organization-display.ts`                                                                       |
| Overview columns        | `lib/organizations-overview-columns.tsx`                                                            |
| Create UI               | `components/create/`                                                                                |
| Members UI              | `components/members/`                                                                               |
| Location connections UI | `components/location-connections/`                                                                  |
| Authoring runtime       | `lib/authoring/`                                                                                    |
| Preset/taxonomy corpus  | `lib/presets/`                                                                                      |
| Story/test fixtures     | `fixtures.ts`                                                                                       |

## Cross-feature dependencies

Other sub-areas import organization internals directly (within the `content`
boundary). Classification — path updates only in reorgs; extractions deferred.

| Consumer                                            | Import                                  | Classification                      |
| --------------------------------------------------- | --------------------------------------- | ----------------------------------- |
| `content/index.ts`                                  | `fixtures.ts`                           | Legitimate public (barrel-exported) |
| `locations/` building compose                       | create FormShell, context, PresetBridge | Legitimate embedded create          |
| `locations/` connected parties                      | org API, `useOrganizations`             | Legitimate public API               |
| `content/lib/relationship/nested-create/`           | create modal                            | Supported create entry              |
| `content/lib/forms/organization-form-projection.ts` | practice ranking, member chip-options   | Inverted dependency (watch)         |

Import boundaries are enforced by
[`organization-components-import-boundary.guard.test.ts`](components/organization-components-import-boundary.guard.test.ts).

## Related docs

- [organizations-classification.md](../../../../docs/organizations-classification.md) — domain, form, functions, practices, members
- [organization-location-connections.md](../../../../docs/organization-location-connections.md) — forward location connection families
- [form-lib-conventions.md](../../../../docs/form-lib-conventions.md) — preset authoring conventions
- [cross-content-relationship-ui.md](../../../../docs/cross-content-relationship-ui.md) — relationship list/drawer shared infra
