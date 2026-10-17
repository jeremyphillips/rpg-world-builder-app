import type { Equipment } from '../../equipment'
import { formatSignedModifier } from '../../../runtime/creature/weapon-attack'
import type { EquipmentEffectWarning } from './equipment-effect-warnings'
import { resolveEquipmentEffectWarnings } from './equipment-effect-warnings'
import type { EquipmentInstance } from './instance'
import type { MagicPropertyDefinitionProvider } from './magic-property'
import { normalizeEquipmentInstance } from './normalize-equipment-instance'
import { adjustmentMetadataSegments } from './equipment-mechanical-metadata'
import {
  resolveEquipmentMagicProperties,
  type ResolvedEquipmentMagicProperties,
} from './resolve-equipment-magic-properties'

export const EQUIPMENT_INSTANCE_VISIBLE_PROPERTY_NAME_LIMIT = 2

export type EquipmentInstanceIntegrityWarning = {
  kind: 'unknown_property' | 'inapplicable_property'
  propertyId: string
}

export type EquipmentInstanceSummary = {
  displayName: string
  equipped: boolean
  magical: boolean
  metadataSegments: string[]
  integrityWarnings: EquipmentInstanceIntegrityWarning[]
  advisories: EquipmentEffectWarning[]
  adjustmentCount: number
  /** True when `displayName` already suffixes the enhancement bonus. */
  enhancementInDisplayName: boolean
}

export type ResolveEquipmentInstanceSummaryOptions = {
  visiblePropertyNameLimit?: number
}

function resolveEnhancementBonus(magic: ResolvedEquipmentMagicProperties): number | undefined {
  const enhancement = magic.resolved.find((row) => row.definition.category === 'enhancement')
  if (!enhancement) return undefined
  const attack = enhancement.definition.effects.find((effect) => effect.target === 'attack_roll')
  if (attack) return attack.bonus
  const ac = enhancement.definition.effects.find((effect) => effect.target === 'armor_class')
  if (ac) return ac.bonus
  return undefined
}

function buildPropertyNameSegments(args: {
  normalized: EquipmentInstance
  item: Equipment
  provider: MagicPropertyDefinitionProvider
  limit: number
  integrityWarnings: EquipmentInstanceIntegrityWarning[]
}): string[] {
  const { normalized, item, provider, limit, integrityWarnings } = args
  const magic = resolveEquipmentMagicProperties(normalized, item, provider)
  const allNames: string[] = []

  for (const row of normalized.magicProperties ?? []) {
    if (row.kind === 'custom') {
      allNames.push(row.name)
      continue
    }
    if (magic.unresolved.some((unresolved) => unresolved.propertyId === row.propertyId)) {
      integrityWarnings.push({ kind: 'unknown_property', propertyId: row.propertyId })
      continue
    }
    if (
      magic.inapplicable.some((inapplicable) => inapplicable.entry.propertyId === row.propertyId)
    ) {
      integrityWarnings.push({ kind: 'inapplicable_property', propertyId: row.propertyId })
      continue
    }
    const resolved = magic.resolved.find(
      (candidate) => candidate.entry.propertyId === row.propertyId,
    )
    if (!resolved || resolved.definition.category === 'enhancement') continue
    allNames.push(resolved.definition.name)
  }

  const segments = allNames.slice(0, limit)
  const remainder = allNames.length - limit
  if (remainder > 0) {
    segments.push(`+${remainder} ${remainder === 1 ? 'property' : 'properties'}`)
  }
  return segments
}

function resolveDisplayName(args: {
  entry: EquipmentInstance
  item: Equipment | undefined
  enhancementBonus: number | undefined
}): string {
  const { entry, item, enhancementBonus } = args
  if (entry.customName) return entry.customName
  if (!item) return entry.equipmentId
  if (enhancementBonus === undefined) return item.name
  return `${item.name} ${formatSignedModifier(enhancementBonus)}`
}

export function resolveEquipmentInstanceSummary(
  entry: EquipmentInstance,
  item: Equipment | undefined,
  provider: MagicPropertyDefinitionProvider,
  options?: ResolveEquipmentInstanceSummaryOptions,
): EquipmentInstanceSummary {
  const normalized = normalizeEquipmentInstance(entry)
  const limit = options?.visiblePropertyNameLimit ?? EQUIPMENT_INSTANCE_VISIBLE_PROPERTY_NAME_LIMIT
  const integrityWarnings: EquipmentInstanceIntegrityWarning[] = []

  const magic = item ? resolveEquipmentMagicProperties(normalized, item, provider) : undefined
  const enhancementBonus = magic ? resolveEnhancementBonus(magic) : undefined
  const displayName = resolveDisplayName({ entry: normalized, item, enhancementBonus })

  const metadataSegments = item
    ? buildPropertyNameSegments({
        normalized,
        item,
        provider,
        limit,
        integrityWarnings,
      })
    : []

  if (normalized.customName && enhancementBonus !== undefined) {
    metadataSegments.push(`${formatSignedModifier(enhancementBonus)} enhancement`)
  }

  metadataSegments.push(...adjustmentMetadataSegments(normalized.adjustments))
  const adjustmentCount = (normalized.adjustments ?? []).length

  const advisories =
    item !== undefined ? resolveEquipmentEffectWarnings({ entry: normalized, item, provider }) : []

  return {
    displayName,
    equipped: Boolean(normalized.equipped),
    magical: Boolean(normalized.magical),
    metadataSegments,
    integrityWarnings,
    advisories,
    adjustmentCount,
    enhancementInDisplayName: !normalized.customName && enhancementBonus !== undefined,
  }
}
