# New Content Type — Reference

Companion to [SKILL.md](./SKILL.md). Checklist, manifest fields, drift map, and
template types. Policy prose stays in [`docs/content-types.md`](../../../docs/content-types.md).

---

## Full checklist

Use on **create**; use as an audit rubric on **audit**. Step detail, Zod
patterns, and vocab rules → [`docs/content-types.md`](../../../docs/content-types.md).

| Step | Layer     | Deliverable                                                                                                                                               |
| ---- | --------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 0    | Tooling   | Entry in `CONTENT_TYPE_INTEGRATION_MANIFEST`                                                                                                              |
| 1    | Contracts | `<type>.ts` schema, inputs, patch DTOs, tests, barrel export                                                                                              |
| 1b   | Contracts | `CONTENT_TYPE_TERMS` entry; vocab maps if closed sets                                                                                                     |
| 1c   | Contracts | `CONTENT_TYPE_CAPABILITIES` when duplication applies                                                                                                      |
| 2    | Catalog   | Seed JSON under `packages/catalog/src/<type>/data/srd-cc-5.2.1/`                                                                                          |
| 3    | Catalog   | `index.ts` loaders + `index.test.ts`; `package.json` export                                                                                               |
| 4    | API       | Patch/homebrew Mongoose models when needed                                                                                                                |
| 5    | API       | `<type>.config.ts` — imports `@rpg/catalog/<type>`                                                                                                        |
| 6    | API       | One line in `content-types.ts`                                                                                                                            |
| 7    | API       | List route — automatic after step 6 (no controller change)                                                                                                |
| 8    | Dashboard | `api/<type>-api.ts` (or `createContentListApi` factory)                                                                                                   |
| 9    | Dashboard | `hooks/use-<type>.ts` query hook                                                                                                                          |
| 10   | Dashboard | `lib/<type>-overview-columns.tsx` + stories — **confirm columns/filters with user first** (see [SKILL § Overview table UX](./SKILL.md#overview-table-ux)) |
| 11   | Dashboard | `routes/<type>-overview.tsx`                                                                                                                              |
| 12   | Dashboard | `routes/<type>-detail.tsx` + `lib/<type>-display.ts` view model + stories                                                                                 |
| 13   | Dashboard | Sub-area `index.ts` — hooks only, not route screens                                                                                                       |
| 14   | Dashboard | Re-export hooks from `features/content/index.ts`                                                                                                          |
| 15   | Dashboard | `CONTENT_ROUTES` entry in `app/content-routes.ts`                                                                                                         |
| 16   | Dashboard | Lazy route exports in `app/lazy-routes.ts`                                                                                                                |
| 17   | Dashboard | Router tree in `app/router.tsx`                                                                                                                           |
| 18   | Dashboard | `VISIBLE_SIDEBAR_CONTENT` when `visibleInSidebar: true`                                                                                                   |
| —    | Tests     | `content-form-test-registry.ts` import when form def exists                                                                                               |
| —    | Gates     | All [layer drift tests](#drift-test-map) green                                                                                                            |

---

## Overview columns and filters

Shared infra: `buildContentColumns`, `buildContentFilterSchema`,
`ContentOverviewBaseFilterState` (source, status, search). Type-specific work
is middle columns + optional `createEqualsFilter` rows.

**Agent rule:** if the user did not specify middle columns or filters, prompt
with recommendations before creating `*-overview-columns.tsx`. Do not invent
silently.

### Patterns by reference type

| Type                        | Middle columns                              | Type-specific filters                       |
| --------------------------- | ------------------------------------------- | ------------------------------------------- |
| `skill-proficiencies`       | Ability (uppercase label)                   | Ability equals                              |
| `feats`                     | Category, prerequisite summary, repeatable  | Category equals                             |
| `species`                   | Trait count, size, movement                 | None (base only)                            |
| `classes`                   | Hit die, primary ability, spellcasting flag | Varies — see `classes-overview-columns.tsx` |
| `spells`                    | Level, school, casting time, …              | School equals (vocabulary-aware)            |
| `equipment` (hub)           | Kind, cost                                  | Kind equals                                 |
| Equipment family sub-routes | Family-specific (e.g. damage, AC)           | Often none or one enum                      |

### Minimal default (when unsure)

Recommend **name-only** middle columns (empty `TYPE_MIDDLE_COLUMNS`) and **no
type-specific filters** unless the schema has an obvious closed enum the DM will
use to narrow the list. User can always add columns later.

### Implementation files

| Piece                 | Path                                                         |
| --------------------- | ------------------------------------------------------------ |
| Column/filter module  | `lib/<type>-overview-columns.tsx`                            |
| Co-located stories    | `lib/<type>-overview-columns.stories.tsx`                    |
| Overview route wiring | `routes/<type>-overview.tsx` imports columns + filter schema |

---

| Complexity                  | Template              | Key files                                                                                                                 |
| --------------------------- | --------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| Simple flat + VM            | `skill-proficiencies` | `skill-proficiency-display.ts`, single-page form                                                                          |
| Detail VM (flat)            | `feats`               | `feat-display.ts`, requirement editor submodule                                                                           |
| Tabs + master-detail        | `species`             | `species-form-def.ts`, heritage/trait sub-forms                                                                           |
| Full homebrew + custom read | `classes`             | `classes.config.ts`, `derive-classes-catalog`, subclass nested routes                                                     |
| Multi-variant union         | `equipment`           | Family routes, discriminated union — [equipment README](../../../apps/dashboard/src/features/content/equipment/README.md) |
| Resolution-heavy            | `spells`              | [spell-resolution skill](../spell-resolution/SKILL.md)                                                                    |

Dashboard sub-areas live under `apps/dashboard/src/features/content/<folder>/`.
API configs under `apps/api/src/features/content/<type>/`. Catalog under
`packages/catalog/src/<type>/`.

---

## Integration manifest field reference

Source: [`content-type-integration-manifest.ts`](../../../tools/content-types/src/content-type-integration-manifest.ts)

```typescript
type ContentTypeIntegrationManifestEntry = {
  catalog?: { packageName: string } // @rpg/catalog/<segment>
  api: { registrationPath: string } // repo-relative *.config.ts
  dashboard?: {
    folder: string // content feature subfolder
    routeSection?: string // CONTENT_ROUTES key (camelCase)
    formDefinitionPath?: string // repo-relative *-form-def.ts
    visibleInSidebar?: boolean // hub + campaign sidebar
  }
  capabilities: { required: boolean } // CONTENT_TYPE_CAPABILITIES entry
}
```

**Non-authoritative:** metadata only. Runtime registries (`content-types.ts`,
`contentFormRegistry`, `CONTENT_ROUTES`, etc.) own behavior.

**Nested resources** (subclasses) are **not** in this manifest.

Query helpers (for drift tests): `@rpg/content-types` exports
`contentTypeKeysWithFormDefinition`, `contentTypeKeysWithVisibleInSidebar`,
`contentTypeKeysWithRouteSection`, etc.

---

## Drift-test map

| Layer             | Location                                                             | Asserts                           |
| ----------------- | -------------------------------------------------------------------- | --------------------------------- |
| Tooling           | `tools/content-types/src/content-type-integration-manifest.test.ts`  | Manifest keys, path files exist   |
| Contracts         | `packages/contracts/.../content-type-term-coverage.test.ts`          | Terms + capabilities ↔ keys       |
| Catalog           | `packages/catalog/src/content-type-integration-manifest.test.ts`     | Export subpaths                   |
| API               | `apps/api/.../content-types.integration-manifest.test.ts`            | Registry ↔ manifest               |
| Dashboard routes  | `apps/dashboard/src/app/content-routes.integration-manifest.test.ts` | `CONTENT_ROUTES` ↔ `routeSection` |
| Dashboard sidebar | `apps/dashboard/.../content-registry.test.ts`                        | Sidebar ↔ `visibleInSidebar`      |
| Dashboard forms   | `apps/dashboard/.../content-form-registry.test.ts`                   | Registry ↔ `formDefinitionPath`   |

---

## Semantic registries (contracts)

| Registry          | Path                                                                  |
| ----------------- | --------------------------------------------------------------------- |
| Keys              | `packages/contracts/src/rpg/content/lib/content-type-keys.ts`         |
| Terms             | `packages/contracts/src/rpg/content/lib/content-type-terms.ts`        |
| Capabilities      | `packages/contracts/src/rpg/content/lib/content-type-capabilities.ts` |
| Homebrew hub keys | `packages/contracts/src/rpg/content/lib/homebrew-summary.ts`          |

---

## Link-out table (not inlined in skill)

| Topic                   | Where                                                                                                                                               |
| ----------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| Delete + blockers       | [`docs/content-types.md`](../../../docs/content-types.md) § Delete homebrew content                                                                 |
| Draft/publish intent    | [`docs/content-types.md`](../../../docs/content-types.md) § Content key mutability                                                                  |
| Duplication             | [`docs/content-types.md`](../../../docs/content-types.md) + [`apps/api/docs/content-duplication.md`](../../../apps/api/docs/content-duplication.md) |
| Requirement expressions | [`docs/content-types.md`](../../../docs/content-types.md) § Requirement expressions                                                                 |
| Content traits / grants | [`docs/content-types.md`](../../../docs/content-types.md) § Content traits                                                                          |
| Subclasses (nested)     | [`docs/content-types.md`](../../../docs/content-types.md) § Subclass ownership                                                                      |
| Vocab audit             | [`docs/content-types.md`](../../../docs/content-types.md) § Audit CLI                                                                               |
| Equipment families      | [`equipment/README.md`](../../../apps/dashboard/src/features/content/equipment/README.md)                                                           |
| Spells / resolution     | [spell-resolution skill](../spell-resolution/SKILL.md)                                                                                              |

---

## Known gaps (honest)

| Gap                                             | Status                                      |
| ----------------------------------------------- | ------------------------------------------- |
| Nested resource manifest                        | Deferred — subclasses documented separately |
| Campaign availability server persistence        | Deferred                                    |
| `locations` / `monsters` dashboard placeholders | Not registered types                        |
| Scaffold CLI                                    | Future — reads integration manifest         |

---

## Naming quick reference

| Concept              | Convention       | Example                 |
| -------------------- | ---------------- | ----------------------- |
| Dashboard/API folder | content type key | `skill-proficiencies/`  |
| URL segment          | kebab plural     | `/skill-proficiencies`  |
| API registry key     | kebab plural     | `'skill-proficiencies'` |
| JSON response key    | camelCase plural | `skillProficiencies`    |
| `CONTENT_ROUTES` key | camelCase        | `skillProficiencies`    |
| Contract type        | PascalCase       | `SkillProficiency`      |
