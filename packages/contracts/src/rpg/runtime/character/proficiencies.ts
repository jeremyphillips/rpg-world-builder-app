import { z } from 'zod'

import { armorCategorySchema } from '../../vocab/armor/category'
import { toolCategorySchema } from '../../vocab/equipment/tool-category'
import { languageIdSchema } from '../../vocab/language'
import { weaponCategorySchema } from '../../vocab/weapon/category'
import { skillSchema } from '../../content/skill-proficiency'
import { characterSelectionSourcesSchema } from './selection-sources'

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
        message: 'Choose exactly one of toolId or toolCategory',
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
        message: 'Choose exactly one of weaponId or weaponCategory',
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

export const characterProficienciesSchema = z.object({
  skills: z.array(characterSkillProficiencyEntrySchema).default([]),
  weapons: z.array(characterWeaponProficiencyEntrySchema).default([]),
  armor: z.array(characterArmorProficiencyEntrySchema).default([]),
  tools: z.array(characterToolProficiencyEntrySchema).default([]),
})

export type CharacterProficiencies = z.infer<typeof characterProficienciesSchema>

export const characterLanguageEntrySchema = z.object({
  language: languageIdSchema,
  sources: characterSelectionSourcesSchema,
  notes: z.string().optional(),
})

export type CharacterLanguageEntry = z.infer<typeof characterLanguageEntrySchema>
