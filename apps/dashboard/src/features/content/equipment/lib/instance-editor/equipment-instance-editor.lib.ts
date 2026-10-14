import { loadSeedMagicProperties } from '@rpg/catalog/magic-properties'
import {
  EQUIPMENT_EFFECT_TARGET_ENTRIES,
  type Equipment,
  type EquipmentEffectTarget,
  type EquipmentEffectTotals,
  type EquipmentInstance,
  type MagicPropertyDefinition,
  type MagicPropertyDefinitionProvider,
  type ResolvedEquipmentMagicProperties,
  type SystemRulesetId,
} from '@rpg/contracts'

import type { PropertyBrowseDraft } from './equipment-editor-types'

const MECHANICAL_MODIFIER_TARGETS = [
  'attack_roll',
  'damage_roll',
  'armor_class',
] as const satisfies readonly EquipmentEffectTarget[]

export type PresetPropertyBrowseAction = 'add' | 'replace' | 'added'

export type PresetPropertyBrowseChoice = {
  action: PresetPropertyBrowseAction
  replacePropertyId?: string
}

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

export function effectTargetLabel(target: EquipmentEffectTarget): string {
  return EQUIPMENT_EFFECT_TARGET_ENTRIES[target].label
}

export function effectTargetDescription(target: EquipmentEffectTarget): string {
  return EQUIPMENT_EFFECT_TARGET_ENTRIES[target].description
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

export function overlappingMechanicalModifierTargets(args: {
  draft: EquipmentInstance
  magic: ResolvedEquipmentMagicProperties
  totals: EquipmentEffectTotals
}): EquipmentEffectTarget[] {
  const manualTargets = new Set((args.draft.adjustments ?? []).map((effect) => effect.target))
  return MECHANICAL_MODIFIER_TARGETS.filter((target) => {
    const hasEnhancement = args.magic.resolved.some(
      (row) =>
        row.definition.category === 'enhancement' &&
        row.definition.effects.some((effect) => effect.target === target),
    )
    return manualTargets.has(target) && hasEnhancement && args.totals[target] !== 0
  })
}

export function filterPresetMagicPropertiesForBrowse(
  presets: readonly MagicPropertyDefinition[],
  draft: PropertyBrowseDraft,
): MagicPropertyDefinition[] {
  const query = draft.query.trim().toLowerCase()
  return presets.filter((row) => {
    if (draft.category === 'enhancement' && row.category !== 'enhancement') return false
    if (!query) return true
    return row.name.toLowerCase().includes(query)
  })
}

export function presetPropertyBrowseChoice(
  sessionDraft: EquipmentInstance,
  propertyId: string,
): PresetPropertyBrowseChoice {
  const added =
    sessionDraft.magicProperties?.some(
      (row) => row.kind === 'preset' && row.propertyId === propertyId,
    ) ?? false
  const currentPreset = sessionDraft.magicProperties?.find((row) => row.kind === 'preset')
  const replacePropertyId = currentPreset?.kind === 'preset' ? currentPreset.propertyId : undefined
  if (added) return { action: 'added', replacePropertyId }
  if (replacePropertyId) return { action: 'replace', replacePropertyId }
  return { action: 'add' }
}
