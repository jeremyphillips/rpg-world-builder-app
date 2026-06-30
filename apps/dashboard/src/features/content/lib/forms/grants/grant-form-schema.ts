import { z } from 'zod'
import {
  abilitySchema,
  armorCategorySchema,
  campaignLevelSchema,
  damageTypeIdSchema,
  featCategorySchema,
  innateSpellKindSchema,
  languageIdSchema,
  MAX_CHARACTER_LEVEL,
  senseIdSchema,
  skillSchema,
  usageFrequencySchema,
} from '@rpg/contracts'

const BASE_GRANT_TYPES = [
  'resistances',
  'senses',
  'damageType',
  'speedOverride',
  'proficiencies',
  'languages',
] as const

export const GRANT_TYPES = [...BASE_GRANT_TYPES, 'innateSpells', 'featChoice'] as const

type BaseGrantType = (typeof BASE_GRANT_TYPES)[number]
export type GrantType = (typeof GRANT_TYPES)[number]

const BASE_GRANT_TYPE_LABELS: Record<BaseGrantType, string> = {
  resistances: 'Damage resistances',
  senses: 'Special sense',
  damageType: 'Damage type',
  speedOverride: 'Speed override',
  proficiencies: 'Proficiencies',
  languages: 'Language',
}

export const GRANT_TYPE_LABELS: Record<GrantType, string> = {
  ...BASE_GRANT_TYPE_LABELS,
  innateSpells: 'Innate spells',
  featChoice: 'Feat choice',
}

function createInnateSpellEntryFormSchema(maxLevel: number = MAX_CHARACTER_LEVEL) {
  return z.object({
    level: z.coerce.number().pipe(campaignLevelSchema(maxLevel)),
    spellIds: z.array(z.string()).min(1),
    kind: innateSpellKindSchema.optional(),
    frequency: usageFrequencySchema.optional(),
  })
}

export function createGrantRowFormSchema(maxLevel: number = MAX_CHARACTER_LEVEL) {
  return z.object({
    grantType: z.enum(GRANT_TYPES),
    resistances: z.array(damageTypeIdSchema).optional(),
    damageType: z.array(damageTypeIdSchema).optional(),
    senseType: senseIdSchema.optional(),
    senseRange: z.coerce.number().int().min(0).optional(),
    speedWalkOverride: z.coerce.number().int().min(0).optional(),
    language: languageIdSchema.optional(),
    proficiencySkills: z.array(skillSchema).optional(),
    proficiencyArmor: z.array(armorCategorySchema).optional(),
    proficiencyTools: z.array(z.string()).optional(),
    proficiencyWeapons: z.array(z.string()).optional(),
    innateSpellAbility: abilitySchema.optional(),
    innateSpellEntries: z.array(createInnateSpellEntryFormSchema(maxLevel)).optional(),
    featCategory: featCategorySchema.optional(),
    featChoose: z.coerce.number().int().min(1).optional(),
    featAllowAnyQualifying: z.boolean().optional(),
    featReplaceable: z.boolean().optional(),
    featRecommendedIds: z.array(z.string()).optional(),
  })
}

export const grantRowFormSchema = createGrantRowFormSchema()

export type GrantRowForm = z.infer<typeof grantRowFormSchema>
