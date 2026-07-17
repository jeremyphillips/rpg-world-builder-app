import { z } from 'zod'

import {
  armorCategorySchema,
  getArmorCategoryEntry,
  getArmorCategoryLabel,
} from '../../vocab/armor/category'
import { formatUnionBranchDescription } from '../../vocab/enum-schema'
import { gearKindSchema, getGearKindEntry, getGearKindLabel } from '../../vocab/equipment/gear-kind'
import {
  getSpellcastingGearKindEntry,
  getSpellcastingGearKindLabel,
  spellcastingGearKindSchema,
} from '../../vocab/equipment/spellcasting-gear-kind'
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
import { formatVocabularySlugLabel } from '../../vocab/format-slug-label'
import {
  equipmentKindSchema,
  getEquipmentKindEntry,
  getEquipmentKindLabel,
  type EquipmentKind,
} from '../equipment'
import { equipmentModifierSchema } from '../equipment/modifier'
import { contentPoolChoiceSchema } from './choice'
import { grantValidationMessages } from './grant-messages'

// ---------------------------------------------------------------------------
// Equipment grants — specific items and pool choices for starting equipment,
// traits, and contentGrants.equipment payloads.
//
// Core vocabulary (equipment-grant discriminant):
// - grant — automatic; a specific thing the character receives
// - choice — unresolved player decision; pick from a pool at character creation
// ---------------------------------------------------------------------------

const EQUIPMENT_KIND_CATEGORY_FIELDS = {
  tool: ['toolCategory'],
  weapon: ['weaponCategory'],
  armor: ['armorCategory'],
  adventuring_gear: ['gearKind', 'spellcastingGearKind'],
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
  'spellcastingGearKind',
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
  spellcastingGearKind: 'Spellcasting kind',
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
    spellcastingGearKind?: z.infer<typeof spellcastingGearKindSchema>
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

  if (
    val.spellcastingGearKind !== undefined &&
    val.gearKind !== undefined &&
    val.gearKind !== 'spellcasting'
  ) {
    ctx.addIssue({
      code: 'custom',
      message: grantValidationMessages.categoryFilterWrongKind({
        filterLabel: FILTERED_POOL_CATEGORY_LABELS.spellcastingGearKind,
        equipmentKindLabel: getGearKindLabel('spellcasting'),
      }),
      path: ['spellcastingGearKind'],
    })
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
    spellcastingGearKind: spellcastingGearKindSchema.optional(),
    magicItemCategory: magicItemCategorySchema.optional(),
    magicItemRarity: magicItemRaritySchema.optional(),
    vehicleCategory: vehicleCategorySchema.optional(),
    serviceCategory: serviceCategorySchema.optional(),
  })
  .superRefine(refineFilteredEquipmentPool)

export type FilteredEquipmentPool = z.infer<typeof filteredEquipmentPoolSchema>

const EQUIPMENT_POOL_SOURCE_DESCRIPTION = formatUnionBranchDescription('source', [
  'explicit',
  'filtered',
])

const EQUIPMENT_GRANT_KIND_DESCRIPTION = formatUnionBranchDescription('kind', ['grant', 'choice'])

export const equipmentPoolSchema = z
  .discriminatedUnion('source', [explicitEquipmentPoolSchema, filteredEquipmentPoolSchema])
  .describe(EQUIPMENT_POOL_SOURCE_DESCRIPTION)

export type EquipmentPool = z.infer<typeof equipmentPoolSchema>

export const grantedEquipmentItemSchema = z.object({
  kind: z.literal('grant'),
  /** Bare equipment slug; resolved to `{rulesetId}:{slug}` at build time. */
  equipmentSlug: z.string().min(1),
  quantity: z.number().int().min(1).default(1),
  equipped: z.boolean().optional(),
  modifiers: z.array(equipmentModifierSchema).optional(),
})

export type GrantedEquipmentItem = z.infer<typeof grantedEquipmentItemSchema>

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

const equipmentGrantObjectSchema = z
  .discriminatedUnion('kind', [grantedEquipmentItemSchema, equipmentChoiceGrantObjectSchema])
  .describe(EQUIPMENT_GRANT_KIND_DESCRIPTION)

