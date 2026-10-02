# NPC roles

Eight closed roles in [`npc-template.ts`](../../src/rpg/vocab/npc/npc-template.ts).
`NPC_TEMPLATE_TERM` + `NPC_TEMPLATE_ENTRIES` is the catalog. Wealth tiers live beside it in
`npc-wealth-tier.ts`.

Recommendations and the level-0 role layer are separate.

| Layer              | What it does                                                                                                                    |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------- |
| Recommendations    | Bias automatic selection at every level. They never add capabilities.                                                           |
| Level-0 role layer | Grants training, a wealth-tier purse, and role choices. Classless chassis only, and only when the draft stores `npcTemplateId`. |

## Catalog

| Id         | Class preferences | Level-0 wealth | Role choices      |
| ---------- | ----------------- | -------------- | ----------------- |
| `commoner` | none              | poor           | 1 skill, 0 tools  |
| `guard`    | fighter           | modest         | 2 skills, 0 tools |
| `scout`    | ranger            | modest         | 2 skills, 0 tools |
| `merchant` | none              | comfortable    | 2 skills, 0 tools |
| `artisan`  | none              | modest         | 1 skill, 1 tool   |
| `scholar`  | none              | modest         | 2 skills, 0 tools |
| `priest`   | cleric, paladin   | modest         | 2 skills, 0 tools |
| `criminal` | rogue             | modest         | 2 skills, 1 tool  |

Role-choice caps are `{ skills: 2, tools: 1 }`. Each role lists at least two more skill
preferences than its skill-choice count. Tool preferences are non-empty exactly when the
role offers a tool choice. Card descriptions do not name a class or a level.

Two class preferences, as on priest, mean class is not auto-seeded. A level-0 priest does
not cast. `wealthy` exists in the wealth-tier vocab and is unused by v1 roles.

## Precedence

`resolveNpcTemplateRecommendations` walks:

1. User role, then title `templateId`, then organization `members.npcTemplateId`.
2. Otherwise Commoner, with `usedCommonerFallback` and no `npcTemplateId`.
3. Level: user, then title level, then the campaign minimum. Roles carry no level.
4. Class, only when class progression applies: user class ids replace the list. Otherwise a title `classPreferenceOverrideSlugs` replaces the role class list. Organization class affinities merge after that, ranked both → role/title → organization.
5. Skills and tools: user, then title preferences, then the role. Title preferences are prepended and do not create slots.
6. Languages: user, then species affinities, then the role. Species affinities order picks; they do not expand pools.
7. Equipment: user, then title `equipmentPreferenceSlugs`, then the role. The role list is `defaultLoadout` slugs, then `additionalPreferences`, deduped. `additionalPreferences` does not repeat default slugs. The list orders class starting-equipment packages, nested equipment pools, and weapon or armor proficiency choices when option ids match. It never grants equipment. Held inventory is removed from the bias stream before scoring. A default loadout is not held until it has been materialized onto the draft. Package scoring includes direct grants and one level of reachable nested pool contents. The same slugs are strong preference signals (`source` role, title, or user) when `deriveEquipmentRecommendations` receives a recommendation context. Provisional equipment source priority, used only after strength and specificity, is user, title, role, class, subclass, organization, species, origin, feat. The `NpcTemplate*` rename stays deferred.
8. Ability order: a complete user permutation wins; otherwise the role order.

`toAutomaticNpcBuildPreferences` flattens that result for automatic build. Soft preferences never fail a build. Held skills, tools, and languages are skipped. On a classed build, class primary abilities keep the top standard-array slots and the role orders the rest.

## Level 0

Campaign `levelZeroNpcs.wealthTiers` replaces the old single purse. Defaults are poor 1 gp,
modest 5 gp, comfortable 10 gp, wealthy 25 gp. A classless NPC with no role uses modest.

Wealth tier semantics: each tier key on the patch is authoritative when present — **zero is
valid**. An explicit zero purse is stored as `{ gp: 0 }` (Mongo-safe). Omitting a tier key means
“use campaign default for that tier,” not “clear to zero.”

Role equipment defaults are editable starting state, not grants. Role equipment preferences bias existing choices. Only explicit grant sources create immutable Granted Equipment.

Classless finalize and preview assemble the selected role tool when the role
offers one, equipment already written onto `draft.equipment.grants`, and the tier purse.
`draft.equipment.grants` materializes selected starting equipment. Presence there is not an
immutable grant, and those rows are not Granted Equipment. The assembler does not re-read
`defaultLoadout`, so a removed default stays gone. Role training is merged with the
campaign baseline and keeps provenance `grantId: 'training'`. Armor training stores
categories; item slugs in a grant resolve to those categories.

Role ChoiceSets use source `npcTemplate`, ids `npcTemplate:{id}:skills` and `:tools`, and
selection provenance `{ kind: 'npcTemplate', sourceId, grantId }`.

## Organizations

Organization members may store `npcTemplateId`. Preset defaults are in
`preset-member-npc-templates.ts` and are owned-editable. Title recommendations are snapshotted
at create. See
[organization-preset-npc-recommendations-review.md](../../../../tools/scripts/organization-preset-npc-recommendations-review.md).
