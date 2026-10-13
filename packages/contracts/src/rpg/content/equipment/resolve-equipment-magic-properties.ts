import type { Equipment } from '../equipment'
import type { EquipmentInstance } from './instance'
import type {
  EquipmentMagicPropertyEntry,
  MagicPropertyDefinition,
  MagicPropertyDefinitionProvider,
} from './magic-property'
import { equipmentMagicPropertyAppliesTo } from './equipment-magic-property-applies'
import { normalizeEquipmentInstance } from './normalize-equipment-instance'

export type ResolvedEquipmentMagicPropertyPreset = {
  entry: Extract<EquipmentMagicPropertyEntry, { kind: 'preset' }>
  definition: MagicPropertyDefinition
}

export type ResolvedEquipmentMagicProperties = {
  resolved: ResolvedEquipmentMagicPropertyPreset[]
  custom: Extract<EquipmentMagicPropertyEntry, { kind: 'custom' }>[]
  unresolved: Extract<EquipmentMagicPropertyEntry, { kind: 'preset' }>[]
  inapplicable: ResolvedEquipmentMagicPropertyPreset[]
}

export function resolveEquipmentMagicProperties(
  entry: EquipmentInstance,
  item: Equipment,
  provider: MagicPropertyDefinitionProvider,
): ResolvedEquipmentMagicProperties {
  const normalized = normalizeEquipmentInstance(entry)
  const rows = normalized.magicProperties ?? []
  const resolved: ResolvedEquipmentMagicPropertyPreset[] = []
  const custom: Extract<EquipmentMagicPropertyEntry, { kind: 'custom' }>[] = []
  const unresolved: Extract<EquipmentMagicPropertyEntry, { kind: 'preset' }>[] = []
  const inapplicable: ResolvedEquipmentMagicPropertyPreset[] = []

  for (const row of rows) {
    if (row.kind === 'custom') {
      custom.push(row)
      continue
    }
    const definition = provider(row.propertyId)
    if (!definition) {
      unresolved.push(row)
      continue
    }
    const resolvedPreset = { entry: row, definition }
    if (!equipmentMagicPropertyAppliesTo(item, definition.appliesTo)) {
      inapplicable.push(resolvedPreset)
      continue
    }
    resolved.push(resolvedPreset)
  }

  return { resolved, custom, unresolved, inapplicable }
}
