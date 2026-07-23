# Adding a New Content Type

This guide covers the end-to-end steps for adding a fully wired catalog content type to RPG World Builder. The pattern is contracts-first: the Zod schema is the single source of truth, and every layer derives from it.

**Reference implementations**: `classes` (full Mongoose homebrew/patch support), `skill-proficiencies` (patch support via shared factory, homebrew deferred), and `species` (embedded heritage choices for lineages/ancestries, atomic `grantGroups` on traits).

---

## When to add a new content type

Add a new content type when the domain entity:

- Is a catalogued, reusable reference entity (not a campaign-specific record).
- Has its own overview page (list) and detail page in the dashboard.
- Can be customized per-campaign via patches or homebrew (even if that isn't built yet).

If the entity is always embedded inside another (e.g. class features, spell components), model it as a nested schema on the parent type instead.

When sub-choices are small, fixed sets owned by one catalog record (lineages, ancestries), embed them as optional **heritage** on the parent body rather than a separate content type. See `content/species.ts` — `{ id, name, description?, options }` where `name` carries lineage/ancestry wording (e.g. "Draconic Ancestry", "Elven Lineage") and `options` are `contentTraitSchema` rows with optional `grantGroups`.

**Not a content type:** starting wealth (higher-level character creation tier tables) lives in `rpg/campaign/rules/starting-wealth.ts` and is patched via `CampaignRulesetPatch.characterCreation.startingWealth` — not the content API registry. SRD defaults ship from `@rpg/catalog/starting-wealth`.

---

## Content traits (`custom` vs `grant`)

Species traits and heritage options share `contentTraitSchema` — a discriminated union on `kind`:

| Kind     | Stored fields                                                             | Rendering                                                      |
| -------- | ------------------------------------------------------------------------- | -------------------------------------------------------------- |
| `custom` | `name`, optional `description`, optional `grantGroups`                    | Use stored prose; grant groups supplement mechanics            |
| `grant`  | `grantGroups` (required), optional `nameOverride` / `descriptionOverride` | Derive display via `resolveTraitDisplay()` in `@rpg/contracts` |

**Class and subclass features are always `custom`** (`classFeatureSchema` extends the custom variant + `level`). Progression UI requires a stored feature name.

**Subclass choice milestones** are modeled as explicit class features (`{classSlug}-subclass`,
named `<Class> Subclass`). The feature level is the source of truth for when subclass authoring
and default subclass feature levels unlock; there is no top-level `subclassChoiceLevel` field on
the class body.

Grant-only traits must pass `isGrantGroupsEligible()` — exactly one default group containing exactly one sense, resistance, walk speed override, or language grant. Hybrids (Drow: senses + spells), named heritage options (Dragonborn ancestry), and supplemental rules stay `custom`.

- **Render** trait lists with `resolveTraitDisplay(trait)` (name + description HTML).
- **Aggregate** mechanics (e.g. species stat-row senses) with `flattenGrantGroups(resolveGrantGroupsFromContent(trait))` — read atomic grants, not derived prose.
- **Vocab** (`SENSE_ENTRIES`, `DAMAGE_TYPE_ENTRIES`, etc.) holds reference definitions; grant traits omit redundant catalog copy when SRD player-facing wording is derivable.

Legacy records without `kind` normalize to `custom` on parse (`normalizeContentTrait`).

### `featChoice` atomic grants

Class features, subclass features, and species traits that grant a feat choice store a
`{ kind: "featChoice", ... }` grant inside `grantGroups` on the **source** record
(Fighting Style, Epic Boon, Human Versatile, Ability Score Improvement milestones).
The character builder filters feats by `category`; granted feats do not need a matching
`prerequisite` on the feat record.

| Field                | Meaning                                                                 |
| -------------------- | ----------------------------------------------------------------------- |
| `category`           | Feat category pool (`origin`, `general`, `fighting-style`, `epic-boon`) |
| `choose`             | Number of feats the player picks (default 1)                            |
| `allowAnyQualifying` | Epic Boon or ASI (`general`): category feats **or** any qualifying feat |
| `replaceable`        | Fighter Fighting Style: may replace on later class levels               |
| `recommendedFeatIds` | Feat slugs surfaced as recommendations (not duplicated in HTML prose)   |

**Ability Score Improvements** are modeled as class features (`ability-score-improvement-{level}`)
with a `featChoice` grant (`category: general`, `allowAnyQualifying: true`,
`recommendedFeatIds: ["ability-score-improvement"]`). The class editor keeps an ASI level
picker for convenience; on save it generates/replaces those feature rows — there is no
top-level `asiLevels` field on the class body.

Example (Fighter Fighting Style):

```json
"grantGroups": [
  {
    "grants": [
      {
        "kind": "featChoice",
        "category": "fighting-style",
        "choose": 1,
        "replaceable": true,
        "recommendedFeatIds": ["defense"]
      }
    ]
  }
]
```

Example (ASI at level 4):

```json
{
  "id": "ability-score-improvement-4",
  "name": "Ability Score Improvement",
  "level": 4,
  "grantGroups": [
    {
      "grants": [
        {
          "kind": "featChoice",
          "category": "general",
          "choose": 1,
          "allowAnyQualifying": true,
          "recommendedFeatIds": ["ability-score-improvement"]
        }
      ]
    }
  ]
}
```

Paladin/Ranger Blessed Warrior and Druidic Warrior alternatives stay in feature
`description` prose — they are not feat grants.

---

## Requirement expressions

Composable eligibility trees (`RequirementExpression` in
`packages/contracts/src/rpg/content/lib/requirement-expression.ts`) model prerequisites
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
`apps/dashboard/src/features/content/feats/lib/requirement-editor-form.ts`; the UI is
`RequirementEditor` in
`apps/dashboard/src/features/content/feats/components/requirement-editor.client.tsx`,
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

Shared helpers: `packages/contracts/src/rpg/content/lib/content-key.ts` (`deriveContentKey`, `assignStableContentIds`, `assertStableContentIds`). Dashboard forms use `apps/dashboard/src/features/content/lib/forms/content-form-key-helpers.ts`; the API normalizes writes in `apps/api/src/features/content/lib/apply-content-keys.ts` before Zod validation.

**Today:** homebrew records carry `status: 'draft' | 'published'` on the content envelope. Campaign managers (`owner`/`co-owner`) create with **Save draft** or **Publish**, promote drafts from the edit shell, and demote published homebrew when no active characters reference it. Non-managers receive only published records from list endpoints; slug assignment still happens on first POST (draft included).

**Validation intent:** authoring uses a wire-level `ContentValidationIntent` (`draft` | `publish`) that is distinct from persisted `ContentStatus`. Save Draft and edit-save on draft entities validate against relaxed `*Draft*` schema families in `@rpg/contracts`; Publish, edit-save on published entities, and promote re-validate against the publish-complete schemas. Types without registered draft schemas fall back to today's publish schemas for both intents until their phase lands. Shared helpers live in `packages/contracts/src/rpg/content/lib/content-validation-intent.ts`, `draft-authored-content.ts`, and `content-input-schemas.ts`; the API selects input/stored schemas via `resolveWriteInputSchema` / `resolveStoredSchema` in `content-write-config.ts`.

### Known gaps (revisit later)

- **Cross-catalog slug references** — Some fields still store class **slugs**, not opaque ids (e.g. `spell.classIds`, skill slugs in `characterCreation.proficiencies.skills.choices[].from`). Locking a target’s slug does not break these while the slug stays unchanged; deleting and re-creating content under a new slug **will** break slug-based refs. No cascade migration exists.
- **Character model** — Not built yet. When added, characters should reference catalog records by envelope **`id`**, not slug or nested trait id, unless tracking per-feature state requires `(classId, featureId)`.
- **Delete + re-add** — Removing a nested trait/feature and adding a “new” row with the same display name gets a fresh derived id. Any future character state keyed by nested ids would not carry over.
- **Subclass lifecycle** — Subclasses inherit the envelope field structurally but promote/demote, draft list filtering, and lifecycle UI are deferred until the nested class editor save flow stabilizes.
- **Sibling uniqueness errors** — Duplicate derived slugs within a campaign surface as API `409 slug_conflict`. Nested id collisions within a parent are deduped (`darkvision-2`); friendly form validation is not yet surfaced.
- **Manual slug override** — Intentionally unsupported. Re-enabling would need an explicit admin/rename flow with reference counts, not silent PATCH.

---

## Delete homebrew content

Homebrew-only deletion is wired for all six registered catalog types. System SRD rows return `403 forbidden` on both the advisory availability check and `DELETE`; edit views hide the delete control when `entity.source !== 'homebrew'`.

### Advisory GET vs authoritative DELETE

- `GET …/deletion-availability` exists **only for UX preflight**. It is not a lock or permission grant.
- `DELETE` always re-runs the full guarded validation path before mutating data.
- Callers must not delete homebrew documents by calling `homebrewModel.deleteOne` directly — all deletion goes through `deleteContentEntity` in `apps/api/src/features/content/lib/content-deletion.service.ts`.

### Contract shapes (`@rpg/contracts`)

| Shape                         | Role                                                                                                           |
| ----------------------------- | -------------------------------------------------------------------------------------------------------------- |
| `ContentDeletionAvailability` | Advisory preflight — `{ status: 'allowed' }` or `{ status: 'blocked', blockers }`                              |
| `ContentDeletionResult`       | Authoritative delete outcome — `{ status: 'deleted' }` or `{ status: 'blocked', blockers }` on `409`           |
| `ContentDeletionBlocker`      | Discriminated union — `kind: 'usage'` (with `ContentUsageReference`) or `kind: 'rule'` (future business rules) |
| `ContentUsageReference`       | Domain identity for a blocking character — **no API hrefs**; dashboard resolves links locally                  |

### Campaign participant usage query

Character usage blockers consider only characters participating in the campaign that owns the homebrew entity:

1. **NPCs** — all character docs with `{ characterType: 'npc', campaignId }`.
2. **PCs** — union of all `CampaignMembership.characterIds` for `{ campaignId }`, deduped, then sanitized to ids that still exist in MongoDB (stale membership references are dropped silently).

The resolver runs one composed Mongo query per branch (NPC path and PC `$in` path), merges hits deduped by character id, and maps to `ContentDeletionBlocker` rows. Per-type matcher fragments live in `content-character-usage-matchers.ts` (skill proficiencies match on **slug**, not envelope id).

### Authorization and entity resolution

Delete reuses the same entity resolution path as update (`resolveContentEntityForWrite` in `content-write.service.ts`): campaign scope, registry lookup, resolved catalog entity by id, homebrew collection selection keyed by `{ _id, campaignId }`, identical not-found behavior for unknown or cross-campaign ids.

Optional per-type hook on `ContentWriteConfig`:

```typescript
resolveDeleteBlockers?: (ctx: ContentDeleteContext) => Promise<ContentDeletionBlocker[]>
```

Default: `[]`. Character usage blockers are always resolved by the shared service; the hook adds additional blockers only.

### Dashboard UX

Shared lib under `apps/dashboard/src/features/content/lib/delete/`:

- `useContentDeleteFlow` — availability check on click (button pending, no empty modal), confirm dialog, race handling (`409` → blocked dialog), navigate to overview on success.
- `ContentDeletionBlockedDialog` / `ContentDeletionConfirmDialog` — unified edit-view dialogs wired from `ContentEditShell`.

---

## Layer overview

```
packages/contracts/src/rpg/content/<type>.ts   ← Zod schemas, TypeScript types, DTOs
packages/contracts/src/rpg/vocab/            ← closed-set reference terms (when needed)
apps/api/src/features/content/
  <type>/
    data/srd-cc-5.2.1/<type>.json  ← System seed data
    seed.ts                        ← Validates JSON at module load, exports loaders
    seed.test.ts                   ← Count + structural assertions
    <type>.config.ts               ← *Registration (read + write wiring)
    homebrew-<type>.model.ts       ← (when homebrew is needed) Mongoose schema
    <type>-patch.model.ts          ← (when patches are needed) Mongoose schema
  content-types.ts                 ← Single-line registry entry (*Registration)
  content.routes.ts                ← GET /:contentType (registry-driven list)
  content.controller.ts            ← listContent + write handlers
apps/dashboard/src/features/content/<type>/          ← single-word: spells/; multi-word: skill-proficiencies/
  api/<type>-api.ts                ← fetch wrapper
  hooks/use-<type>.ts              ← TanStack Query hook + query key
  lib/<type>-overview-columns.tsx  ← DataTable column/filter defs + stories
  routes/<type>-overview.tsx       ← Overview (list) page
  routes/<type>-detail.tsx         ← Detail page + stories
  index.ts                         ← Sub-area barrel
apps/dashboard/src/
  features/content/index.ts        ← Content feature barrel (hooks/components — not route screens)
  app/routes.ts                    ← ROUTES aggregator
  app/content-routes.ts            ← Catalog path builders (add new types here)
  app/lazy-routes.ts               ← Lazy route registrations (import route files directly)
  app/router.tsx                   ← React Router tree + breadcrumb handles
  features/homebrew/lib/hub/content-registry.ts  ← VISIBLE_SIDEBAR_CONTENT (sidebar + hub)
```

---

## Step-by-step checklist

### 1. Contracts (`packages/contracts/src/rpg/content/`)

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
  It is the catalog-facing alias of the neutral `authoredContentBodySchema`; world
  content and seed contracts use that primitive without adopting catalog ownership semantics.
- `description` stores sanitized HTML; render catalog copy with `RichTextContent`.
- Avoid `z.enum` for open lists (items, feature names). Use `z.string()` unless the engine branches on the value.
- Name the stored type to avoid reserved words or collisions (e.g. `CharacterClass` not `Class`).

Re-export from `packages/contracts/src/rpg/content/index.ts` (the root barrel
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
`packages/contracts/src/rpg/vocab/` and derive the Zod enum from the map keys. Import
the schema into your content module — do not define vocab maps on the entity
file. See [packages/contracts/docs/structure.md](../packages/contracts/docs/structure.md).

#### Catalog content-type terms (`CONTENT_TYPE_TERMS`)

Catalog **collection names** (sidebar, breadcrumbs, overview headings, create
titles) are not field vocabulary. They live in
`packages/contracts/src/rpg/content/lib/content-type-terms.ts` as
`CONTENT_TYPE_TERMS`, keyed by `ContentTypeKey`.

Three display layers — do not conflate them:

| Layer                | Registry                                     | Example                                |
| -------------------- | -------------------------------------------- | -------------------------------------- |
| Catalog content type | `CONTENT_TYPE_TERMS` / `*_CONTENT_TYPE_TERM` | `Species`, `Skill Proficiencies` (nav) |
| Proficiency domain   | `PROFICIENCY_DOMAIN_ENTRIES`                 | `Skills` (compact), grant row labels   |
| Field taxonomy       | `*_TERM` / option-set registry               | `CREATURE_TYPE_TERM` (within species)  |
| Workflow copy        | `defineMessage` catalogs                     | full validation sentences              |

Dashboard derives surface labels from key-based helpers in
`features/content/lib/content-type-labels.ts` (`getContentTypeCollectionLabel`,
`formatContentCreateHeading`, …). Contracts modules import `getContentTypeTerm`
directly. Sidebar and router crumbs derive collection labels from the same
helpers — do not hand-roll display strings.

Keep this registry centralized while its entries share ownership and dependencies.
Split it into domain modules only when those conditions change or the file becomes
hard to navigate; preserve the existing content barrel and aliases if it is split.

`pnpm vocab:audit` audits direct term usage across the workspace. Its repository-wide
usage-budget regression gate is intentionally deferred pending a baseline-stability
spike; see the audit package README. Vocabulary option-set
audits share the tool, so [vocabulary.md](./vocabulary.md) links here rather than
duplicating its policy.

##### Audit CLI (`@rpg/term-audit`)

Run from the repository root:

```sh
pnpm vocab:audit --content-type classes
pnpm vocab:audit --term skill-proficiencies --format json
pnpm vocab:audit --vocab-set creature-types
```

Target namespaces:

| Flag                  | Resolves                                                           |
| --------------------- | ------------------------------------------------------------------ |
| `--content-type <id>` | Catalog `ContentTypeKey` (`classes`, `spells`, …)                  |
| `--vocab-set <id>`    | Configurable vocabulary option set (`creature-types`, …)           |
| `--term <id>`         | Unambiguous id only; rejects collisions between the two registries |

Checked-in JSON baselines live under `tools/vocab/term-audit/baselines/` (with
`pre-migration/` snapshots). Regenerate after intentional copy changes; see the
package README.

**Configuration** — `tools/vocab/term-audit/term-audit.config.ts` records:

- `ignore` globs for generated artifacts and non-source files
- `contextual` entries: target, path glob, reason, and owner for occurrences that
  should remain literal (domain mechanics, field taxonomy, named game options)

Add a contextual entry when audit findings are intentional — do not maintain
prose-only exception lists. File-level entries mark every literal in that path as
`contextual` for the target.

**Intentional-exception policy** — migrate generic catalog nouns to
`content-type-labels.ts` helpers (dashboard) or `getContentTypeTerm` /
`getContentTypeSentenceForm` (contracts, catalog, API). Keep literals when the
phrase is domain-owned: spellcasting mechanics, feat eligibility rules, armor
class (AC), or named packages such as “Standard Equipment”.

**Equipment acceptance matrix** — parent catalog chrome uses the `equipment`
content-type term; family, kind, and category surfaces use their dedicated
vocab registries (`equipment-family-paths`, `EQUIPMENT_KIND_LABELS`, …). Do not
substitute parent-term copy into family/kind contexts, and do not use family
labels for the hub/parent collection heading.

#### Reference vocabulary (`GameTermEntry`)

Use this when a closed id set needs both a display label and SRD rule text
(tooltips, detail pages, form help). Shared shape in `vocab/types.ts`; modules
live under `packages/contracts/src/rpg/vocab/` (nested folders OK, e.g.
`vocab/weapon/property.ts`):

```typescript
export type GameTermEntry = {
  readonly label: string
  readonly description: string
}
```

Pattern (see `SENSE_ENTRIES`, `ALIGNMENT_ENTRIES`, `CREATURE_SIZE_ENTRIES`,
`DAMAGE_TYPE_ENTRIES`, `WEAPON_PROPERTY_ENTRIES`, `WEAPON_MASTERY_ENTRIES`, and
`ARMOR_CATEGORY_ENTRIES` in `vocab/sense.ts`, `vocab/alignment.ts`,
`rpg/vocab/creature-size.ts`, `rpg/vocab/damage/physical.ts`, `rpg/vocab/weapon/property.ts`,
`vocab/weapon/mastery.ts`, and `vocab/armor/category.ts`). Campaign-customizable
sets such as creature types ship seed JSON from `@rpg/catalog/vocabulary` instead
of a closed `*_ENTRIES` map in contracts — see [vocabulary.md](./vocabulary.md)
for seed vs patch storage, validation, and how to add the next set.

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

For content-backed references such as **classes** and **skill proficiencies**, resolve display
names from the campaign catalog (`CharacterClass.name`, `SkillProficiency.name`) or use the
module fallback helper only when no record is loaded.
Prefer `*_ENTRIES` when rule text is available or likely soon.

#### Discriminated-union content types (variant pattern)

Most content types are a single object shape and use the one-liner DTOs above
(`<body>.extend({ slug })`, `.partial()`). Some types instead cover several
sub-kinds whose fields genuinely differ (only a few fields are universal). Model
those as a Zod **discriminated union** on a `kind` field — one content type, one
registry entry, scales by adding a union variant instead of a new content type.
`content/equipment.ts` (weapon, armor, adventuring_gear, tool, mount, vehicle,
service, magic_item) is the reference implementation.

**Dashboard routing:** Equipment uses one API list (`GET …/equipment`) and
family-scoped URLs under `/campaigns/:id/equipment/:family/…`. Family path
segments map to `EquipmentKind` via
`equipment/lib/shared/equipment-family-paths.ts` (`weapons`, `armor`,
`adventuring-gear`, `magic-items`, `tools`, `mounts`, `vehicles`, `services`).
Create/edit on a family route omit the Kind field — the URL fixes the kind. See
[`apps/dashboard/src/features/content/equipment/README.md`](../apps/dashboard/src/features/content/equipment/README.md).

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

Add one entry bundling the type's `*Registration`:

```typescript
'<kebab-plural>': <type>Registration,
```

Optional: set `resolveForCampaign` on the entry when read logic differs from the default kernel (classes today — derived skill proficiencies).

### 7. List route (no new controller function)

List GET is registry-driven. After step 6, `GET /api/campaigns/:campaignId/content/<kebab-plural>` is served by the shared `listContent` handler — no change to `content.routes.ts` or `content.controller.ts`.

Ensure the registration's `write.responseKey` matches what the dashboard API client destructures (camelCase JSON key, e.g. `skillProficiencies` for `skill-proficiencies`).

Bespoke list routes are reserved for shapes that differ from the catalog list (today: `GET …/classes/:classId/subclasses` only).

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

### 10. Column/filter definitions (`lib/<kebab-plural>-overview-columns.tsx`)

```typescript
import { buildContentColumns, buildContentFilters } from '../../lib/overview/content-table-config'
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

Add co-located `*.stories.tsx` (CSF3, `title: 'Content/<TypeName>s/<TypeName>sOverviewColumns'`).

### 11. Overview route (`routes/<kebab-plural>-overview.tsx`)

Follow the `ClassesOverview` pattern:

- Destructure `campaignId` from `useParams`.
- Render a loading/error state before the table.
- Use `<DataTable>` with `columns`, `filters`, `rowActions`, `caption`.

### 12. Detail route (`routes/<kebab-singular>-detail.tsx`)

Follow the `ClassDetail` pattern:

- Load the full list query (no per-id endpoint — find client-side with `findById`).
- Inner component calls `useSetBreadcrumbLabel(item.name)` for dynamic breadcrumb.
- Use `ContentDetailLayout` (`statRows` or `metadata`, `descriptionContent`, `children`) inside `WidePage`; full-width tables as `WidePage` siblings. See [feature-conventions.md](../apps/dashboard/docs/feature-conventions.md).
- Edit link targets `ROUTES.content.<camelPlural>.edit(campaignId, itemId)`.

Add co-located `*.stories.tsx` (CSF3, `title: 'Content/<TypeName>Detail'`).

### 13. Sub-area barrel (`index.ts`)

Export hooks and query keys only — **do not** re-export route screens (they are
lazy-loaded via direct path imports in `lazy-routes.ts`; barrel re-exports defeat
code splitting). See
[code-splitting.md](../apps/dashboard/docs/code-splitting.md).

```typescript
export { use<TypeName>s, <camelPlural>QueryKey } from './hooks/use-<kebab-plural>'
```

Optional: export non-route helpers other sub-areas need (e.g. column builders).

### 14. Content feature barrel (`apps/dashboard/src/features/content/index.ts`)

Re-export hooks, shared shells, and form infra from sub-areas — **not** route
screen components. Create/edit route exports that exist today are legacy; new
types should omit them.

```typescript
export { use<TypeName>s, <camelPlural>QueryKey } from './<kebab-plural-or-camel>'
```

### 15. Route constants (`apps/dashboard/src/app/content-routes.ts`)

Add the new type to `CONTENT_ROUTES` (aggregated by `routes.ts` as `ROUTES.content`):

```typescript
<camelPlural>: {
  overview: (campaignId: string) => `/campaigns/${campaignId}/<kebab-plural>`,
  detail: (campaignId: string, itemId: string) => `/campaigns/${campaignId}/<kebab-plural>/${itemId}`,
  edit: (campaignId: string, itemId: string) => `/campaigns/${campaignId}/<kebab-plural>/${itemId}/edit`,
  create: (campaignId: string) => `/campaigns/${campaignId}/<kebab-plural>/new`,
},
```

Note: URL segments and dashboard/API subfolders use the content type key (kebab-case when multi-word, e.g. `skill-proficiencies/`). `ROUTES.content.*` object keys and JSON response keys stay camelCase (`skillProficiencies`).

### 16. Lazy routes (`apps/dashboard/src/app/lazy-routes.ts`)

Register four lazy exports — import **route module paths directly**, never from
`@/features/content`:

```typescript
export const <TypeName>sOverviewRoute = withRouteSuspense(
  lazyNamed(() => import('@/features/content/<folder>/routes/<kebab-plural>-overview'), '<TypeName>sOverview'),
)
export const <TypeName>DetailRoute = withRouteSuspense(
  lazyNamed(() => import('@/features/content/<folder>/routes/<kebab-singular>-detail'), '<TypeName>Detail'),
)
export const <TypeName>CreateRoute = withRouteSuspense(
  lazyNamed(() => import('@/features/content/<folder>/routes/<kebab-singular>-create'), '<TypeName>Create'),
)
export const <TypeName>EditRoute = withRouteSuspense(
  lazyNamed(() => import('@/features/content/<folder>/routes/<kebab-singular>-edit'), '<TypeName>Edit'),
)
```

### 17. React Router (`apps/dashboard/src/app/router.tsx`)

Import the `*Route` wrappers from `@/app/lazy-routes`, then add under
`campaigns/:campaignId` (match the `classes` tree):

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
    { index: true, element: <<TypeName>sOverviewRoute /> },
    {
      path: 'new',
      element: <<TypeName>CreateRoute />,
      handle: { crumb: () => ({ label: 'New' }) } satisfies CrumbHandle,
    },
    {
      path: ':<singularId>',
      element: <Outlet />,
      handle: {
        crumb: (_params, { entityLabel }) => ({ label: entityLabel ?? '…' }),
      } satisfies CrumbHandle,
      children: [
        { index: true, element: <<TypeName>DetailRoute /> },
        {
          path: 'edit',
          element: <<TypeName>EditRoute />,
          handle: { crumb: () => ({ label: 'Edit' }) } satisfies CrumbHandle,
        },
      ],
    },
  ],
},
```

Detail routes call `useSetBreadcrumbLabel(item.name)`. Edit routes inherit the
entity crumb via `ContentEditShell` (`useSetBreadcrumbLabel(entity.name)` once
the entity resolves).

### 18. Sidebar and Homebrew hub (`features/homebrew/lib/hub/content-registry.ts`)

Add an entry to `VISIBLE_SIDEBAR_CONTENT` (drives campaign sidebar **and**
Homebrew hub cards — keep in sync with `HOMEBREW_SUMMARY_CONTENT_TYPE_KEYS` in
contracts). Derive `label` from `getContentTypeCollectionLabel(contentType)` —
do not hardcode the display string:

```typescript
{
  contentType: '<kebab-plural>',
  label: getContentTypeCollectionLabel('<kebab-plural>'),
  overview: ROUTES.content.<camelPlural>.overview,
  create: ROUTES.content.<camelPlural>.create,
},
```

---

## Naming conventions

| Concept                 | Convention                                       | Example                              |
| ----------------------- | ------------------------------------------------ | ------------------------------------ |
| Dashboard/API subfolder | content type key (kebab-case when multi-word)    | `skill-proficiencies/`, `spells/`    |
| URL segment             | kebab-case plural                                | `/skill-proficiencies`               |
| API route key           | kebab-case plural                                | `'skill-proficiencies'`              |
| JSON response key       | camelCase plural                                 | `{ skillProficiencies: [...] }`      |
| Query key               | `['campaigns', id, 'content', '<kebab-plural>']` |                                      |
| Contract type           | PascalCase, avoid reserved words                 | `CharacterClass`, `SkillProficiency` |
| Seed file               | `<kebab-plural>.json`                            | `skill-proficiencies.json`           |

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

## Subclass ownership (nested under classes)

Subclasses are **not** registered in `content-types.ts`. They use nested routes and a dedicated API folder (`apps/api/src/features/content/subclasses/`).

| Layer               | Source                                                    | Persistence / API                                                                    |
| ------------------- | --------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| **System**          | `@rpg/catalog/classes` (`subclasses.json`)                | Read-only seed; listed via `GET …/classes/:classId/subclasses`                       |
| **Homebrew**        | `HomebrewSubclassModel`                                   | `POST/PATCH/DELETE …/classes/:classId/subclasses/:subclassId`                        |
| **Overlay patch**   | `SubclassPatchModel`                                      | Partial edits on system ids via nested PATCH                                         |
| **Campaign access** | `ContentCampaignAccessModel` (`targetType: 'subclasses'`) | `GET/PATCH …/subclasses/:subclassId/campaign-access` (`campaignAccess` on list rows) |

List responses include **all** subclasses for the class with `campaignAccess` per row (default available / `all_players`). Dashboard **Save subclass** sends the full body; campaign access is edited in the subclass panel via `PATCH .../campaign-access`.

Delete is blocked with `409` when campaign characters reference the subclass (`classes[].subclassId`).

---

## Class spellcasting (reference)

The `classes` type embeds an optional `spellcasting` block (`content/classes/spellcasting/spellcasting.ts`). Spell slot columns on the read-only progression table are derived from `SLOT_TABLES` in `content/classes/spellcasting/slots.ts` by progression (`full` / `half` / `pact`); they are not stored on the class record.

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

See [packages/ui/docs/forms/field-types.md](../packages/ui/docs/forms/field-types.md#editable-grid-editablegrid) for the `editableGrid` field config shape.

### Read-only detail view

`ClassProgressionTable` on the class detail page fill-forwards `cantrips` and `spellsAvailable`, shows resource columns from `resources[]`, and spell-slot columns via `formatSpellLevel` from `@rpg/contracts`. Stories: `Content/Classes/ClassProgressionTable`.

---

## Skill ↔ class association

Class is the **single writer** for starting skill proficiency choices:

| Field                                                  | Location                  | Role                                                                      |
| ------------------------------------------------------ | ------------------------- | ------------------------------------------------------------------------- |
| **`proficiencies.skills.items`**                       | `class.proficiencies`     | Auto-granted skill proficiencies (fixed grants at class creation).        |
| **`characterCreation.proficiencies.skills.choices[]`** | `class.characterCreation` | Player skill picks at class creation (`choose` + `from` pool per choice). |

### Write paths

- **Class form — Proficiencies tab** — edits auto-granted skills via `proficiencies.skills.items` chips.
- **Class form — Character creation tab** — edits the first skill choice (`choices[0]` only until multi-package UI ships): choose count + `from` chips. Ephemeral empty defaults are omitted on save when not meaningful (`choose > 0` and `from` non-empty).
- **Skill form** — no class association fields; authoring lives on the class.

### Read paths

- **Skill detail** — **Class skill choices** via `classesOfferingSkillChoice()` (inverse scan of class `characterCreation.proficiencies.skills.choices`).
- **Class detail** — **Suggested proficiencies** from `skillSlugsFromClassChoices()` and `choices[0].choose`.
- **`GET …/content/classes`** — returns stored class shape; no skill-list derivation at read time.

Helpers: `skillSlugsFromClassChoices`, `classesOfferingSkillChoice`.

### Known gaps (revisit later)

- **First choice only in dashboard** — form binds `choices[0]`; multi-package skill choices deferred.
- **Skill slugs in choice pools** — same cross-catalog slug-ref risk as `spell.classIds` (see [Known gaps](#known-gaps-revisit-later)).
- **DM “allow any skill” override** — deferred.

---
