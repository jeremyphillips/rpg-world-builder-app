import { z } from 'zod'
import {
  abilitySchema,
  armorCategorySchema,
  campaignLevelSchema,
  damageTypeIdSchema,
  equipmentKindSchema,
  featCategorySchema,
  gearKindSchema,
  innateSpellKindSchema,
  languageIdSchema,
  MAX_CHARACTER_LEVEL,
  senseIdSchema,
  skillSchema,
  toolCategorySchema,
  usageFrequencySchema,
  weaponCategorySchema,
} from '@rpg/contracts'

import {
  EQUIPMENT_GRANT_ITEM_KINDS,
  EQUIPMENT_POOL_CATEGORY_ANY,
  EQUIPMENT_POOL_SOURCES,
  equipmentGrantItemFormSchema,
} from './equipment-grant-form-fields'

const BASE_GRANT_TYPES = [
  'resistances',
  'senses',
  'damageType',
  'speedOverride',
  'proficiencies',
  'languages',
] as const

/** Grant types exposed in species traits and class-feature grant pickers. */
export const GRANT_TYPES = [...BASE_GRANT_TYPES, 'innateSpells', 'featChoice'] as const

/** All grant row discriminators, including types not yet wired into consumer forms. */
export const GRANT_ROW_TYPES = [...GRANT_TYPES, 'equipment'] as const

type BaseGrantType = (typeof BASE_GRANT_TYPES)[number]
export type GrantType = (typeof GRANT_TYPES)[number]
export type GrantRowType = (typeof GRANT_ROW_TYPES)[number]

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

export const GRANT_ROW_TYPE_LABELS: Record<GrantRowType, string> = {
  ...GRANT_TYPE_LABELS,
  equipment: 'Equipment',
}

function createInnateSpellEntryFormSchema(maxLevel: number = MAX_CHARACTER_LEVEL) {
  return z.object({
    level: z.coerce.number().pipe(campaignLevelSchema(maxLevel)),
    spellIds: z.array(z.string()).min(1),
    kind: innateSpellKindSchema.optional(),
    frequency: usageFrequencySchema.optional(),
  })
}

const equipmentGrantRowFieldsSchema = z.object({
  itemKind: z.enum(EQUIPMENT_GRANT_ITEM_KINDS).optional(),
  equipmentSlug: z.string().min(1).optional(),
  quantity: z.coerce.number().int().min(1).optional(),
  equipped: z.boolean().optional(),
  choose: z.coerce.number().int().min(1).optional(),
  poolSource: z.enum(EQUIPMENT_POOL_SOURCES).optional(),
  poolEquipmentSlugs: z.array(z.string().min(1)).optional(),
  poolEquipmentKind: equipmentKindSchema.optional(),
  poolToolCategory: z
    .union([toolCategorySchema, z.literal(EQUIPMENT_POOL_CATEGORY_ANY)])
    .optional(),
  poolWeaponCategory: z
    .union([weaponCategorySchema, z.literal(EQUIPMENT_POOL_CATEGORY_ANY)])
    .optional(),
  poolArmorCategory: z
    .union([armorCategorySchema, z.literal(EQUIPMENT_POOL_CATEGORY_ANY)])
    .optional(),
  poolGearKind: z.union([gearKindSchema, z.literal(EQUIPMENT_POOL_CATEGORY_ANY)]).optional(),
})

export function createGrantRowFormSchema(maxLevel: number = MAX_CHARACTER_LEVEL) {
  return z
    .object({
      grantType: z.enum(GRANT_ROW_TYPES),
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
    .merge(equipmentGrantRowFieldsSchema)
    .superRefine((row, ctx) => {
      if (row.grantType !== 'equipment') return

      const result = equipmentGrantItemFormSchema.safeParse(row)
      if (result.success) return

      for (const issue of result.error.issues) {
        ctx.addIssue({
          code: 'custom',
          message: issue.message,
          path: issue.path,
        })
      }
    })
}

export const grantRowFormSchema = createGrantRowFormSchema()

export type GrantRowForm = z.infer<typeof grantRowFormSchema>
