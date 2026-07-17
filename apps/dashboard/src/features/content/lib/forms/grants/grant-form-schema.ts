import { z } from 'zod'
import {
  abilitySchema,
  armorCategorySchema,
  campaignLevelSchema,
  damageTypeIdSchema,
  equipmentKindSchema,
  featCategorySchema,
  gearKindSchema,
  spellcastingGearKindSchema,
  languageIdSchema,
  MAX_CHARACTER_LEVEL,
  PROFICIENCY_POOL_SOURCES,
  senseIdSchema,
  skillSchema,
  toolCategorySchema,
  movementModeSchema,
  movementOperationSchema,
  usageFrequencySchema,
  weaponCategorySchema,
} from '@rpg/contracts'

import {
  EQUIPMENT_GRANT_ITEM_KINDS,
  EQUIPMENT_POOL_CATEGORY_ANY,
  equipmentGrantItemFormSchema,
} from './equipment-grant-form-fields'
import {
  armorTrainingItemFormSchema,
  PROFICIENCY_POOL_CATEGORY_ANY,
  skillProficiencyItemFormSchema,
  toolProficiencyItemFormSchema,
  weaponProficiencyItemFormSchema,
} from './proficiency-grant-form-fields'

const BASE_GRANT_TYPES = [
  'resistances',
  'senses',
  'damageType',
  'movement',
  'weaponProficiency',
  'toolProficiency',
  'skillProficiency',
  'armorTraining',
  'languages',
] as const

/** Grant types exposed in species traits and class-feature grant pickers. */
export const GRANT_TYPES = [...BASE_GRANT_TYPES, 'spells', 'featChoice'] as const

/** All grant row discriminators, including types not yet wired into consumer forms. */
export const GRANT_ROW_TYPES = [...GRANT_TYPES, 'equipment'] as const

type BaseGrantType = (typeof BASE_GRANT_TYPES)[number]
export type GrantType = (typeof GRANT_TYPES)[number]
export type GrantRowType = (typeof GRANT_ROW_TYPES)[number]

const BASE_GRANT_TYPE_LABELS: Record<BaseGrantType, string> = {
  resistances: 'Damage resistance',
  senses: 'Special sense',
  damageType: 'Damage type',
  movement: 'Movement',
  weaponProficiency: 'Weapon proficiency',
  toolProficiency: 'Tool proficiency',
  skillProficiency: 'Skill proficiency',
  armorTraining: 'Armor training',
  languages: 'Language',
}

export const GRANT_TYPE_LABELS: Record<GrantType, string> = {
  ...BASE_GRANT_TYPE_LABELS,
  spells: 'Spells',
  featChoice: 'Feat choice',
}

export const GRANT_ROW_TYPE_LABELS: Record<GrantRowType, string> = {
  ...GRANT_TYPE_LABELS,
  equipment: 'Equipment',
}

/** Label shown in the "Granted at" select when the row has no explicit unlock level. */
export const GRANT_DEFAULT_UNLOCK_LABEL = 'when feature is gained'

/** User-facing label for a grant row unlocked at a specific character level. */
export function formatGrantUnlockLevelLabel(level: number): string {
  return `at level ${level}`
}

/** Radix Select rejects empty-string item values; use this for the default unlock level. */
export const GRANT_DEFAULT_UNLOCK_LEVEL = 'default' as const

const equipmentGrantRowFieldsSchema = z.object({
  itemKind: z.enum(EQUIPMENT_GRANT_ITEM_KINDS).optional(),
  equipmentSlug: z.string().min(1).optional(),
  quantity: z.coerce.number().int().min(1).optional(),
  equipped: z.boolean().optional(),
  choose: z.coerce.number().int().min(1).optional(),
  poolSource: z.enum(PROFICIENCY_POOL_SOURCES).optional(),
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
  poolSpellcastingGearKind: z
    .union([spellcastingGearKindSchema, z.literal(EQUIPMENT_POOL_CATEGORY_ANY)])
    .optional(),
})

const proficiencyGrantRowFieldsSchema = z.object({
  proficiencySource: z.enum(['specific', 'category', 'pool']).optional(),
  weaponProficiencySlugs: z.array(z.string().min(1)).optional(),
  weaponProficiencyCategories: z.array(weaponCategorySchema).optional(),
  weaponProficiencyPoolSlugs: z.array(z.string().min(1)).optional(),
  weaponProficiencyPoolCategory: z
    .union([weaponCategorySchema, z.literal(PROFICIENCY_POOL_CATEGORY_ANY)])
    .optional(),
  toolProficiencySlugs: z.array(z.string().min(1)).optional(),
  toolProficiencyCategories: z.array(toolCategorySchema).optional(),
  toolProficiencyPoolSlugs: z.array(z.string().min(1)).optional(),
  toolProficiencyPoolCategories: z.array(toolCategorySchema).optional(),
  toolProficiencyPoolFilteredToolSlugs: z.array(z.string().min(1)).optional(),
  skillProficiencyIds: z.array(skillSchema).optional(),
  skillProficiencyPoolIds: z.array(skillSchema).optional(),
  armorTrainingSlugs: z.array(z.string().min(1)).optional(),
  armorTrainingCategories: z.array(armorCategorySchema).optional(),
  armorTrainingPoolSlugs: z.array(z.string().min(1)).optional(),
  armorTrainingPoolCategory: z
    .union([armorCategorySchema, z.literal(PROFICIENCY_POOL_CATEGORY_ANY)])
    .optional(),
})

