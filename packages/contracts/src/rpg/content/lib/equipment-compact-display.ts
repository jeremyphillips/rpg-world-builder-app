import type { Equipment, EquipmentKind } from '../equipment'
import {
  formatWeaponDamage,
  getArmorAcDisplay,
  getEquipmentKindLabel,
  getEquipmentSpellcastingGearKind,
} from '../equipment'
import { getArmorCategoryLabel } from '../../vocab/armor/category'
import { getPhysicalDamageTypeLabel } from '../../vocab/damage/physical'
import { getGearKindLabel } from '../../vocab/equipment/gear-kind'
import {
  formatHolySymbolUsage,
  getHolySymbolUsageLabel,
} from '../../vocab/equipment/holy-symbol-usage'
import { getServiceCategoryLabel } from '../../vocab/equipment/service-category'
import { getSpellcastingGearKindLabel } from '../../vocab/equipment/spellcasting-gear-kind'
import { getToolCategoryLabel } from '../../vocab/equipment/tool-category'
import { getVehicleCategoryLabel } from '../../vocab/equipment/vehicle-category'
import { getMagicItemCategoryLabel } from '../../vocab/magic-item/category'
import { getMagicItemRarityLabel } from '../../vocab/magic-item/rarity'
import { getWeaponPropertyLabel } from '../../vocab/weapon/property'
import {
  formatMass,
  formatSpeedRate,
  formatWeight,
  MOUNT_CARRYING_CAPACITY_LABEL,
} from '../../primitives/units'

export const EQUIPMENT_COMPACT_SEPARATOR = ' · '

export const EQUIPMENT_COMPACT_DEFAULT_MAX_SEGMENTS = 3

export type CompactFieldId =
  | 'damage'
  | 'properties'
  | 'armorClass'
  | 'category'
  | 'magicItemCategory'
  | 'restriction'
  | 'weight'
  | 'gearKind'
  | 'spellcastingGearKind'
  | 'holySymbolUsage'
  | 'capacity'
  | 'bundleSize'
  | 'crafts'
  | 'speed'
  | 'trait'
  | 'rarity'
  | 'attunement'
  | 'primaryMechanic'

export type CompactFieldSlot = CompactFieldId | { firstAvailable: CompactFieldId[] }

export type EquipmentCompactLayout = {
  fields: CompactFieldSlot[]
  maxSegments?: number
}

export type EquipmentCompactSummary = {
  kindLabel: string
  /**
   * Curated comparison groups for collapsed picker metadata.
   * Each group is one top-level fact; a group may contain internal · joins.
   */
  comparisonGroups: readonly string[]
}

export function joinCompactSegments(...segments: Array<string | undefined>): string | undefined {
  const values = segments
    .map((segment) => segment?.trim())
    .filter((segment): segment is string => {
      return Boolean(segment)
    })

  return values.length > 0 ? values.join(EQUIPMENT_COMPACT_SEPARATOR) : undefined
}

function normalizeCompactSegment(value: string): string {
  return value.trim().toLowerCase()
}

function isRedundantCompactSegment(
  segment: string,
  comparisonGroups: readonly string[],
  kindLabel: string,
): boolean {
  const normalized = normalizeCompactSegment(segment)
  if (normalized === normalizeCompactSegment(kindLabel)) return true
  return comparisonGroups.some((existing) => normalizeCompactSegment(existing) === normalized)
}

function formatCompactWeaponProperties(equipment: Equipment): string | undefined {
  if (equipment.kind !== 'weapon' || equipment.properties.length === 0) return undefined
  return equipment.properties
    .map((property) => getWeaponPropertyLabel(property))
    .join(EQUIPMENT_COMPACT_SEPARATOR)
}

function formatCompactDamage(equipment: Equipment): string | undefined {
  if (equipment.kind !== 'weapon' || !equipment.damage || !equipment.damageType) return undefined
  return `${formatWeaponDamage(equipment.damage)} ${getPhysicalDamageTypeLabel(equipment.damageType)}`
}

function formatCompactProperties(equipment: Equipment): string | undefined {
  if (equipment.kind === 'weapon') return formatCompactWeaponProperties(equipment)
  if (equipment.kind !== 'adventuring_gear' || !equipment.properties?.length) return undefined
  return equipment.properties.join(EQUIPMENT_COMPACT_SEPARATOR)
}

function formatCompactArmorClass(equipment: Equipment): string | undefined {
  if (equipment.kind !== 'armor') return undefined
  const ac = getArmorAcDisplay(equipment)
  return equipment.category === 'shields' ? `${ac} AC` : `AC ${ac}`
}

