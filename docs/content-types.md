# Adding a New Content Type

This guide covers the end-to-end steps for adding a fully wired catalog content type to RPG World Builder. The pattern is contracts-first: the Zod schema is the single source of truth, and every layer derives from it.

**Reference implementations**: `classes` (full Mongoose homebrew/patch support), `skillProficiencies` (patch support via shared factory, homebrew deferred), and `species` (embedded heritage choices for lineages/ancestries, structured `grants` bag on traits).

---

## When to add a new content type

Add a new content type when the domain entity:

- Is a catalogued, reusable reference entity (not a campaign-specific record).
- Has its own overview page (list) and detail page in the dashboard.
- Can be customized per-campaign via patches or homebrew (even if that isn't built yet).

If the entity is always embedded inside another (e.g. class features, spell components), model it as a nested schema on the parent type instead.

When sub-choices are small, fixed sets owned by one catalog record (lineages, ancestries), embed them as optional **heritage** on the parent body rather than a separate content type. See `content/species.ts` — `{ id, name, description?, options }` where `name` carries lineage/ancestry wording (e.g. "Draconic Ancestry", "Elven Lineage") and `options` are `contentTraitSchema` rows with optional `grants`.

---

## Content traits (`custom` vs `grant`)

Species traits and heritage options share `contentTraitSchema` — a discriminated union on `kind`:

| Kind     | Stored fields                                                        | Rendering                                                      |
| -------- | -------------------------------------------------------------------- | -------------------------------------------------------------- |
| `custom` | `name`, optional `description`, optional `grants`                    | Use stored prose; grants supplement mechanics                  |
| `grant`  | `grants` (required), optional `nameOverride` / `descriptionOverride` | Derive display via `resolveTraitDisplay()` in `@rpg/contracts` |

**Class and subclass features are always `custom`** (`classFeatureSchema` extends the custom variant + `level`). Progression UI requires a stored feature name.

Grant-only traits must pass `isGrantEligibleGrants()` — phase 1 allows a single atomic grant: one sense, one resistance, walk speed override, or one language. Hybrids (Drow: senses + innate spells), named heritage options (Dragonborn ancestry), and supplemental rules stay `custom`.

- **Render** trait lists with `resolveTraitDisplay(trait)` (name + description HTML).
- **Aggregate** mechanics (e.g. species stat-row senses) with `getTraitGrants(trait)` — read raw grants, not derived prose.
- **Vocab** (`SENSE_ENTRIES`, `DAMAGE_TYPE_ENTRIES`, etc.) holds reference definitions; grant traits omit redundant catalog copy when SRD player-facing wording is derivable.

Legacy records without `kind` normalize to `custom` on parse (`normalizeContentTrait`).

### `grants.featChoice` (feat picks)

Class features, subclass features, and species traits that grant a feat choice store
`grants.featChoice` on the **source** record (Fighting Style, Epic Boon, Human Versatile).
The character builder filters feats by `category`; granted feats do not need a matching
`prerequisite` on the feat record.

| Field                | Meaning                                                                     |
| -------------------- | --------------------------------------------------------------------------- |
| `category`           | Feat category pool (`origin`, `general`, `fighting-style`, `epic-boon`)     |
| `choose`             | Number of feats the player picks (default 1)                                |
| `allowAnyQualifying` | Epic Boon only: epic-boon feats **or** any feat the character qualifies for |
| `replaceable`        | Fighter Fighting Style: may replace on later class levels                   |

Example (Fighter Fighting Style):

```json
"grants": {
  "featChoice": { "category": "fighting-style", "choose": 1, "replaceable": true }
}
```

Paladin/Ranger Blessed Warrior and Druidic Warrior alternatives stay in feature
`description` prose — they are not feat grants.

---

## Requirement expressions

Composable eligibility trees (`RequirementExpression` in
`packages/contracts/src/content/requirement-expression.ts`) model prerequisites
and similar rules as explicit **AND** / **OR** structure. Feats are the first
consumer; the same module will back invocations, multiclass rules, and the
character builder.

| Node                                           | Meaning                                       |
| ---------------------------------------------- | --------------------------------------------- |
| `{ kind: "all", requirements: [...] }`         | **AND** — every child must be satisfied       |
| `{ kind: "any", requirements: [...] }`         | **OR** — at least one child must be satisfied |
| `{ kind: "minLevel", level: N }`               | Character level ≥ N                           |
| `{ kind: "abilityMinimum", ability, minimum }` | Ability score ≥ minimum                       |
| `{ kind: "classLevel", classSlug, minimum? }`  | ≥ `minimum` levels in class (default 1)       |
| `{ kind: "feature", featureId }`               | Has a class feature with this nested id       |
| `{ kind: "spellcasting" }`                     | Has an active spellcasting block              |

Rules:

- A **single leaf** is valid at the root (no forced `all` wrapper).
- Compositors require at least one child.
- Nesting is unlimited (recursive Zod schema via `z.lazy()`).
- Display prose comes from `formatRequirementExpression()` in `@rpg/contracts`
  — do not duplicate prerequisite strings on catalog records.

**Example (Grappler):** `Level 4+` AND (`Strength 13+` OR `Dexterity 13+`):

```json
{
  "kind": "all",
  "requirements": [
    { "kind": "minLevel", "level": 4 },
    {
      "kind": "any",
      "requirements": [
        { "kind": "abilityMinimum", "ability": "str", "minimum": 13 },
        { "kind": "abilityMinimum", "ability": "dex", "minimum": 13 }
      ]
    }
  ]
}
```

### Prerequisite editor (v1)

Dashboard feat authoring uses a **sentence-builder** editor instead of a fixed
pattern picker. A live preview at the top summarizes requirements in player-facing
prose; below it, **condition sets** (internally `groups`) hold horizontal
**condition** rows (internally `requirements`) with visible AND/OR connector chips.
Shared serialization lives in
`apps/dashboard/src/features/content/lib/requirement-editor-form.ts`; the UI is
`RequirementEditor` in
`apps/dashboard/src/features/content/components/requirement-editor.client.tsx`,
wired into `feat-form-def.ts` via a `kind: 'slot'` form field.

**User-facing terminology:**

| UI label       | Internal form field | Notes                                   |
| -------------- | ------------------- | --------------------------------------- |
| Condition set  | `groups[]`          | Bordered card; sibling sets combine AND |
| Condition      | `requirements[]`    | Sentence row per leaf type              |
| Match rule     | `kind`              | Radio: all required vs any one          |
| AND / OR chips | —                   | Decorative; derived from set `kind`     |

**UI constraints (v1):**

| Rule                                                  | Rationale                                        |
| ----------------------------------------------------- | ------------------------------------------------ |
| Top-level sibling condition sets combine with **AND** | Matches SRD feats; no top-level OR toggle yet    |
| Sets contain **leaves only** (no nested groups)       | Grappler's OR block is a sibling set, not nested |
| Three leaf types in the editor                        | `minLevel`, `abilityMinimum`, `spellcasting`     |
| Canonical serialization on save                       | Stable storage + live preview                    |
| Sentence rows are presentation-only                   | Normalization table below unchanged on save      |

**Normalization (editor → stored tree):**

| Editor state                     | Stored `RequirementExpression`                     |
| -------------------------------- | -------------------------------------------------- |
| Empty / no condition sets        | `prerequisite: undefined`                          |
| One all-match set, one condition | Bare leaf at root                                  |
| One all-match set, 2+ conditions | `{ kind: "all", requirements: [...] }`             |
| One any-match set                | `{ kind: "any", requirements: [...] }`             |
| Multiple top-level sets          | `{ kind: "all", requirements: [set1, set2, ...] }` |

Inverse mapping (`requirementExpressionToEditor`): each root `all` child becomes
either condition rows in an all-match set or an any-match set (when the child is
`any`). A single root leaf becomes one all-match set with one row.

**Leaf capability matrix:**

| Leaf             | Schema | `formatRequirementExpression` | Form editor | Evaluator |
| ---------------- | ------ | ----------------------------- | ----------- | --------- |
| `minLevel`       | yes    | yes                           | yes         | —         |
| `abilityMinimum` | yes    | yes                           | yes         | —         |
| `spellcasting`   | yes    | yes                           | yes         | —         |
| `feature`        | yes    | yes                           | no          | —         |
| `classLevel`     | yes    | yes                           | —           | —         |

The `feature` leaf remains in the schema for legacy/homebrew data and possible future
invocation or multiclass rules, but is **not** authored in the prerequisite editor.
Feat eligibility tied to class features (e.g. Fighting Style feats) is modeled via
`grants.featChoice` on the granting feature instead.

Display prose uses `formatRequirementExpression()`; the hero preview prefixes
`Requires` via `formatRequirementEditorPreview()` and updates live as conditions
change (`aria-live="polite"`). Character-builder evaluation
(`evaluateRequirementExpression()`) is a separate future slice.

See Storybook **Content/RequirementEditor → Grappler** for the canonical
sentence-builder layout example.

To reuse the editor on another content type: import the shared form module,
add `prerequisiteEditor: prerequisiteEditorSchema` to the form schema, slot in
`<RequirementEditor name="prerequisiteEditor" />`, and map
`toFormValues` / `toInput` through `requirementExpressionToEditor` /
`requirementEditorToExpression`.

---

## Content key mutability

Catalog records carry three distinct identifier layers. Authors edit **display names** only; keys are derived on create and locked afterward (no slug/id fields in dashboard forms).

| Layer               | Example                                 | Assigned                               | Mutable after create?                 |
| ------------------- | --------------------------------------- | -------------------------------------- | ------------------------------------- |
| Envelope **`id`**   | `srd-cc-5.2.1:fighter` or Mongo `_id`   | System seed / Mongo                    | **Never** — opaque FK for references  |
| Envelope **`slug`** | `fighter`, `wood-elf`                   | `deriveContentKey(name)` on first POST | **No** — homebrew and system patches  |
| Nested **`id`**     | `rage`, `darkvision` on traits/features | Same helper, scoped to parent          | **No** — rename display `name` freely |

Shared helpers: `packages/contracts/src/content/content-key.ts` (`deriveContentKey`, `assignStableContentIds`, `assertStableContentIds`). Dashboard forms use `apps/dashboard/src/features/content/lib/content-form-key-helpers.ts`; the API normalizes writes in `apps/api/src/features/content/lib/apply-content-keys.ts` before Zod validation.

**Today:** “publish” means the first successful homebrew **POST**. There is no draft workflow yet; records created under this rule remain locked.

### Known gaps (revisit later)

- **Cross-catalog slug references** — Some fields still store class **slugs**, not opaque ids (e.g. `spell.classIds`, `skillProficiency.suggestedClasses`). Locking a target’s slug does not break these while the slug stays unchanged; deleting and re-creating content under a new slug **will** break slug-based refs. No cascade migration exists.
- **Character model** — Not built yet. When added, characters should reference catalog records by envelope **`id`**, not slug or nested trait id, unless tracking per-feature state requires `(classId, featureId)`.
- **Delete + re-add** — Removing a nested trait/feature and adding a “new” row with the same display name gets a fresh derived id. Any future character state keyed by nested ids would not carry over.
- **Draft → publish** — A future draft state may defer slug assignment until publish. Existing homebrew created today is already published/locked; migration should not be required.
- **Sibling uniqueness errors** — Duplicate derived slugs within a campaign surface as API `409 slug_conflict`. Nested id collisions within a parent are deduped (`darkvision-2`); friendly form validation is not yet surfaced.
- **Manual slug override** — Intentionally unsupported. Re-enabling would need an explicit admin/rename flow with reference counts, not silent PATCH.

---

## Layer overview

```
packages/contracts/src/content/<type>.ts   ← Zod schemas, TypeScript types, DTOs
packages/contracts/src/vocab/            ← closed-set reference terms (when needed)
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
  app/routes.ts                    ← ROUTES constant (content paths in content-routes.ts)
  app/router.tsx                   ← React Router wiring
  components/layout/sidebar/campaign-nav-section.tsx  ← Sidebar NavItem
```

---

## Step-by-step checklist

### 1. Contracts (`packages/contracts/src/content/`)

Create `<type>.ts` under `content/` following this pattern:

```typescript
import { z } from 'zod'
import {
  contentBodyBaseSchema,
  contentMetaSchema,
  contentPatchBaseSchema,
  slugSchema,
} from './envelope'

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
- `description` stores sanitized HTML; render catalog copy with `RichTextContent`.
- Avoid `z.enum` for open lists (items, feature names). Use `z.string()` unless the engine branches on the value.
- Name the stored type to avoid reserved words or collisions (e.g. `CharacterClass` not `Class`).

Re-export from `packages/contracts/src/content/index.ts` (the root barrel
re-exports the content layer automatically):

```typescript
export * from './<type>'
```

Add a co-located `<type>.test.ts` covering:

- A well-formed system record parses correctly.
- A homebrew record (with `campaignId`) parses correctly.
- Required fields are validated.
- Optional fields can be omitted.
- `create*InputSchema` requires a slug in the contract DTO (the API derives it from `name` on POST; dashboard forms do not author slug).
- `update*InputSchema` allows partial updates; slug is omitted on PATCH (immutable after create).
- `*PatchSchema` requires `campaignId` and `targetId`.

If the type has a **closed set of ids** used as enums (weapon properties, armor
categories, skill slugs, etc.), add reference vocabulary under
`packages/contracts/src/vocab/` and derive the Zod enum from the map keys. Import
the schema into your content module — do not define vocab maps on the entity
file. See [packages/contracts/docs/structure.md](../packages/contracts/docs/structure.md).

#### Reference vocabulary (`GameTermEntry`)

Use this when a closed id set needs both a display label and SRD rule text
(tooltips, detail pages, form help). Shared shape in `vocab/types.ts`; modules
live under `packages/contracts/src/vocab/` (nested folders OK, e.g.
`vocab/weapon/property.ts`):

```typescript
export type GameTermEntry = {
  readonly label: string
  readonly description: string
}
```

Pattern (see `SENSE_ENTRIES`, `ALIGNMENT_ENTRIES`, `CREATURE_SIZE_ENTRIES`,
`CREATURE_TYPE_ENTRIES`, `DAMAGE_TYPE_ENTRIES`, `WEAPON_PROPERTY_ENTRIES`,
`WEAPON_MASTERY_ENTRIES`, and `ARMOR_CATEGORY_ENTRIES` in `vocab/sense.ts`,
`vocab/alignment.ts`, `vocab/creature-size.ts`, `vocab/creature-type.ts`,
`vocab/damage-type.ts`, `vocab/weapon/property.ts`, `vocab/weapon/mastery.ts`,
and `vocab/armor/category.ts`):

```typescript
import type { GameTermEntry } from '../vocab/types' // adjust relative path from content/

export const THING_ENTRIES = {
  'slug-a': {
    label: 'Display A',
    description: 'SRD rule text for this term…',
  },
  // ...
} as const satisfies Record<string, GameTermEntry>

export type ThingId = keyof typeof THING_ENTRIES
export const THING_IDS = Object.keys(THING_ENTRIES) as [ThingId, ...ThingId[]]
export const thingIdSchema = z.enum(THING_IDS)

export function getThingEntry(id: string): GameTermEntry | undefined {
  return THING_ENTRIES[id as ThingId]
}

export function getThingLabel(id: string): string {
  return getThingEntry(id)?.label ?? id
}
```

Rules:

- **Keys** drive validation (`z.enum`); never maintain a parallel string-literal
  array that can drift from the map.
- **Descriptions** are reference vocabulary, not fields on catalog records. Per-item
  prose that varies (e.g. a weapon's `specialRules` for the `special` property)
  stays on the entity schema.
- Add a co-located test asserting every enum member has a non-empty `label` and
  `description`, and that `Object.keys(ENTRIES)` matches the derived id tuple.

#### Display names only (`NAME_MAP`)

When you only need id → label (no SRD text yet), a flat map is still fine:

```typescript
export const THING_NAMES = { 'slug-a': 'Display A', ... } as const
export type ThingSlug = keyof typeof THING_NAMES

export function getThingName(id: string): string {
  return THING_NAMES[id as ThingSlug] ?? id
}
```

See `SKILLS`/`getSkillName` in `content/skill-proficiency.ts` and
`CLASS_NAMES`/`getClassName` in `content/class/class.ts`. Prefer `*_ENTRIES`
when rule text is available or likely soon.

#### Discriminated-union content types (variant pattern)

Most content types are a single object shape and use the one-liner DTOs above
(`<body>.extend({ slug })`, `.partial()`). Some types instead cover several
sub-kinds whose fields genuinely differ (only a few fields are universal). Model
those as a Zod **discriminated union** on a `kind` field — one content type, one
registry entry, scales by adding a union variant instead of a new content type.
`content/equipment.ts` (gear, ammunition, focus, tool, mount, vehicle, ship, misc) is
the reference implementation.

Rules specific to union-shaped types:

- Define one body schema per `kind` from a shared base
  (`<base>.extend({ kind: z.literal('<kind>'), ...fields })`); put only that
  kind's real fields on each variant.
- The four derived schemas (`<type>Schema`, `create*`, `update*`, `*Patch`) must
  be written as **explicit array literals** of the variants — do NOT build them
  by `.map()`-ing a transform over a variant tuple. Mapping collapses the
  variants through `.extend`/`.partial` and loses per-kind narrowing.
- `z.discriminatedUnion` (Zod v4) takes `(discriminator, [variantA, variantB, ...])`
  and requires a non-empty tuple of object schemas, each carrying the literal
  discriminator.
- Stored shape: union of `contentMetaSchema.extend(<variant>.shape)`.
- `create*`: union of `<variant>.extend({ slug: slugSchema })`.
- `update*` / `*Patch` bodies: union of `<variant>.partial().extend({ kind: <variant>.shape.kind })`
  — `.partial()` makes everything optional, so re-pin `kind` (the discriminant)
  as required. `create`-derived updates omit `slug` (immutable after create); system patch bodies also omit `slug`.
- Keep a `KIND_ENTRIES` map (the `GameTermEntry` pattern) or `KIND_LABELS` map +
  `getXKindLabel(kind)` helper for kind display names and filter options.

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

| Decision                         | Guidance                                                                                                                                                                                                                          |
| -------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Mongoose models now or stub?** | Stub (`return []`) if no homebrew/patch UX exists yet. Models take ~1 hour to add later.                                                                                                                                          |
| **`imageKey`?**                  | Optional on `contentBodyBaseSchema` — include if the type has artwork; omit from seed if not applicable.                                                                                                                          |
| **Nested resources?**            | Use a separate schema + `GET /<parent>/:id/<child>` if the child is too large to embed (e.g. subclasses). Otherwise embed — e.g. `species` lineages/ancestries as optional `heritage` on the species body (`content/species.ts`). |
| **Write endpoints?**             | Defer. Add `create*InputSchema` / `update*InputSchema` / `*PatchSchema` to contracts now (they cost nothing), wire API endpoints when authoring UX is built.                                                                      |
| **Per-id GET?**                  | Not needed — detail pages resolve client-side from the full list query. Add only if list size makes this impractical.                                                                                                             |
| **Dual-ownership fields?**       | If another type references this type's entities, keep the authoritative list on the owning type. Derive reverse views at read time when possible (see [Skill ↔ class association](#skill-class-association)).                     |

---

## Class spellcasting (reference)

The `classes` type embeds an optional `spellcasting` block (`content/class/spellcasting.ts`). Spell slot columns on the read-only progression table are derived from `SLOT_TABLES` by progression (`full` / `half` / `pact`); they are not stored on the class record.

### Unlock level and feature label

| Field         | Role                                                                                                                                 |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `level`       | First class level at which spellcasting is active (defaults to **1**). Gates slot/cantrip columns and character-builder eligibility. |
| `description` | Optional rich-text HTML for SRD spellcasting rules prose (formerly duplicated on a `spellcasting` feature row).                      |

The progression table injects **Spellcasting** (or **Pact Magic** for `progression: pact`) at `spellcasting.level` — do not duplicate those rows in `features[]`.

### Preparation modes

`preparation` is a closed enum (`SPELL_PREPARATION_MODES`):

| Mode              | Meaning                                     | Spells-available column            |
| ----------------- | ------------------------------------------- | ---------------------------------- |
| `prepared`        | Caster prepares a subset each day           | Shown — header **Spells Prepared** |
| `known`           | Caster knows a fixed spell list             | Shown — header **Spells Known**    |
| `always_prepared` | Domain/oath/etc. spells are always prepared | Hidden                             |

### Progression tables (contract storage)

Both optional tables use **sparse fill-forward** storage: an array of `{ level, value }` rows where each row applies from that character level onward until superseded.

| Field             | Entry shape        | Value field                                                                  |
| ----------------- | ------------------ | ---------------------------------------------------------------------------- |
| `cantrips`        | `{ level, known }` | Cantrips known at that level                                                 |
| `spellsAvailable` | `{ level, count }` | Spells prepared or known (renamed from legacy `spellsPrepared` / `prepared`) |

Authoring expands sparse rows to a dense level 1–20 grid for editing, then compresses on save (emit only when a level's value changes from the prior emitted value). Helpers live in `apps/dashboard/.../classes/lib/progression-table-helpers.ts`.

### Dashboard authoring UI

The class form (`class-form-def.ts`) binds a form-only composite `spellcasting.progressionTable` to the schema-driven `editableGrid` field type (`@rpg/ui/form`). Columns:

- **Cantrips known** — select (blank or 1–6); optional **Load template** presets from `cantrips-profiles.ts` (`CANTRIPS_KNOWN_PROFILES`, seed-only, not in the contract).
- **Spells available** — number input; visible when `preparation` is `prepared` or `known`; dynamic column label.

See [packages/ui/docs/forms.md](../packages/ui/docs/forms.md) for the `editableGrid` field config shape.

### Read-only detail view

`ClassProgressionTable` on the class detail page fill-forwards `cantrips` and `spellsAvailable`, shows resource columns from `resources[]`, and spell-slot columns via `formatSpellLevel` from `@rpg/contracts`. Stories: `Content/Classes/ClassProgressionTable`.

---

## Skill ↔ class association

The class↔skill proficiency edge is **single-writer** on the skill record:

| Field                             | Location                 | Role                                                                                                                                                                                            |
| --------------------------------- | ------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **`suggestedClasses`**            | `skill-proficiency` body | **Authoritative** — class slugs that suggest this skill for starting proficiency selection (required on create).                                                                                |
| **`proficiencies.skills.choose`** | `class` stored body      | How many skills the player picks at class creation (persisted).                                                                                                                                 |
| **`proficiencies.skills.from`**   | `class` read model only  | **Derived** at API/catalog read time via `skillSlugsSuggestingClass()` in `@rpg/contracts` (`content/skill-class-association.ts`). Not stored in seed JSON, Mongo homebrew, or overlay patches. |

### Write paths

- **Skill form** — edits `suggestedClasses` directly (chips over campaign classes).
- **Class form** — skill option chips bind to derived `from` in form state; on save the dashboard sends a transient `from` array for API fan-out only. The API strips `from` before persistence and runs `syncSuggestedClassesFromClass()` to patch affected skill records.

### Read paths

- **Skill detail** — **Suggested classes** (links from `suggestedClasses`).
- **Class detail** — **Suggested proficiencies** (derived from skills; `Choose N:` from `skills.choose`).
- **`GET …/content/classes`** — merges stored classes with derived `skills.from` per campaign skills list.

Helpers: `skillSlugsSuggestingClass`, `diffClassSkillEdges`, `deriveClassesSkillFrom`, `stripClassSkillFromFromInput`.

### Known gaps (revisit later)

- **`suggestedClasses` uses class slugs**, not opaque class ids — same cross-catalog slug-ref risk as `spell.classIds` (see [Known gaps](#known-gaps-revisit-later)).
- **Character-builder gating** will read `suggestedClasses`; not built yet.
- **DM “allow any skill” override** — deferred.

---