function applyFormSchemaIssues(
  ctx: z.RefinementCtx,
  result: { success: boolean; error?: z.ZodError },
): void {
  if (result.success || !result.error) return

  for (const issue of result.error.issues) {
    ctx.addIssue({
      code: 'custom',
      message: issue.message,
      path: issue.path,
    })
  }
}

function validateSpellsGrantRow(
  row: {
    spellAvailability?: boolean
    spellCastingEnabled?: boolean
    spellCastingFrequency?: string
    spellAllowsSlotCasting?: boolean
  },
  ctx: z.RefinementCtx,
): void {
  const hasAvailability = row.spellAvailability === true
  const hasCasting = row.spellCastingEnabled === true

  if (!hasAvailability && !hasCasting) {
    ctx.addIssue({
      code: 'custom',
      message: 'Enable availability, casting, or both for this spell grant.',
      path: ['spellAvailability'],
    })
  }

  if (hasCasting && !row.spellCastingFrequency) {
    ctx.addIssue({
      code: 'custom',
      message: 'Choose a cast frequency when casting is enabled.',
      path: ['spellCastingFrequency'],
    })
  }

  if (row.spellAllowsSlotCasting === true && !hasAvailability) {
    ctx.addIssue({
      code: 'custom',
      message: 'Slot casting requires always-prepared availability.',
      path: ['spellAllowsSlotCasting'],
    })
  }
}

function validateGrantRow(
  row: z.infer<ReturnType<typeof createGrantRowFormSchemaBase>>,
  ctx: z.RefinementCtx,
): void {
  if (row.grantType === 'equipment') {
    applyFormSchemaIssues(ctx, equipmentGrantItemFormSchema.safeParse(row))
    return
  }

  if (row.grantType === 'weaponProficiency') {
    applyFormSchemaIssues(ctx, weaponProficiencyItemFormSchema.safeParse(row))
    return
  }

  if (row.grantType === 'toolProficiency') {
    applyFormSchemaIssues(ctx, toolProficiencyItemFormSchema.safeParse(row))
    return
  }

  if (row.grantType === 'skillProficiency') {
    applyFormSchemaIssues(ctx, skillProficiencyItemFormSchema.safeParse(row))
    return
  }

  if (row.grantType === 'armorTraining') {
    applyFormSchemaIssues(ctx, armorTrainingItemFormSchema.safeParse(row))
    return
  }

  if (row.grantType === 'spells') {
    validateSpellsGrantRow(row, ctx)
  }
}

function createGrantRowFormSchemaBase(maxLevel: number = MAX_CHARACTER_LEVEL) {
  return z
    .object({
      grantType: z.enum(GRANT_ROW_TYPES),
      /**
       * Unlock level for this grant row. `undefined` = default group ("When feature is gained").
       * For class/subclass features this must be > feature.level; for species traits it is a
       * character level.
       */
      unlockLevel: z
        .union([
          z.literal(GRANT_DEFAULT_UNLOCK_LEVEL),
          z.coerce.number().pipe(campaignLevelSchema(maxLevel)),
        ])
        .optional(),
      resistances: z.array(damageTypeIdSchema).optional(),
      damageType: z.array(damageTypeIdSchema).optional(),
      senseType: senseIdSchema.optional(),
      senseRange: z.coerce.number().int().min(0).optional(),
      movementMode: movementModeSchema.optional(),
      movementOperation: movementOperationSchema.optional(),
      movementFeet: z.coerce.number().optional(),
      movementMatchMode: movementModeSchema.optional(),
      language: languageIdSchema.optional(),
      /** Spellcasting ability for a `spells` row. */
      spellAbility: abilitySchema.optional(),
      /** When true, grants `availability: always_prepared`. */
      spellAvailability: z.boolean().optional(),
      /** When true, grants a nested `casting` free-cast entitlement. */
      spellCastingEnabled: z.boolean().optional(),
      /** Usage frequency — required when `spellCastingEnabled` is true. */
      spellCastingFrequency: usageFrequencySchema.optional(),
      /** Optional slot-casting permission on the free-cast entitlement (requires availability in v1). */
      spellAllowsSlotCasting: z.boolean().optional(),
      /** Spell slugs granted by this row. */
      spellIds: z.array(z.string()).optional(),
      featCategory: featCategorySchema.optional(),
      featChoose: z.coerce.number().int().min(1).optional(),
      featAllowAnyQualifying: z.boolean().optional(),
      featReplaceable: z.boolean().optional(),
      featRecommendedIds: z.array(z.string()).optional(),
    })
    .merge(equipmentGrantRowFieldsSchema)
    .merge(proficiencyGrantRowFieldsSchema)
}

export function createGrantRowFormSchema(maxLevel: number = MAX_CHARACTER_LEVEL) {
  return createGrantRowFormSchemaBase(maxLevel).superRefine(validateGrantRow)
}

const grantRowFormSchemaBase = createGrantRowFormSchemaBase()
export const grantRowFormSchema = grantRowFormSchemaBase.superRefine(validateGrantRow)

export type GrantRowForm = z.infer<typeof grantRowFormSchema>
