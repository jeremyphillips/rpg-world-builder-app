import { z } from 'zod'

import { armorCategorySchema, getArmorCategoryLabel } from '../../vocab/armor/category'
import { gearKindSchema, getGearKindLabel } from '../../vocab/equipment/gear-kind'
import { getToolCategoryLabel, toolCategorySchema } from '../../vocab/equipment/tool-category'
import { getWeaponCategoryLabel, weaponCategorySchema } from '../../vocab/weapon/category'
import { equipmentKindSchema, getEquipmentKindLabel } from '../equipment'
import { equipmentModifierSchema } from '../equipment/modifier'
import { contentPoolChoiceSchema } from './choice'

// ---------------------------------------------------------------------------
// Equipment grants — fixed items and pool choices for starting equipment,
// traits, and future contentGrants.equipment payloads.
// ---------------------------------------------------------------------------

const EQUIPMENT_KIND_CATEGORY_FIELD = {
  tool: 'toolCategories',
  weapon: 'weaponCategories',
  armor: 'armorCategories',
  adventuring_gear: 'gearKinds',
} as const

const EQUIPMENT_KINDS_WITHOUT_CATEGORY_FILTER = [
  'mount',
  'vehicle',
  'service',
  'magic_item',
] as const

type EquipmentKindWithCategoryFilter = keyof typeof EQUIPMENT_KIND_CATEGORY_FIELD

const FILTERED_POOL_CATEGORY_FIELDS = [
  'toolCategories',
  'weaponCategories',
  'armorCategories',
  'gearKinds',
] as const

function refineFilteredEquipmentPool(
  val: {
    equipmentKind: z.infer<typeof equipmentKindSchema>
    toolCategories?: z.infer<typeof toolCategorySchema>[]
    weaponCategories?: z.infer<typeof weaponCategorySchema>[]
    armorCategories?: z.infer<typeof armorCategorySchema>[]
    gearKinds?: z.infer<typeof gearKindSchema>[]
  },
  ctx: z.RefinementCtx,
): void {
  const allowedField =
    EQUIPMENT_KIND_CATEGORY_FIELD[val.equipmentKind as EquipmentKindWithCategoryFilter]

  for (const field of FILTERED_POOL_CATEGORY_FIELDS) {
    const categories = val[field]
    if (categories === undefined || categories.length === 0) continue

    if (
      (EQUIPMENT_KINDS_WITHOUT_CATEGORY_FILTER as readonly string[]).includes(val.equipmentKind)
    ) {
      ctx.addIssue({
        code: 'custom',
        message: `category filters are not allowed when equipmentKind is ${val.equipmentKind}`,
        path: [field],
      })
      continue
    }

    if (allowedField !== field) {
      ctx.addIssue({
        code: 'custom',
        message: `${field} is not allowed when equipmentKind is ${val.equipmentKind}`,
        path: [field],
      })
    }
  }
}

const explicitEquipmentPoolSchema = z.object({
  source: z.literal('explicit'),
  equipmentSlugs: z.array(z.string().min(1)).min(1),
})

export type ExplicitEquipmentPool = z.infer<typeof explicitEquipmentPoolSchema>

const filteredEquipmentPoolSchema = z
  .object({
    source: z.literal('filtered'),
    equipmentKind: equipmentKindSchema,
    toolCategories: z.array(toolCategorySchema).min(1).optional(),
    weaponCategories: z.array(weaponCategorySchema).min(1).optional(),
    armorCategories: z.array(armorCategorySchema).min(1).optional(),
    gearKinds: z.array(gearKindSchema).min(1).optional(),
  })
  .superRefine(refineFilteredEquipmentPool)

export type FilteredEquipmentPool = z.infer<typeof filteredEquipmentPoolSchema>

export const equipmentPoolSchema = z.discriminatedUnion('source', [
  explicitEquipmentPoolSchema,
  filteredEquipmentPoolSchema,
])

export type EquipmentPool = z.infer<typeof equipmentPoolSchema>

export const fixedEquipmentGrantSchema = z.object({
  kind: z.literal('fixed'),
  /** Bare equipment slug; resolved to `{rulesetId}:{slug}` at build time. */
  equipmentSlug: z.string().min(1),
  quantity: z.number().int().min(1).default(1),
  equipped: z.boolean().optional(),
  modifiers: z.array(equipmentModifierSchema).optional(),
})

export type FixedEquipmentGrant = z.infer<typeof fixedEquipmentGrantSchema>

/**
 * Maps legacy starting-equipment `from` pools to `pool` for records written before
 * the equipment-grant primitive (overlay patches, homebrew, stale Mongo rows).
 */
export function normalizeEquipmentChoiceGrant(input: unknown): unknown {
  if (typeof input !== 'object' || input === null) return input

  const record = input as Record<string, unknown>
  if (record.kind !== 'choice' || record.pool !== undefined) return input

  const from = record.from
  if (typeof from !== 'object' || from === null) return input

  const fromRecord = from as Record<string, unknown>
  const { from: _legacyFrom, ...rest } = record

  const equipmentSlugs = fromRecord.equipmentSlugs
  if (Array.isArray(equipmentSlugs) && equipmentSlugs.length > 0) {
    return {
      ...rest,
      pool: { source: 'explicit', equipmentSlugs },
    }
  }

  const toolCategories = fromRecord.toolCategories
  if (Array.isArray(toolCategories) && toolCategories.length > 0) {
    return {
      ...rest,
      pool: {
        source: 'filtered',
        equipmentKind: 'tool',
        toolCategories,
      },
    }
  }

  return input
}

export const equipmentChoiceGrantObjectSchema = contentPoolChoiceSchema
  .extend({
    kind: z.literal('choice'),
    label: z.string().min(1),
    pool: equipmentPoolSchema,
  })
  .strict()

/** Standalone parse (forms, tests) — includes legacy `from` normalization. */
export const equipmentChoiceGrantSchema = z.preprocess(
  normalizeEquipmentChoiceGrant,
  equipmentChoiceGrantObjectSchema,
)

export type EquipmentChoiceGrant = z.infer<typeof equipmentChoiceGrantObjectSchema>

function normalizeEquipmentGrant(input: unknown): unknown {
  if (
    typeof input === 'object' &&
    input !== null &&
    (input as Record<string, unknown>).kind === 'choice'
  ) {
    return normalizeEquipmentChoiceGrant(input)
  }
  return input
}

export const equipmentGrantSchema = z.preprocess(
  normalizeEquipmentGrant,
  z.discriminatedUnion('kind', [fixedEquipmentGrantSchema, equipmentChoiceGrantObjectSchema]),
)

export type EquipmentGrant = z.infer<typeof equipmentGrantSchema>

/** Display label for a pool-backed equipment choice (titles, character builder). */
export function formatEquipmentPoolLabel(pool: EquipmentPool): string {
  if (pool.source === 'explicit') {
    return pool.equipmentSlugs.join(', ')
  }

  if (pool.toolCategories?.length === 1) {
    const category = pool.toolCategories[0]
    if (category) return getToolCategoryLabel(category)
  }
  if (pool.weaponCategories?.length === 1) {
    const category = pool.weaponCategories[0]
    if (category) return getWeaponCategoryLabel(category)
  }
  if (pool.armorCategories?.length === 1) {
    const category = pool.armorCategories[0]
    if (category) return getArmorCategoryLabel(category)
  }
  if (pool.gearKinds?.length === 1) {
    const kind = pool.gearKinds[0]
    if (kind) return getGearKindLabel(kind)
  }

  return getEquipmentKindLabel(pool.equipmentKind)
}
