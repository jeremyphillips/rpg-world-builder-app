import { z } from 'zod'

import {
  armorCategorySchema,
  getArmorCategoryEntry,
  getArmorCategoryLabel,
} from '../../vocab/armor/category'
import { gearKindSchema, getGearKindEntry, getGearKindLabel } from '../../vocab/equipment/gear-kind'
import {
  getServiceCategoryEntry,
  getServiceCategoryLabel,
  serviceCategorySchema,
} from '../../vocab/equipment/service-category'
import {
  getToolCategoryEntry,
  getToolCategoryLabel,
  toolCategorySchema,
} from '../../vocab/equipment/tool-category'
import {
  getVehicleCategoryEntry,
  getVehicleCategoryLabel,
  vehicleCategorySchema,
} from '../../vocab/equipment/vehicle-category'
import {
  getMagicItemCategoryEntry,
  getMagicItemCategoryLabel,
  magicItemCategorySchema,
} from '../../vocab/magic-item/category'
import {
  getMagicItemRarityEntry,
  getMagicItemRarityLabel,
  magicItemRaritySchema,
} from '../../vocab/magic-item/rarity'
import {
  getWeaponCategoryEntry,
  getWeaponCategoryLabel,
  weaponCategorySchema,
} from '../../vocab/weapon/category'
import { getTermSentenceForm, pluralizeTermLabel } from '../../vocab/types'
import { equipmentKindSchema, getEquipmentKindEntry, getEquipmentKindLabel } from '../equipment'
import { equipmentModifierSchema } from '../equipment/modifier'
import { contentPoolChoiceSchema } from './choice'
import { grantValidationMessages } from './grant-messages'

// ---------------------------------------------------------------------------
// Equipment grants — fixed items and pool choices for starting equipment,
// traits, and future contentGrants.equipment payloads.
// ---------------------------------------------------------------------------

const EQUIPMENT_KIND_CATEGORY_FIELDS = {
  tool: ['toolCategory'],
  weapon: ['weaponCategory'],
  armor: ['armorCategory'],
  adventuring_gear: ['gearKind'],
  magic_item: ['magicItemCategory', 'magicItemRarity'],
  vehicle: ['vehicleCategory'],
  service: ['serviceCategory'],
} as const

const EQUIPMENT_KINDS_WITHOUT_CATEGORY_FILTER = ['mount'] as const

type EquipmentKindWithCategoryFilter = keyof typeof EQUIPMENT_KIND_CATEGORY_FIELDS

const FILTERED_POOL_CATEGORY_FIELDS = [
  'toolCategory',
  'weaponCategory',
  'armorCategory',
  'gearKind',
  'magicItemCategory',
  'magicItemRarity',
  'vehicleCategory',
  'serviceCategory',
] as const

const FILTERED_POOL_CATEGORY_LABELS = {
  toolCategory: 'Tool category',
  weaponCategory: 'Weapon category',
  armorCategory: 'Armor category',
  gearKind: 'Gear kind',
  magicItemCategory: 'Magic item category',
  magicItemRarity: 'Magic item rarity',
  vehicleCategory: 'Vehicle category',
  serviceCategory: 'Service category',
} as const satisfies Record<(typeof FILTERED_POOL_CATEGORY_FIELDS)[number], string>