function formatCompactCategory(equipment: Equipment): string | undefined {
  switch (equipment.kind) {
    case 'armor':
      return getArmorCategoryLabel(equipment.category)
    case 'tool':
      return getToolCategoryLabel(equipment.toolCategory)
    case 'vehicle':
      return getVehicleCategoryLabel(equipment.vehicleCategory)
    case 'service':
      return getServiceCategoryLabel(equipment.serviceCategory)
    default:
      return undefined
  }
}

function formatCompactMagicItemCategory(equipment: Equipment): string | undefined {
  if (equipment.kind !== 'magic_item' || !equipment.magicItemCategory) return undefined
  return getMagicItemCategoryLabel(equipment.magicItemCategory)
}

function formatCompactRestriction(equipment: Equipment): string | undefined {
  if (equipment.kind !== 'armor' || equipment.category === 'shields') return undefined
  if (equipment.strengthRequirement !== undefined) {
    return `Str ${equipment.strengthRequirement} required`
  }
  if (equipment.stealthDisadvantage) return 'Stealth disadvantage'
  return undefined
}

function formatCompactWeight(equipment: Equipment): string | undefined {
  if (!('weight' in equipment) || !equipment.weight) return undefined
  return formatWeight(equipment.weight)
}

function formatCompactGearKind(equipment: Equipment): string | undefined {
  if (equipment.kind !== 'adventuring_gear') return undefined
  return getGearKindLabel(equipment.gearKind)
}

function formatCompactSpellcastingGearKind(equipment: Equipment): string | undefined {
  const spellcastingGearKind = getEquipmentSpellcastingGearKind(equipment)
  if (!spellcastingGearKind) return undefined
  return getSpellcastingGearKindLabel(spellcastingGearKind)
}

function formatCompactHolySymbolUsage(equipment: Equipment): string | undefined {
  if (equipment.kind !== 'adventuring_gear' || !equipment.holySymbolUsage?.length) return undefined
  if (equipment.holySymbolUsage.length === 1) {
    return getHolySymbolUsageLabel(equipment.holySymbolUsage[0]!)
  }
  if (equipment.holySymbolUsage.length === 2) {
    const [first, second] = equipment.holySymbolUsage
    return `${getHolySymbolUsageLabel(first!)} or ${getHolySymbolUsageLabel(second!).toLowerCase()}`
  }
  return formatHolySymbolUsage(equipment.holySymbolUsage)
}

function formatCompactCapacity(equipment: Equipment): string | undefined {
  if (equipment.kind === 'adventuring_gear' && equipment.capacity) return equipment.capacity
  if (equipment.kind === 'mount')
    return `${MOUNT_CARRYING_CAPACITY_LABEL} ${formatMass(equipment.carryingCapacity)}`
  return undefined
}

function formatCompactBundleSize(equipment: Equipment): string | undefined {
  if (equipment.kind !== 'adventuring_gear' || equipment.bundleSize === undefined) return undefined
  return `${equipment.bundleSize} pieces`
}

function formatCompactCrafts(equipment: Equipment): string | undefined {
  if (equipment.kind !== 'tool' || !equipment.crafts?.length) return undefined
  return joinCompactSegments(...equipment.crafts.slice(0, 2))
}

function formatCompactSpeed(equipment: Equipment): string | undefined {
  if (equipment.kind !== 'mount') return undefined
  return formatSpeedRate(equipment.speed)
}

function formatCompactTrait(_equipment: Equipment): string | undefined {
  return undefined
}

function formatCompactRarity(equipment: Equipment): string | undefined {
  if (equipment.kind !== 'magic_item' || !equipment.rarity) return undefined
  return getMagicItemRarityLabel(equipment.rarity)
}

function formatCompactAttunement(equipment: Equipment): string | undefined {
  if (equipment.kind !== 'magic_item' || !equipment.requiresAttunement) return undefined
  return 'Requires attunement'
}

/** TODO(compact-display): consumable-uses — model `uses` on adventuring gear consumables. */
function formatCompactPrimaryMechanic(_equipment: Equipment): string | undefined {
  return undefined
}

const COMPACT_FIELD_FORMATTERS: Record<
  CompactFieldId,
  (equipment: Equipment) => string | undefined
> = {
  damage: formatCompactDamage,
  properties: formatCompactProperties,
  armorClass: formatCompactArmorClass,
  category: formatCompactCategory,
  magicItemCategory: formatCompactMagicItemCategory,
  restriction: formatCompactRestriction,
  weight: formatCompactWeight,
  gearKind: formatCompactGearKind,
  spellcastingGearKind: formatCompactSpellcastingGearKind,
  holySymbolUsage: formatCompactHolySymbolUsage,
  capacity: formatCompactCapacity,
  bundleSize: formatCompactBundleSize,
  crafts: formatCompactCrafts,
  speed: formatCompactSpeed,
  trait: formatCompactTrait,
  rarity: formatCompactRarity,
  attunement: formatCompactAttunement,
  primaryMechanic: formatCompactPrimaryMechanic,
}

