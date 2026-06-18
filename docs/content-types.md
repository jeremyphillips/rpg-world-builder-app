# Adding a New Content Type

This guide covers the end-to-end steps for adding a fully wired catalog content type to RPG World Builder. The pattern is contracts-first: the Zod schema is the single source of truth, and every layer derives from it.

**Reference implementations**: `classes` (full Mongoose homebrew/patch support) and `skillProficiencies` (patch support via shared factory, homebrew deferred).

---

## When to add a new content type

Add a new content type when the domain entity:

- Is a catalogued, reusable reference entity (not a campaign-specific record).
- Has its own overview page (list) and detail page in the dashboard.
- Can be customized per-campaign via patches or homebrew (even if that isn't built yet).

If the entity is always embedded inside another (e.g. class features, spell components), model it as a nested schema on the parent type instead.

---

## Layer overview

```
packages/contracts/src/<type>.ts   ← Zod schemas, TypeScript types, DTOs
apps/api/src/features/content/
  <type>/
    data/srd-cc-5.2.1/<type>.json  ← System seed data
    seed.ts                        ← Validates JSON at module load, exports loaders
    seed.test.ts                   ← Count + structural assertions
    <type>.config.ts               ← ContentTypeConfig wiring
    homebrew-<type>.model.ts       ← (when homebrew is needed) Mongoose schema
    <type>-patch.model.ts          ← (when patches are needed) Mongoose schema
  content-types.ts                 ← Single-line registry entry
  content.routes.ts                ← GET route declaration
  content.controller.ts            ← Handler function
apps/dashboard/src/features/content/<camelCasePlural>/
  api/<type>-api.ts                ← fetch wrapper
  hooks/use-<type>.ts              ← TanStack Query hook + query key
  components/<type>-columns.tsx    ← DataTable column/filter defs + stories
  routes/<type>-overview.tsx       ← Overview (list) page
  routes/<type>-detail.tsx         ← Detail page + stories
  index.ts                         ← Sub-area barrel
apps/dashboard/src/
  features/content/index.ts        ← Content feature barrel
  app/routes.ts                    ← ROUTES constant
  app/router.tsx                   ← React Router wiring
  components/layout/sidebar/campaign-nav-section.tsx  ← Sidebar NavItem
```

---

## Step-by-step checklist

### 1. Contracts (`packages/contracts/src/`)

Create `<type>.ts` following this pattern:

```typescript
import { z } from 'zod'
import { contentBodyBaseSchema, contentMetaSchema, contentPatchBaseSchema, slugSchema } from './content'

export const <type>BodySchema = contentBodyBaseSchema.extend({
  // type-specific fields
})

export const <type>Schema = contentMetaSchema.extend(<type>BodySchema.shape)
export type <TypeName> = z.infer<typeof <type>Schema>

export const create<TypeName>InputSchema = <type>BodySchema.extend({ slug: slugSchema })
export const update<TypeName>InputSchema = create<TypeName>InputSchema.partial()
export const <type>PatchSchema = contentPatchBaseSchema.extend({ patch: <type>BodySchema.partial() })
```

Rules:

- Always extend `contentBodyBaseSchema` — never redefine `name`, `description`, `imageKey`.
- Avoid `z.enum` for open lists (items, feature names). Use `z.string()` unless the engine branches on the value.
- Name the stored type to avoid reserved words or collisions (e.g. `CharacterClass` not `Class`).

Re-export from `packages/contracts/src/index.ts`:

```typescript
export * from './<type>'
```

Add a co-located `<type>.test.ts` covering:

- A well-formed system record parses correctly.
- A homebrew record (with `campaignId`) parses correctly.
- Required fields are validated.
- Optional fields can be omitted.
- `create*InputSchema` requires a slug and validates it.
- `update*InputSchema` allows partial updates.
- `*PatchSchema` requires `campaignId` and `targetId`.

If the type has a **closed set of ids** (like skills or classes), export a static `NAME_MAP` constant and a `getXName(id): string` helper with a homebrew-safe fallback:

```typescript
export const THING_NAMES = { 'slug-a': 'Display A', ... } as const
export type ThingSlug = keyof typeof THING_NAMES

export function getThingName(id: string): string {
  return THING_NAMES[id as ThingSlug] ?? id
}
```

See `SKILLS`/`getSkillName` in `skill-proficiency.ts` and `CLASS_NAMES`/`getClassName` in `class.ts` as canonical examples.

### 2. API seed data (`apps/api/src/features/content/<type>/data/srd-cc-5.2.1/`)

Create `<type>.json` with an array of objects that satisfy `<type>Schema`. Every record must include all `contentMetaSchema` fields:

```json
{
  "id": "srd-cc-5.2.1:<slug>",
  "slug": "<slug>",
  "rulesetId": "srd-cc-5.2.1",
  "source": "system",
  "campaignId": null,
  "createdAt": "2024-05-21T00:00:00.000Z",
  "updatedAt": "2024-05-21T00:00:00.000Z",
  ...typeSpecificFields
}
```

### 3. API seed loader (`apps/api/src/features/content/<type>/seed.ts`)

```typescript
import { z } from 'zod'
import { <type>Schema } from '@rpg/contracts'
import type { <TypeName>, SystemRulesetId } from '@rpg/contracts'
import raw from './data/srd-cc-5.2.1/<type>.json'

const SRD_521 = z.array(<type>Schema).parse(raw)  // fails fast if JSON is malformed

const SEED_BY_RULESET = {
  'srd-cc-5.2.1': SRD_521,
} as const satisfies Record<SystemRulesetId, <TypeName>[]>

export function loadSeed<TypeName>s(rulesetId: SystemRulesetId): <TypeName>[] {
  return SEED_BY_RULESET[rulesetId]
}

export function seed<TypeName>Slugs(rulesetId: SystemRulesetId): ReadonlySet<string> {
  return new Set(loadSeed<TypeName>s(rulesetId).map((r) => r.slug))
}
```

Add `seed.test.ts` asserting:

- Correct count of seed records.
- All records use `source: 'system'`, `campaignId: null`, `rulesetId` matching input.
- `id === \`${rulesetId}:${slug}\`` for every record.
- Unique slugs.

### 4. Mongoose models (when homebrew/patches are needed)

**Patch model** — use `createContentPatchModel` from the shared factory. Every content type's patch collection has the same `{ campaignId, targetId, patch }` shape; the factory handles schema creation, unique indexing, and Mongoose model registration:

```typescript
// <type>-patch.model.ts
import { createContentPatchModel } from '../lib/content-patch-model'

export const <TypeName>PatchModel = createContentPatchModel('<TypeName>Patch')
```

See `apps/api/src/features/content/lib/content-patch-model.ts` for the factory, and `skill-proficiency-patch.model.ts` / `class-patch.model.ts` as examples.

**Homebrew model** — each type's homebrew schema is type-specific (it stores the full body). Skip this until homebrew authoring UX is built:

```typescript
// homebrew-<type>.model.ts — stores { campaignId, rulesetId, slug, ...body }
```

See `apps/api/src/features/content/classes/homebrew-class.model.ts` for the canonical pattern.

### 5. Content type config (`apps/api/src/features/content/<type>/<type>.config.ts`)

```typescript
import type { <TypeName> } from '@rpg/contracts'
import type { ContentTypeConfig } from '../lib/content-type-config'
import type { OverlayPatch } from '../lib/resolve-catalog'
import { loadSeed<TypeName>s, seed<TypeName>Slugs } from './seed'
import { <TypeName>PatchModel } from './<type>-patch.model'

interface <TypeName>PatchRecord {
  targetId: string
  patch: Record<string, unknown>
}

export const <type>ContentConfig: ContentTypeConfig<<TypeName>> = {
  type: '<kebab-plural>',
  loadSystem: loadSeed<TypeName>s,
  systemSlugs: seed<TypeName>Slugs,
  loadPatches: async (campaignId) => {
    const docs = await <TypeName>PatchModel.find({ campaignId }).lean<<TypeName>PatchRecord[]>()
    return docs.map<OverlayPatch>((d) => ({ targetId: d.targetId, patch: d.patch }))
  },
  loadHomebrew: async (_campaignId, _rulesetId) => [],  // replace when homebrew lands
}
```

If patch support isn't needed yet, use a stub for `loadPatches`:

```typescript
loadPatches: async (_campaignId) => [],
```

### 6. Registry (`apps/api/src/features/content/content-types.ts`)

Add one entry:

```typescript
'<kebab-plural>': <type>ContentConfig,
```

### 7. Route + controller

In `content.routes.ts`:

```typescript
contentRouter.get(
  '/<kebab-plural>',
  requireAuth,
  requireCampaignRole(...CAMPAIGN_ROLES),
  controller.list < TypeName > s,
)
```

In `content.controller.ts`:

```typescript
export async function list<TypeName>s(req: Request, res: Response): Promise<void> {
  const { campaignId } = req.params as { campaignId: string }
  const config = getContentTypeConfig('<kebab-plural>')
  const <camelPlural> = await resolveCatalogForCampaign(config, campaignId)
  res.status(200).json({ <camelPlural> })
}
```

Note: The JSON key in the response must match what the dashboard API client destructures.

### 8. Dashboard API client (`apps/dashboard/src/features/content/<camelPlural>/api/<kebab-plural>-api.ts`)

```typescript
import type { <TypeName> } from '@rpg/contracts'
import { request } from '@/lib/api-client'

export async function list<TypeName>s(campaignId: string): Promise<<TypeName>[]> {
  const { <camelPlural> } = await request<{ <camelPlural>: <TypeName>[] }>(
    `/api/campaigns/${campaignId}/content/<kebab-plural>`,
    undefined,
    'Could not load <display name>.',
  )
  return <camelPlural>
}
```

### 9. TanStack Query hook (`hooks/use-<kebab-plural>.ts`)

```typescript
import { useQuery } from '@tanstack/react-query'
import { list<TypeName>s } from '../api/<kebab-plural>-api'

export const <camelPlural>QueryKey = (campaignId: string) =>
  ['campaigns', campaignId, 'content', '<kebab-plural>'] as const

export function use<TypeName>s(campaignId: string | undefined) {
  return useQuery({
    queryKey: campaignId ? <camelPlural>QueryKey(campaignId) : [],
    queryFn: () => list<TypeName>s(campaignId!),
    enabled: Boolean(campaignId),
  })
}
```

### 10. Column/filter definitions (`components/<kebab-plural>-columns.tsx`)

```typescript
import { buildContentColumns, buildContentFilters } from '../../lib/content-table-config'
import { ROUTES } from '@/app/routes'

const TYPE_MIDDLE_COLUMNS: ColumnDef<<TypeName>>[] = [ /* type-specific columns */ ]
const TYPE_SPECIFIC_FILTERS: FilterDef[] = [ /* type-specific filters */ ]

export function <camelPlural>Columns(campaignId: string) {
  return buildContentColumns<<TypeName>>(TYPE_MIDDLE_COLUMNS, {
    nameHref: (row) => ROUTES.content.<camelPlural>.detail(campaignId, row.id),
  })
}
export const <camelPlural>Filters = buildContentFilters(TYPE_SPECIFIC_FILTERS)
```

Add co-located `*.stories.tsx` (CSF3, `title: 'Content/<TypeName>s/<TypeName>sColumns'`).

### 11. Overview route (`routes/<kebab-plural>-overview.tsx`)

Follow the `ClassesOverview` pattern:

- Destructure `campaignId` from `useParams`.
- Render a loading/error state before the table.
- Use `<DataTable>` with `columns`, `filters`, `rowActions`, `caption`.

### 12. Detail route (`routes/<kebab-singular>-detail.tsx`)

Follow the `ClassDetail` pattern:

- Load the full list query (no per-id endpoint — find client-side with `findById`).
- Inner component calls `useSetBreadcrumbLabel(item.name)` for dynamic breadcrumb.
- Use `ContentDetailLayout` + `ContentStatRow` for standard two-column layout.
- Edit link targets `ROUTES.content.<camelPlural>.edit(campaignId, itemId)`.

Add co-located `*.stories.tsx` (CSF3, `title: 'Content/<TypeName>Detail'`).

### 13. Sub-area barrel (`index.ts`)

```typescript
export { <TypeName>sOverview } from './routes/<kebab-plural>-overview'
export { <TypeName>Detail } from './routes/<kebab-singular>-detail'
export { use<TypeName>s, <camelPlural>QueryKey } from './hooks/use-<kebab-plural>'
```

### 14. Content feature barrel (`apps/dashboard/src/features/content/index.ts`)

```typescript
export { <TypeName>sOverview, <TypeName>Detail, use<TypeName>s, <camelPlural>QueryKey } from './<camelPlural>'
```

### 15. Route constants (`apps/dashboard/src/app/routes.ts`)

```typescript
content: {
  // ...existing types
  <camelPlural>: {
    overview: (campaignId: string) => `/campaigns/${campaignId}/<kebab-plural>`,
    detail: (campaignId: string, itemId: string) => `/campaigns/${campaignId}/<kebab-plural>/${itemId}`,
    edit: (campaignId: string, itemId: string) => `/campaigns/${campaignId}/<kebab-plural>/${itemId}/edit`,
    create: (campaignId: string) => `/campaigns/${campaignId}/<kebab-plural>/new`,
  },
}
```

Note: URL segments use kebab-case plural (`skill-proficiencies`); the dashboard folder uses camelCase (`skillProficiencies`).

### 16. React Router (`apps/dashboard/src/app/router.tsx`)

Import the two route components from `@/features/content`, then add under `campaigns/:campaignId`:

```typescript
{
  path: '<kebab-plural>',
  element: <Outlet />,
  handle: {
    crumb: (params) => ({
      label: '<Display Plural>',
      href: ROUTES.content.<camelPlural>.overview(params.campaignId!),
    }),
  } satisfies CrumbHandle,
  children: [
    { index: true, element: <<TypeName>sOverview /> },
    {
      path: ':<singularId>',
      element: <<TypeName>Detail />,
      handle: {
        crumb: (_params, { entityLabel }) => ({ label: entityLabel ?? '…' }),
      } satisfies CrumbHandle,
    },
  ],
},
```

### 17. Sidebar nav (`apps/dashboard/src/components/layout/sidebar/campaign-nav-section.tsx`)

```typescript
<NavItem to={ROUTES.content.<camelPlural>.overview(activeCampaignId)} label="<Display Plural>" />
```

---

## Naming conventions

| Concept           | Convention                                       | Example                              |
| ----------------- | ------------------------------------------------ | ------------------------------------ |
| Dashboard folder  | camelCase plural                                 | `skillProficiencies/`                |
| URL segment       | kebab-case plural                                | `/skill-proficiencies`               |
| API route key     | kebab-case plural                                | `'skill-proficiencies'`              |
| JSON response key | camelCase plural                                 | `{ skillProficiencies: [...] }`      |
| Query key         | `['campaigns', id, 'content', '<kebab-plural>']` |                                      |
| Contract type     | PascalCase, avoid reserved words                 | `CharacterClass`, `SkillProficiency` |
| Seed file         | `<kebab-plural>.json`                            | `skill-proficiencies.json`           |

---

## Design decisions to make for each new type

| Decision                         | Guidance                                                                                                                                                                                                                   |
| -------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Mongoose models now or stub?** | Stub (`return []`) if no homebrew/patch UX exists yet. Models take ~1 hour to add later.                                                                                                                                   |
| **`imageKey`?**                  | Optional on `contentBodyBaseSchema` — include if the type has artwork; omit from seed if not applicable.                                                                                                                   |
| **Nested resources?**            | Use a separate schema + `GET /<parent>/:id/<child>` if the child is too large to embed (e.g. subclasses). Otherwise embed.                                                                                                 |
| **Write endpoints?**             | Defer. Add `create*InputSchema` / `update*InputSchema` / `*PatchSchema` to contracts now (they cost nothing), wire API endpoints when authoring UX is built.                                                               |
| **Per-id GET?**                  | Not needed — detail pages resolve client-side from the full list query. Add only if list size makes this impractical.                                                                                                      |
| **Dual-ownership fields?**       | If another type references this type's entities (e.g. `suggestedClasses` on skills), keep the authoritative list on the owning type and add the reverse as an optional convenience field. Document which is authoritative. |