function refineFilteredEquipmentPool(
  val: {
    equipmentKind: z.infer<typeof equipmentKindSchema>
    toolCategory?: z.infer<typeof toolCategorySchema>
    weaponCategory?: z.infer<typeof weaponCategorySchema>
    armorCategory?: z.infer<typeof armorCategorySchema>
    gearKind?: z.infer<typeof gearKindSchema>
    magicItemCategory?: z.infer<typeof magicItemCategorySchema>
    magicItemRarity?: z.infer<typeof magicItemRaritySchema>
    vehicleCategory?: z.infer<typeof vehicleCategorySchema>
    serviceCategory?: z.infer<typeof serviceCategorySchema>
  },
  ctx: z.RefinementCtx,
): void {
  const allowedFields =
    EQUIPMENT_KIND_CATEGORY_FIELDS[val.equipmentKind as EquipmentKindWithCategoryFilter]

  for (const field of FILTERED_POOL_CATEGORY_FIELDS) {
    const category = val[field]
    if (category === undefined) continue

    if (
      (EQUIPMENT_KINDS_WITHOUT_CATEGORY_FILTER as readonly string[]).includes(val.equipmentKind)
    ) {
      ctx.addIssue({
        code: 'custom',
        message: grantValidationMessages.categoryFilterNotAllowedForKind({
          filterLabel: FILTERED_POOL_CATEGORY_LABELS[field],
          equipmentKindLabel: getEquipmentKindLabel(val.equipmentKind),
        }),
        path: [field],
      })
      continue
    }

    if (!(allowedFields as readonly string[] | undefined)?.includes(field)) {
      const expectedKind = Object.entries(EQUIPMENT_KIND_CATEGORY_FIELDS).find(([, fields]) =>
        (fields as readonly string[]).includes(field),
      )?.[0]
      ctx.addIssue({
        code: 'custom',
        message: grantValidationMessages.categoryFilterWrongKind({
          filterLabel: FILTERED_POOL_CATEGORY_LABELS[field],
          equipmentKindLabel: getEquipmentKindLabel(expectedKind ?? val.equipmentKind),
        }),
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
    toolCategory: toolCategorySchema.optional(),
    weaponCategory: weaponCategorySchema.optional(),
    armorCategory: armorCategorySchema.optional(),
    gearKind: gearKindSchema.optional(),
    magicItemCategory: magicItemCategorySchema.optional(),
    magicItemRarity: magicItemRaritySchema.optional(),
    vehicleCategory: vehicleCategorySchema.optional(),
    serviceCategory: serviceCategorySchema.optional(),
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

const LEGACY_CATEGORY_FIELD_MAP = [
  ['toolCategories', 'toolCategory'],
  ['weaponCategories', 'weaponCategory'],
  ['armorCategories', 'armorCategory'],
  ['gearKinds', 'gearKind'],
] as const

function normalizeFilteredPoolCategories(pool: Record<string, unknown>): Record<string, unknown> {
  const result = { ...pool }

  for (const [plural, singular] of LEGACY_CATEGORY_FIELD_MAP) {
    if (result[singular] !== undefined) {
      delete result[plural]
      continue
    }

    const categories = result[plural]
    if (Array.isArray(categories) && categories.length > 0) {
      result[singular] = categories[0]
    }
    delete result[plural]
  }

  return result
}

function poolFromLegacyFrom(
  fromRecord: Record<string, unknown>,
): Record<string, unknown> | undefined {
  const equipmentSlugs = fromRecord.equipmentSlugs
  if (Array.isArray(equipmentSlugs) && equipmentSlugs.length > 0) {
    return { source: 'explicit', equipmentSlugs }
  }

  const toolCategories = fromRecord.toolCategories
  if (Array.isArray(toolCategories) && toolCategories.length > 0) {
    return {
      source: 'filtered',
      equipmentKind: 'tool',
      toolCategory: toolCategories[0],
    }
  }

  return undefined
}

function resolveChoiceGrantPool(
  rawPool: unknown,
  legacyFrom: unknown,
): Record<string, unknown> | undefined {
  let pool = rawPool

  if (pool === undefined && typeof legacyFrom === 'object' && legacyFrom !== null) {
    pool = poolFromLegacyFrom(legacyFrom as Record<string, unknown>)
  }

  if (typeof pool === 'object' && pool !== null) {
    return normalizeFilteredPoolCategories(pool as Record<string, unknown>)
  }

  return undefined
}

/**
 * Maps legacy starting-equipment `from` pools to `pool` for records written before
 * the equipment-grant primitive (overlay patches, homebrew, stale Mongo rows).
 * Also strips legacy `label` and plural category arrays.
 */
export function normalizeEquipmentChoiceGrant(input: unknown): unknown {
  if (typeof input !== 'object' || input === null) return input

  const record = input as Record<string, unknown>
  if (record.kind !== 'choice') return input

  const { from: legacyFrom, label: _legacyLabel, pool: rawPool, ...rest } = record
  const pool = resolveChoiceGrantPool(rawPool, legacyFrom)

  return pool === undefined ? rest : { ...rest, pool }
}

export const equipmentChoiceGrantObjectSchema = contentPoolChoiceSchema
  .omit({ label: true })
  .extend({
    kind: z.literal('choice'),
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

  if (pool.toolCategory) {
    return getToolCategoryLabel(pool.toolCategory)
  }
  if (pool.weaponCategory) {
    return getWeaponCategoryLabel(pool.weaponCategory)
  }
  if (pool.armorCategory) {
    return getArmorCategoryLabel(pool.armorCategory)
  }
  if (pool.gearKind) {
    return getGearKindLabel(pool.gearKind)
  }
  if (pool.magicItemCategory) {
    return getMagicItemCategoryLabel(pool.magicItemCategory)
  }
  if (pool.magicItemRarity) {
    return getMagicItemRarityLabel(pool.magicItemRarity)
  }
  if (pool.vehicleCategory) {
    return getVehicleCategoryLabel(pool.vehicleCategory)
  }
  if (pool.serviceCategory) {
    return getServiceCategoryLabel(pool.serviceCategory)
  }

  return getEquipmentKindLabel(pool.equipmentKind)
}

function getEquipmentPoolSentenceEntry(pool: Extract<EquipmentPool, { source: 'filtered' }>) {
  if (pool.toolCategory) return getToolCategoryEntry(pool.toolCategory)
  if (pool.weaponCategory) return getWeaponCategoryEntry(pool.weaponCategory)
  if (pool.armorCategory) return getArmorCategoryEntry(pool.armorCategory)
  if (pool.gearKind) return getGearKindEntry(pool.gearKind)
  if (pool.magicItemCategory) return getMagicItemCategoryEntry(pool.magicItemCategory)
  if (pool.magicItemRarity) return getMagicItemRarityEntry(pool.magicItemRarity)
  if (pool.vehicleCategory) return getVehicleCategoryEntry(pool.vehicleCategory)
  if (pool.serviceCategory) return getServiceCategoryEntry(pool.serviceCategory)
  return getEquipmentKindEntry(pool.equipmentKind)
}

function formatEquipmentPoolSentenceForm(
  pool: Extract<EquipmentPool, { source: 'filtered' }>,
  count: number,
): string {
  const entry = getEquipmentPoolSentenceEntry(pool)
  if (entry) return getTermSentenceForm(entry, count)

  const fallbackLabel = formatEquipmentPoolLabel(pool)
  if (count === 1) return fallbackLabel.toLowerCase()
  return pluralizeTermLabel(fallbackLabel)
}

/** Human-readable summary for equipment grant array item headers. */
export function formatEquipmentGrantSentence(
  grant: EquipmentGrant,
  resolveEquipmentName?: (slug: string) => string | undefined,
): string {
  if (grant.kind === 'fixed') {
    const name = resolveEquipmentName?.(grant.equipmentSlug) ?? grant.equipmentSlug
    if (!name) return ''
    const quantity = grant.quantity ?? 1
    if (quantity === 1) {
      return `Character receives 1 ${name.toLowerCase()}.`
    }
    return `Character receives ${quantity} ${pluralizeTermLabel(name)}.`
  }

  const choose = grant.choose ?? 1
  const pool = grant.pool

  if (pool.source === 'explicit') {
    const names = pool.equipmentSlugs.map((slug) => resolveEquipmentName?.(slug) ?? slug)
    const itemWord = choose === 1 ? 'item' : 'items'
    return `Character chooses ${choose} ${itemWord} from: ${names.join(', ')}.`
  }

  const poolForm = formatEquipmentPoolSentenceForm(pool, choose)
  if (!poolForm) return ''
  return `Character chooses ${choose} ${poolForm}.`
}
