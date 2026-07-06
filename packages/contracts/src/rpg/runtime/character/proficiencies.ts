import { z } from 'zod'

import { characterValidationMessages } from './character-messages'
import { armorCategorySchema } from '../../vocab/armor/category'
import { toolCategorySchema } from '../../vocab/equipment/tool-category'
import { languageIdSchema } from '../../vocab/language'
import { weaponCategorySchema } from '../../vocab/weapon/category'
import { skillSchema } from '../../content/skill-proficiency'
import { characterSelectionSourcesSchema } from './selection-sources'

/**
 * Stored character proficiency row shapes (`character.proficiencies`).
 *
 * Schemas and types only — merge/dedupe assembly for languages lives in
 * {@link ./languages.ts}; builder finalize orchestration lives under
 * `character-builder/assembly/` (see `runtime-resolution-boundaries.md`).
 *
 * **Future — grant-derived proficiencies:** Species and class-feature grants already
 * emit skill/weapon/tool/armor ChoiceSets via `grant-choice-sets.ts`, but finalize
 * does not yet write those selections into these rows (class-fixed armor/weapons and
 * class skill picks are handled today). When that ships:
 *
 * 1. Add `runtime/creature/proficiencies.ts` to expand filtered / `any` grant pools
 *    against catalog vocabulary (today those pools often emit a single placeholder
 *    ChoiceSet option, not real catalog rows).
 * 2. Add character-layer merge helpers here (or co-located `*-assembly` modules) for
 *    deduped skill/weapon/tool rows with combined `sources`.
 * 3. Add builder `assemble-*-proficiencies.ts` orchestration that reads grant
 *    ChoiceSet selections and attaches provenance — mirroring languages.
 *
 * Defer `creature/proficiencies.ts` until finalize needs shared pool expansion, not
 * only ChoiceSet UI stubs.
 */
// ---------------------------------------------------------------------------
// Proficiencies
// ---------------------------------------------------------------------------

export const CHARACTER_SKILL_TOOL_PROFICIENCY_RANKS = ['proficient', 'expertise'] as const

export const characterSkillToolProficiencyRankSchema = z.enum(
  CHARACTER_SKILL_TOOL_PROFICIENCY_RANKS,
)

export type CharacterSkillToolProficiencyRank = z.infer<
  typeof characterSkillToolProficiencyRankSchema
>

export const CHARACTER_WEAPON_PROFICIENCY_RANKS = ['proficient', 'mastery'] as const

export const characterWeaponProficiencyRankSchema = z.enum(CHARACTER_WEAPON_PROFICIENCY_RANKS)

export type CharacterWeaponProficiencyRank = z.infer<typeof characterWeaponProficiencyRankSchema>

export const characterSkillProficiencyEntrySchema = z.object({
  skill: skillSchema,
  rank: characterSkillToolProficiencyRankSchema,
  sources: characterSelectionSourcesSchema,
})

export type CharacterSkillProficiencyEntry = z.infer<typeof characterSkillProficiencyEntrySchema>

export const characterToolProficiencyEntrySchema = z
  .object({
    toolId: z.string().min(1).optional(),
    toolCategory: toolCategorySchema.optional(),
    rank: characterSkillToolProficiencyRankSchema,
    sources: characterSelectionSourcesSchema,
  })
  .superRefine((val, ctx) => {
    if ((val.toolId === undefined) === (val.toolCategory === undefined)) {
      ctx.addIssue({
        code: 'custom',
        message: characterValidationMessages.toolProficiencyExclusiveTarget(),
        path: ['toolId'],
      })
    }
  })

export type CharacterToolProficiencyEntry = z.infer<typeof characterToolProficiencyEntrySchema>

export const characterWeaponProficiencyEntrySchema = z
  .object({
    weaponId: z.string().min(1).optional(),
    weaponCategory: weaponCategorySchema.optional(),
    rank: characterWeaponProficiencyRankSchema,
    sources: characterSelectionSourcesSchema,
  })
  .superRefine((val, ctx) => {
    if ((val.weaponId === undefined) === (val.weaponCategory === undefined)) {
      ctx.addIssue({
        code: 'custom',
        message: characterValidationMessages.weaponProficiencyExclusiveTarget(),
        path: ['weaponId'],
      })
    }
  })

export type CharacterWeaponProficiencyEntry = z.infer<typeof characterWeaponProficiencyEntrySchema>

export const characterArmorProficiencyEntrySchema = z.object({
  armorCategory: armorCategorySchema,
  sources: characterSelectionSourcesSchema,
})

export type CharacterArmorProficiencyEntry = z.infer<typeof characterArmorProficiencyEntrySchema>

export const characterLanguageProficiencyEntrySchema = z.object({
  language: languageIdSchema,
  sources: characterSelectionSourcesSchema,
  notes: z.string().optional(),
})

export type CharacterLanguageProficiencyEntry = z.infer<
  typeof characterLanguageProficiencyEntrySchema
>

export const characterProficienciesSchema = z.object({
  skills: z.array(characterSkillProficiencyEntrySchema).default([]),
  weapons: z.array(characterWeaponProficiencyEntrySchema).default([]),
  armor: z.array(characterArmorProficiencyEntrySchema).default([]),
  tools: z.array(characterToolProficiencyEntrySchema).default([]),
  languages: z.array(characterLanguageProficiencyEntrySchema).default([]),
})

export type CharacterProficiencies = z.infer<typeof characterProficienciesSchema>