export const equipmentGrantSchema = z.preprocess(
  normalizeEquipmentGrant,
  equipmentGrantObjectSchema,
)

export type EquipmentGrant = z.infer<typeof equipmentGrantSchema>

const FILTERED_POOL_CATEGORY_LABEL_RESOLVERS = [
  (pool: FilteredEquipmentPool) =>
    pool.toolCategory ? getToolCategoryLabel(pool.toolCategory) : undefined,
  (pool: FilteredEquipmentPool) =>
    pool.weaponCategory ? getWeaponCategoryLabel(pool.weaponCategory) : undefined,
  (pool: FilteredEquipmentPool) =>
    pool.armorCategory ? getArmorCategoryLabel(pool.armorCategory) : undefined,
  (pool: FilteredEquipmentPool) =>
    pool.spellcastingGearKind ? getSpellcastingGearKindLabel(pool.spellcastingGearKind) : undefined,
  (pool: FilteredEquipmentPool) => (pool.gearKind ? getGearKindLabel(pool.gearKind) : undefined),
  (pool: FilteredEquipmentPool) =>
    pool.magicItemCategory ? getMagicItemCategoryLabel(pool.magicItemCategory) : undefined,
  (pool: FilteredEquipmentPool) =>
    pool.magicItemRarity ? getMagicItemRarityLabel(pool.magicItemRarity) : undefined,
  (pool: FilteredEquipmentPool) =>
    pool.vehicleCategory ? getVehicleCategoryLabel(pool.vehicleCategory) : undefined,
  (pool: FilteredEquipmentPool) =>
    pool.serviceCategory ? getServiceCategoryLabel(pool.serviceCategory) : undefined,
] as const

const FILTERED_POOL_CATEGORY_ENTRY_RESOLVERS = [
  (pool: FilteredEquipmentPool) =>
    pool.toolCategory ? getToolCategoryEntry(pool.toolCategory) : undefined,
  (pool: FilteredEquipmentPool) =>
    pool.weaponCategory ? getWeaponCategoryEntry(pool.weaponCategory) : undefined,
  (pool: FilteredEquipmentPool) =>
    pool.armorCategory ? getArmorCategoryEntry(pool.armorCategory) : undefined,
  (pool: FilteredEquipmentPool) =>
    pool.spellcastingGearKind ? getSpellcastingGearKindEntry(pool.spellcastingGearKind) : undefined,
  (pool: FilteredEquipmentPool) => (pool.gearKind ? getGearKindEntry(pool.gearKind) : undefined),
  (pool: FilteredEquipmentPool) =>
    pool.magicItemCategory ? getMagicItemCategoryEntry(pool.magicItemCategory) : undefined,
  (pool: FilteredEquipmentPool) =>
    pool.magicItemRarity ? getMagicItemRarityEntry(pool.magicItemRarity) : undefined,
  (pool: FilteredEquipmentPool) =>
    pool.vehicleCategory ? getVehicleCategoryEntry(pool.vehicleCategory) : undefined,
  (pool: FilteredEquipmentPool) =>
    pool.serviceCategory ? getServiceCategoryEntry(pool.serviceCategory) : undefined,
] as const

function resolveFilteredPoolCategoryLabel(pool: FilteredEquipmentPool): string | undefined {
  for (const resolveLabel of FILTERED_POOL_CATEGORY_LABEL_RESOLVERS) {
    const label = resolveLabel(pool)
    if (label) return label
  }
  return undefined
}

/** Display label for a pool-backed equipment choice (titles, character builder). */
export function formatEquipmentPoolLabel(pool: EquipmentPool): string {
  if (pool.source === 'explicit') {
    return pool.equipmentSlugs.join(', ')
  }

  return resolveFilteredPoolCategoryLabel(pool) ?? (getEquipmentKindLabel(pool.equipmentKind) || '')
}

function getEquipmentPoolSentenceEntry(pool: FilteredEquipmentPool) {
  for (const resolveEntry of FILTERED_POOL_CATEGORY_ENTRY_RESOLVERS) {
    const entry = resolveEntry(pool)
    if (entry) return entry
  }
  return getEquipmentKindEntry(pool.equipmentKind)
}

