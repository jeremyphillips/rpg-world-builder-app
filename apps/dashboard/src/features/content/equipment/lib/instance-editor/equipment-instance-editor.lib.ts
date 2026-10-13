import { loadSeedMagicProperties } from '@rpg/catalog/magic-properties'
import type {
  Equipment,
  EquipmentInstance,
  MagicPropertyDefinition,
  MagicPropertyDefinitionProvider,
  SystemRulesetId,
} from '@rpg/contracts'
type EquipmentEffectTarget = 'attack_roll' | 'damage_roll' | 'armor_class'

function equipmentArmorRole(item: Equipment): 'body-armor' | 'shield' | 'other' {
  if (item.kind !== 'armor') return 'other'
  return item.category === 'shields' ? 'shield' : 'body-armor'
}

export function equipmentInstanceEditorKindHeadline(item: Equipment | undefined): string {
  if (!item) return 'Edit gear'
  if (item.kind === 'weapon') return 'Edit weapon'
  if (item.kind === 'armor') {
    return equipmentArmorRole(item) === 'shield' ? 'Edit shield' : 'Edit armor'
  }
  return 'Edit gear'
}

export function allowedEffectTargetsForEquipment(
  item: Equipment | undefined,
): EquipmentEffectTarget[] {
  if (!item) return ['armor_class']
  if (item.kind === 'weapon') return ['attack_roll', 'damage_roll']
  return ['armor_class']
}

export function magicPropertyAppliesToItem(
  definition: MagicPropertyDefinition,
  item: Equipment,
): boolean {
  if (item.kind === 'weapon') return definition.appliesTo.includes('weapon')
  if (item.kind === 'armor') {
    const role = equipmentArmorRole(item)
    if (role === 'shield') return definition.appliesTo.includes('shield')
    return definition.appliesTo.includes('armor')
  }
  return false
}

export function listPresetMagicPropertiesForItem(
  rulesetId: SystemRulesetId,
  item: Equipment,
): MagicPropertyDefinition[] {
  return loadSeedMagicProperties(rulesetId).filter((row) => magicPropertyAppliesToItem(row, item))
}

const EFFECT_TARGET_LABELS: Record<EquipmentEffectTarget, string> = {
  attack_roll: 'Attack rolls',
  damage_roll: 'Damage rolls',
  armor_class: 'Armor Class',
}

export function effectTargetLabel(target: EquipmentEffectTarget): string {
  return EFFECT_TARGET_LABELS[target]
}

export function stripMagicPropertiesOnDone(draft: EquipmentInstance): EquipmentInstance {
  if (draft.magical) return draft
  return { ...draft, magicProperties: undefined }
}

export function createDefaultMagicPropertyProvider(
  rulesetId: SystemRulesetId,
): MagicPropertyDefinitionProvider {
  const byId = new Map(loadSeedMagicProperties(rulesetId).map((row) => [row.id, row]))
  return (id) => byId.get(id)
}
