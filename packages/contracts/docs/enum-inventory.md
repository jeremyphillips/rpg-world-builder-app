# Enum inventory

Living audit of closed sets (`z.enum`) under `packages/contracts/src`. Use the
**closed-set ownership rule** before promoting values to `rpg/vocab` or enriching
JSON Schema hover.

## Ownership rule (summary)

| Promote to vocab                         | Keep local                                  |
| ---------------------------------------- | ------------------------------------------- |
| Reusable domain term users see in UI     | Discriminated-union branch / storage shape  |
| Shared labels or descriptions            | Single-feature mode or validation detail    |
| Consumed by multiple schemas or packages | Title-cased key with no independent meaning |

Catalog JSON exposure alone does **not** require vocab ownership. Structural locals may
use property-level `.describe()` only.

## Hover tier

| Tier                | JSON Schema expectation                                  |
| ------------------- | -------------------------------------------------------- |
| `vocab-backed`      | Per-value descriptions required (`vocabEnumFromEntries`) |
| `local-exempt`      | Enum validation/completion only; descriptions optional   |
| `user-facing-local` | Description required at schema site when tagged below    |

## Helpers

- `vocabEnumFromEntries(entries)` — vocab-backed Zod enum + composite `.describe()`
- `termOptionsFromEntries(entries)` — neutral `{ value, label, description? }[]` for apps
- `formatEnumDescription(entries)` — markdown bullets for schema descriptions

---

## Phase 0 promotions (completed)

| Concept                                                   | Module                                    | Catalog JSON                | Hover tier   |
| --------------------------------------------------------- | ----------------------------------------- | --------------------------- | ------------ |
| Spell grant casting mode (`free_cast`, `always_prepared`) | `vocab/spell/grant-casting-mode.ts`       | yes (`spells` grant `mode`) | vocab-backed |
| Equipment kind                                            | `vocab/equipment/kind.ts`                 | yes                         | vocab-backed |
| Spell preparation mode                                    | `vocab/spell/preparation-mode.ts`         | yes (class `spellcasting`)  | vocab-backed |
| Spellcasting progression (`full`/`half`/`pact`)           | `vocab/spell/spellcasting-progression.ts` | yes                         | vocab-backed |

---

## Vocab-backed — wired with `vocabEnumFromEntries` (catalog paths)

| Schema                          | Module                                    | Entries | Catalog JSON |
| ------------------------------- | ----------------------------------------- | ------- | ------------ |
| `abilitySchema`                 | `vocab/ability.ts`                        | full    | yes          |
| `usageFrequencySchema`          | `vocab/usage-frequency.ts`                | full    | yes          |
| `movementModeSchema`            | `vocab/movement-mode.ts`                  | full    | yes          |
| `extraMovementModeSchema`       | `vocab/movement-mode.ts`                  | full    | yes          |
| `movementOperationSchema`       | `vocab/movement-mode.ts`                  | full    | yes          |
| `featCategorySchema`            | `vocab/feat.ts`                           | full    | yes          |
| `equipmentKindSchema`           | `vocab/equipment/kind.ts`                 | full    | yes          |
| `spellGrantCastingModeSchema`   | `vocab/spell/grant-casting-mode.ts`       | full    | yes          |
| `spellPreparationModeSchema`    | `vocab/spell/preparation-mode.ts`         | full    | yes          |
| `spellcastingProgressionSchema` | `vocab/spell/spellcasting-progression.ts` | full    | yes          |

## Vocab-backed — existing `*_ENTRIES`, wire in follow-up phases

These modules already have `GameTermEntry` maps but still use bare `z.enum` today.
Phase 1+ should adopt `vocabEnumFromEntries` when their schemas appear in generated
catalog JSON.

| Schema                         | Module                                      | Entries          |
| ------------------------------ | ------------------------------------------- | ---------------- |
| `alignmentSchema`              | `vocab/alignment.ts`                        | full             |
| `creatureSizeSchema`           | `vocab/creature-size.ts`                    | full             |
| `creatureTypeSchema`           | `vocab/creature-type.ts`                    | full             |
| `languageCategorySchema`       | `vocab/language.ts`                         | full             |
| `senseIdSchema` / related      | `vocab/sense.ts`                            | full             |
| `damageTypeIdSchema`           | `vocab/damage/vocabulary.ts`                | full             |
| `physicalDamageTypeSchema`     | `vocab/damage/physical.ts`                  | full             |
| `weaponCategorySchema`         | `vocab/weapon/category.ts`                  | labels / partial |
| `armorCategorySchema`          | `vocab/armor/category.ts`                   | labels / partial |
| `toolCategorySchema`           | `vocab/equipment/tool-category.ts`          | labels / partial |
| `gearKindSchema`               | `vocab/equipment/gear-kind.ts`              | labels / partial |
| `spellcastingGearKindSchema`   | `vocab/equipment/spellcasting-gear-kind.ts` | labels / partial |
| `holySymbolUsageSchema`        | `vocab/equipment/holy-symbol-usage.ts`      | full             |
| `magicItemCategorySchema`      | `vocab/magic-item/category.ts`              | labels / partial |
| `magicItemRaritySchema`        | `vocab/magic-item/rarity.ts`                | full             |
| `spellSchoolSchema`            | `vocab/spell/school.ts`                     | full             |
| `spellDeliveryMethodSchema`    | `vocab/spell/delivery-method.ts`            | full             |
| `spellRangeKindSchema`         | `vocab/spell/range.ts`                      | full             |
| `castingTimeUnitSchema`        | `vocab/spell/casting-time.ts`               | full             |
| `durationUnitSchema`           | `vocab/spell/duration.ts`                   | full             |
| `spellRoleTagSchema`           | `vocab/spell/role-tag.ts`                   | labels-only      |
| `spellFunctionTagSchema`       | `vocab/spell/function-tag.ts`               | bare             |
| `effectConditionSchema`        | `vocab/effect-condition.ts`                 | full             |
| `attackResolutionModeIdSchema` | `vocab/mechanics/attack-resolution-mode.ts` | full             |
| `editionPresetIdSchema`        | `vocab/mechanics/edition-preset.ts`         | full             |