function formatEquipmentPoolSentenceForm(
  pool: Extract<EquipmentPool, { source: 'filtered' }>,
  count: number,
): string {
  const entry = getEquipmentPoolSentenceEntry(pool)
  if (entry) return getTermSentenceForm(entry, count)

  const fallbackLabel = formatEquipmentPoolLabel(pool)
  if (!fallbackLabel) return ''
  if (count === 1) return fallbackLabel.toLowerCase()
  return pluralizeTermLabel(fallbackLabel)
}

/** Human-readable summary for equipment grant array item headers. */
export function formatEquipmentGrantSentence(
  grant: EquipmentGrant,
  resolveEquipmentName?: (slug: string) => string | undefined,
): string {
  if (grant.kind === 'grant') {
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

export type EquipmentGrantCompactResolver = {
  resolveEquipmentName?: (slug: string) => string | undefined
  resolveEquipmentKind?: (slug: string) => EquipmentKind | undefined
}

function formatCompactListSuffix(
  labels: string[],
  suffixSingular: string,
  suffixPlural: string,
): string | undefined {
  if (labels.length === 0) return undefined
  if (labels.length === 1) return `${labels[0]} ${suffixSingular}`
  return `${labels.join(', ')} ${suffixPlural}`
}

function resolveEquipmentSlugLabel(slug: string, resolver?: EquipmentGrantCompactResolver): string {
  return resolver?.resolveEquipmentName?.(slug) ?? formatVocabularySlugLabel(slug)
}

function resolveEquipmentSlugKind(
  slug: string,
  resolver?: EquipmentGrantCompactResolver,
): EquipmentKind | undefined {
  return resolver?.resolveEquipmentKind?.(slug)
}

function formatEquipmentItemLabelsCompact(
  labels: string[],
  kinds: (EquipmentKind | undefined)[],
): string | undefined {
  if (labels.length === 0) return undefined

  if (labels.every((_, index) => kinds[index] === 'service')) {
    return formatCompactListSuffix(labels, 'service', 'services')
  }

  const parts = labels.map((label, index) =>
    kinds[index] === 'service' ? `${label} service` : label,
  )
  return parts.join(', ')
}

function collectGrantedEquipmentLabels(
  grant: GrantedEquipmentItem,
  resolver?: EquipmentGrantCompactResolver,
): { labels: string[]; kinds: (EquipmentKind | undefined)[] } {
  const name = resolveEquipmentSlugLabel(grant.equipmentSlug, resolver)
  const kind = resolveEquipmentSlugKind(grant.equipmentSlug, resolver)
  const quantity = grant.quantity ?? 1

  return {
    labels: Array.from({ length: quantity }, () => name),
    kinds: Array.from({ length: quantity }, () => kind),
  }
}

/**
 * Compact summary label for equipment grants.
 * Adventuring gear, mounts, vehicles, and magic items use the resolved name only;
 * services append `service` / `services`.
 */
export function formatEquipmentGrantCompact(
  grant: EquipmentGrant,
  resolver?: EquipmentGrantCompactResolver,
): string | undefined {
  if (grant.kind === 'grant') {
    if (!grant.equipmentSlug) return undefined
    const { labels, kinds } = collectGrantedEquipmentLabels(grant, resolver)
    return formatEquipmentItemLabelsCompact(labels, kinds)
  }

  const pool = grant.pool
  if (pool.source === 'explicit') {
    const labels = pool.equipmentSlugs.map((slug) => resolveEquipmentSlugLabel(slug, resolver))
    const kinds = pool.equipmentSlugs.map((slug) => resolveEquipmentSlugKind(slug, resolver))
    return formatEquipmentItemLabelsCompact(labels, kinds)
  }

  const poolLabel = formatEquipmentPoolLabel(pool)
  if (!poolLabel) return undefined

  if (pool.equipmentKind === 'service') {
    return formatCompactListSuffix([poolLabel], 'service', 'services')
  }

  return poolLabel
}
