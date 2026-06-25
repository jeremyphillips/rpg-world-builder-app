import { z } from 'zod'

import { alignmentSchema } from '../vocab/alignment'
import { armorCategorySchema } from '../vocab/armor/category'
import { toolCategorySchema } from '../vocab/equipment/tool-category'
import { languageSchema } from '../vocab/language'
import { weaponCategorySchema } from '../vocab/weapon/category'
import { absoluteLevelSchema } from '../primitives/level'
import { creatureAbilityScoresSchema, creatureRuntimeHitPointsSchema } from './creature'
import { equipmentModifierSchema } from './equipment/modifier'
import { skillSchema } from './skill-proficiency'

// ---------------------------------------------------------------------------
// Character — player characters and campaign-owned NPCs. This is a stored sheet
// contract, not a rules engine: totals and derived catalog grants are resolved by
// services/builders from class, species, feat, spell, and equipment content.
// ---------------------------------------------------------------------------

export const CHARACTER_TYPES = ['pc', 'npc'] as const

export const characterTypeSchema = z.enum(CHARACTER_TYPES)

export type CharacterType = z.infer<typeof characterTypeSchema>

// ---------------------------------------------------------------------------
// Source / provenance records
// ---------------------------------------------------------------------------

export const CHARACTER_SELECTION_SOURCE_KINDS = [
  'classFeature',
  'subclassFeature',
  'speciesTrait',
  'heritageOption',
  'feat',
  'equipment',
  'classStartingEquipment',
  'backgroundStartingEquipment',
  'startingWealthTier',
  'manual',
] as const

export const characterSelectionSourceKindSchema = z.enum(CHARACTER_SELECTION_SOURCE_KINDS)

export type CharacterSelectionSourceKind = z.infer<typeof characterSelectionSourceKindSchema>

/**
 * Provenance for a selected or granted character entry.
 *
 * `sourceId` points at the granting content record when there is one. For
 * class/subclass features, `grantId` can hold the feature id that is unique
 * within that parent content record.
 */
export const characterSelectionSourceSchema = z
  .object({
    kind: characterSelectionSourceKindSchema,
    sourceId: z.string().min(1).optional(),
    grantId: z.string().min(1).optional(),
    notes: z.string().optional(),
  })
  .superRefine((val, ctx) => {
    if (val.kind !== 'manual' && val.sourceId === undefined) {
      ctx.addIssue({
        code: 'custom',
        message: 'sourceId is required unless the source kind is manual',
        path: ['sourceId'],
      })
    }
  })

export type CharacterSelectionSource = z.infer<typeof characterSelectionSourceSchema>

export const characterSelectionSourcesSchema = z.array(characterSelectionSourceSchema).optional()

// ---------------------------------------------------------------------------
// Core identity and progression
// ---------------------------------------------------------------------------

export const characterClassEntrySchema = z.object({
  /** Opaque class content id. */
  classId: z.string().min(1),
  /** Opaque subclass content id chosen for this class, when any. */
  subclassId: z.string().min(1).optional(),
  level: absoluteLevelSchema,
})

export type CharacterClassEntry = z.infer<typeof characterClassEntrySchema>

export const characterClassesSchema = z
  .array(characterClassEntrySchema)
  .min(1)
  .superRefine((entries, ctx) => {
    const seen = new Set<string>()

    entries.forEach((entry, index) => {
      if (seen.has(entry.classId)) {
        ctx.addIssue({
          code: 'custom',
          message: 'A character cannot include the same class more than once',
          path: [index, 'classId'],
        })
      }

      seen.add(entry.classId)
    })
  })

export const characterSpeciesSchema = z.object({
  /** Opaque species content id. */
  id: z.string().min(1),
  /** Selected embedded heritage/lineage option id, when the species offers one. */
  heritageId: z.string().min(1).optional(),
})

export type CharacterSpecies = z.infer<typeof characterSpeciesSchema>

export const characterAbilityScoresSchema = creatureAbilityScoresSchema

export type CharacterAbilityScores = z.infer<typeof characterAbilityScoresSchema>

export const characterHitPointsSchema = creatureRuntimeHitPointsSchema

export type CharacterHitPoints = z.infer<typeof characterHitPointsSchema>

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
  language: languageSchema,
  sources: characterSelectionSourcesSchema,
  notes: z.string().optional(),
})

export type CharacterLanguageEntry = z.infer<typeof characterLanguageEntrySchema>

// ---------------------------------------------------------------------------
// Spells, equipment, wealth, feats, and narrative
// ---------------------------------------------------------------------------

export const CHARACTER_SPELL_PREPARATION_STATES = ['known', 'prepared', 'always_prepared'] as const

export const characterSpellPreparationStateSchema = z.enum(CHARACTER_SPELL_PREPARATION_STATES)