export const COMPACT_METADATA_LAYOUT = {
  weapon: {
    fields: ['damage', 'properties'],
  },
  armor: {
    fields: ['armorClass', 'category', { firstAvailable: ['restriction', 'weight'] }],
  },
  tool: {
    fields: ['category', { firstAvailable: ['crafts', 'weight'] }],
  },
  mount: {
    fields: ['speed', { firstAvailable: ['capacity', 'trait'] }],
  },
  magic_item: {
    fields: ['magicItemCategory', 'rarity', 'attunement'],
  },
  vehicle: {
    fields: ['category'],
  },
  service: {
    fields: ['category'],
  },
} satisfies Partial<Record<EquipmentKind, EquipmentCompactLayout>>

const ADVENTURING_GEAR_BRANCH_LAYOUTS = {
  holy_symbol: {
    fields: ['spellcastingGearKind', 'holySymbolUsage'],
  },
  spellcasting: {
    fields: ['spellcastingGearKind', { firstAvailable: ['weight'] }],
  },
  container: {
    fields: ['gearKind', 'capacity', { firstAvailable: ['weight'] }],
  },
  ammunition: {
    fields: ['gearKind', 'bundleSize', { firstAvailable: ['weight'] }],
  },
  consumable: {
    fields: ['gearKind', 'primaryMechanic'],
  },
} satisfies Record<string, EquipmentCompactLayout>

function resolveAdventuringGearLayout(
  equipment: Extract<Equipment, { kind: 'adventuring_gear' }>,
): EquipmentCompactLayout {
  if (equipment.gearKind === 'spellcasting' && equipment.spellcastingGearKind === 'holy_symbol') {
    return ADVENTURING_GEAR_BRANCH_LAYOUTS.holy_symbol
  }
  if (equipment.gearKind === 'spellcasting') {
    return ADVENTURING_GEAR_BRANCH_LAYOUTS.spellcasting
  }
  if (equipment.gearKind === 'container') {
    return ADVENTURING_GEAR_BRANCH_LAYOUTS.container
  }
  if (equipment.gearKind === 'ammunition') {
    return ADVENTURING_GEAR_BRANCH_LAYOUTS.ammunition
  }
  if (equipment.gearKind === 'consumable') {
    return ADVENTURING_GEAR_BRANCH_LAYOUTS.consumable
  }

  return {
    fields: ['gearKind', { firstAvailable: ['bundleSize', 'capacity', 'weight'] }],
  }
}

function resolveEquipmentCompactLayout(equipment: Equipment): EquipmentCompactLayout {
  if (equipment.kind === 'adventuring_gear') {
    return resolveAdventuringGearLayout(equipment)
  }

  return COMPACT_METADATA_LAYOUT[equipment.kind] ?? { fields: [] }
}

function formatCompactField(equipment: Equipment, fieldId: CompactFieldId): string | undefined {
  return COMPACT_FIELD_FORMATTERS[fieldId](equipment)
}

function pushCompactSegment(
  comparisonGroups: string[],
  segment: string | undefined,
  kindLabel: string,
  maxSegments: number,
): boolean {
  if (!segment || comparisonGroups.length >= maxSegments)
    return comparisonGroups.length >= maxSegments
  if (isRedundantCompactSegment(segment, comparisonGroups, kindLabel)) {
    return comparisonGroups.length >= maxSegments
  }
  comparisonGroups.push(segment)
  return comparisonGroups.length >= maxSegments
}

function assembleComparisonGroups(
  equipment: Equipment,
  layout: EquipmentCompactLayout,
  kindLabel: string,
): string[] {
  const maxSegments = layout.maxSegments ?? EQUIPMENT_COMPACT_DEFAULT_MAX_SEGMENTS
  const comparisonGroups: string[] = []

  for (const slot of layout.fields) {
    if (comparisonGroups.length >= maxSegments) break

    if (typeof slot === 'string') {
      if (
        pushCompactSegment(
          comparisonGroups,
          formatCompactField(equipment, slot),
          kindLabel,
          maxSegments,
        )
      ) {
        break
      }
      continue
    }

    for (const fieldId of slot.firstAvailable) {
      const segment = formatCompactField(equipment, fieldId)
      if (!segment || isRedundantCompactSegment(segment, comparisonGroups, kindLabel)) continue
      comparisonGroups.push(segment)
      break
    }
  }

  return comparisonGroups
}

export function buildEquipmentCompactSummary(equipment: Equipment): EquipmentCompactSummary {
  const kindLabel = getEquipmentKindLabel(equipment.kind)
  const layout = resolveEquipmentCompactLayout(equipment)

  return {
    kindLabel,
    comparisonGroups: assembleComparisonGroups(equipment, layout, kindLabel),
  }
}