---

## Keep local (structural / union discriminators)

| Schema                                           | Home                                    | Catalog JSON | User-facing local | Hover tier   |
| ------------------------------------------------ | --------------------------------------- | ------------ | ----------------- | ------------ |
| `proficiencyGrantKindSchema` (`fixed`, `choice`) | `content/lib/proficiency-grant.ts`      | yes          | no                | local-exempt |
| `proficiencyPoolSourceSchema`                    | `content/lib/proficiency-grant.ts`      | yes          | no                | local-exempt |
| `contentTraitKindSchema` (`custom`, `grant`)     | `content/lib/grants.ts`                 | yes          | no                | local-exempt |
| `contentGrantSchema` `kind` literals             | `content/lib/grants.ts`                 | yes          | no                | local-exempt |
| `contentSourceSchema` (`system`, `homebrew`)     | `content/lib/envelope.ts`               | yes          | no                | local-exempt |
| `equipmentModifierKindSchema`                    | `content/equipment/modifier.ts`         | yes          | no                | local-exempt |
| `speciesMulticlassPolicySchema`                  | `content/species-character-creation.ts` | yes          | no                | local-exempt |
| `speciesClassPolicyModeSchema`                   | `content/species-character-creation.ts` | yes          | no                | local-exempt |
| `weaponDamageTypeSchema` (equipment variant)     | `content/equipment/weapon-variant.ts`   | yes          | no                | local-exempt |
| `homebrewSummaryContentTypeSchema`               | `content/lib/homebrew-summary.ts`       | no           | no                | local-exempt |
| `xpProgressionScopeKindSchema`                   | `content/xp-progression.ts`             | seed only    | no                | local-exempt |
| `startingWealthScopeKindSchema`                  | `campaign/rules/starting-wealth.ts`     | seed only    | no                | local-exempt |

---

## Defer (out of catalog JSON Schema workstream)

| Area                                                             | Home                                             | Notes                                               |
| ---------------------------------------------------------------- | ------------------------------------------------ | --------------------------------------------------- |
| Spell resolution enums                                           | `content/spell/resolution/schema.ts`             | Separate follow-up; `@todo` in module               |
| Spell resolution progression                                     | `content/spell/resolution/progression/schema.ts` | Same project                                        |
| Character builder runtime                                        | `runtime/character-builder/*`                    | Runtime-only                                        |
| Character import                                                 | `character-import/*`                             | Adapter pipeline                                    |
| Name generator                                                   | `name-generator/*`                               | Internal tooling                                    |
| Dev bench                                                        | `dev-bench/*`                                    | Internal tooling                                    |
| Campaign authoring                                               | `campaign/campaign.ts`, patches                  | Dashboard-only for now                              |
| Platform / campaign roles                                        | `shared/roles.ts`                                | Auth layer                                          |
| Primitives (`area-geometry`, `dice-formula`, `units`, `ruleset`) | `primitives/*`                                   | Mixed; promote individually when UI reuse confirmed |

---

## Removed in Phase 0

| Concept                                       | Reason                                                              |
| --------------------------------------------- | ------------------------------------------------------------------- |
| `INNATE_SPELL_KINDS` / `innateSpell*` schemas | Replaced by `spellGrantCastingModeSchema` on atomic `spells` grants |
| `contentGrantsSchema` (legacy bag)            | Catalog seeds use `grantGroups`; zero `innateSpells` in seeds       |
| `isGrantEligibleGrants`                       | Replaced by `isGrantGroupsEligible`                                 |

---

## Maintenance

- Add a row when introducing a new `z.enum` in contracts.
- Promote to vocab only when the ownership rule is satisfied — not for JSON Schema alone.
- Co-locate `*_ENTRIES` key ↔ `z.enum` parity tests per vocab module.
- Regenerate catalog JSON schemas after vocab describe changes (`pnpm generate:json-schemas`).