export type CharacterSpellPreparationState = z.infer<typeof characterSpellPreparationStateSchema>

export const characterSpellEntrySchema = z.object({
  spellId: z.string().min(1),
  preparationState: characterSpellPreparationStateSchema.optional(),
  sources: characterSelectionSourcesSchema,
  notes: z.string().optional(),
})

export type CharacterSpellEntry = z.infer<typeof characterSpellEntrySchema>

export const characterEquipmentEntrySchema = z.object({
  /** Optional stable row id for duplicate or customized copies of the same item. */
  entryId: z.string().min(1).optional(),
  equipmentId: z.string().min(1),
  quantity: z.number().int().min(1).default(1),
  equipped: z.boolean().optional(),
  attuned: z.boolean().optional(),
  customName: z.string().min(1).optional(),
  modifiers: z.array(equipmentModifierSchema).optional(),
  sources: characterSelectionSourcesSchema,
  notes: z.string().optional(),
})

export type CharacterEquipmentEntry = z.infer<typeof characterEquipmentEntrySchema>

export const characterEquipmentSchema = z.object({
  weapons: z.array(characterEquipmentEntrySchema).default([]),
  armor: z.array(characterEquipmentEntrySchema).default([]),
  tools: z.array(characterEquipmentEntrySchema).default([]),
  gear: z.array(characterEquipmentEntrySchema).default([]),
  magicItems: z.array(characterEquipmentEntrySchema).default([]),
  vehicles: z.array(characterEquipmentEntrySchema).default([]),
  mounts: z.array(characterEquipmentEntrySchema).default([]),
})

export type CharacterEquipment = z.infer<typeof characterEquipmentSchema>

export const characterWealthSchema = z.object({
  cp: z.number().int().min(0).default(0),
  sp: z.number().int().min(0).default(0),
  gp: z.number().int().min(0).default(0),
  pp: z.number().int().min(0).default(0),
})

export type CharacterWealth = z.infer<typeof characterWealthSchema>

/** Sparse coin grant for starting equipment and similar content — omits unset denominations. */
export const characterWealthGrantSchema = z
  .object({
    cp: z.number().int().min(0).optional(),
    sp: z.number().int().min(0).optional(),
    gp: z.number().int().min(0).optional(),
    pp: z.number().int().min(0).optional(),
  })
  .strict()

export type CharacterWealthGrant = z.infer<typeof characterWealthGrantSchema>

export const characterFeatEntrySchema = z.object({
  featId: z.string().min(1),
  sources: characterSelectionSourcesSchema,
  choices: z.record(z.string(), z.unknown()).optional(),
  notes: z.string().optional(),
})

export type CharacterFeatEntry = z.infer<typeof characterFeatEntrySchema>

export const characterNarrativeSchema = z.object({
  personalityTraits: z.array(z.string().min(1)).optional(),
  ideals: z.string().optional(),
  bonds: z.string().optional(),
  flaws: z.string().optional(),
  backstory: z.string().optional(),
})

export type CharacterNarrative = z.infer<typeof characterNarrativeSchema>

// ---------------------------------------------------------------------------
// Character records
// ---------------------------------------------------------------------------

const characterBaseSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  imageKey: z.string().optional(),
  rulesetId: z.string().min(1),
  classes: characterClassesSchema,
  species: characterSpeciesSchema,
  alignment: alignmentSchema,
  xp: z.number().int().min(0),
  abilityScores: characterAbilityScoresSchema,
  hitPoints: characterHitPointsSchema,
  proficiencies: characterProficienciesSchema,
  languages: z.array(characterLanguageEntrySchema).default([]),
  spells: z.array(characterSpellEntrySchema).default([]),
  equipment: characterEquipmentSchema,
  wealth: characterWealthSchema,
  narrative: characterNarrativeSchema.optional(),
  feats: z.array(characterFeatEntrySchema).default([]),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
})

export const pcCharacterSchema = characterBaseSchema.extend({
  characterType: z.literal('pc'),
  userId: z.string().min(1),
  campaignId: z.string().min(1).nullable().optional(),
})

export type PcCharacter = z.infer<typeof pcCharacterSchema>

export const npcCharacterSchema = characterBaseSchema.extend({
  characterType: z.literal('npc'),
  campaignId: z.string().min(1),
  userId: z.never().optional(),
})

export type NpcCharacter = z.infer<typeof npcCharacterSchema>

export const characterSchema = z.discriminatedUnion('characterType', [
  pcCharacterSchema,
  npcCharacterSchema,
])

export type Character = z.infer<typeof characterSchema>

export function getCharacterTotalLevel(character: Pick<Character, 'classes'>): number {
  return character.classes.reduce((total, entry) => total + entry.level, 0)
}
