import { formatSignedModifier } from '../../../runtime/creature/weapon-attack'
import type { EquipmentEffectTarget } from '../../../vocab/equipment/effect-target'
import { joinInlineMetadata } from '../../../primitives/inline-metadata'
import type { EquipmentBonusEffect } from './effect'
import type { EquipmentInstance } from './instance'
import { normalizeEquipmentInstance } from './normalize-equipment-instance'
import type { ResolvedEquipmentMagicProperties } from './resolve-equipment-magic-properties'

export function enhancementBonusOnTarget(
  magic: ResolvedEquipmentMagicProperties,
  target: EquipmentEffectTarget,
): number {
  let total = 0
  for (const row of magic.resolved) {
    if (row.definition.category !== 'enhancement') continue
    for (const effect of row.definition.effects) {
      if (effect.target === target) total += effect.bonus
    }
  }
  return total
}

export function adjustmentBonusOnTarget(
  entry: EquipmentInstance,
  target: EquipmentEffectTarget,
): number {
  const normalized = normalizeEquipmentInstance(entry)
  return (normalized.adjustments ?? [])
    .filter((row) => row.target === target)
    .reduce((sum, row) => sum + row.bonus, 0)
}

export function formatEquipmentMechanicalComponentSegments(args: {
  enhancementBonus?: number
  adjustmentBonus?: number
}): string[] {
  const segments: string[] = []
  if (args.enhancementBonus !== undefined && args.enhancementBonus !== 0) {
    segments.push(`${formatSignedModifier(args.enhancementBonus)} enhancement`)
  }
  if (args.adjustmentBonus !== undefined && args.adjustmentBonus !== 0) {
    segments.push(`${formatSignedModifier(args.adjustmentBonus)} adjustment`)
  }
  return segments
}

export function formatEquipmentMechanicalComponentsForTarget(
  entry: EquipmentInstance,
  magic: ResolvedEquipmentMagicProperties,
  target: EquipmentEffectTarget,
): string | undefined {
  const segments = formatEquipmentMechanicalComponentSegments({
    enhancementBonus: enhancementBonusOnTarget(magic, target),
    adjustmentBonus: adjustmentBonusOnTarget(entry, target),
  })
  return segments.length > 0 ? joinInlineMetadata(segments) : undefined
}

export function adjustmentMetadataSegments(
  adjustments: readonly EquipmentBonusEffect[] | undefined,
): string[] {
  if (!adjustments?.length) return []
  return adjustments.map((row) => `${formatSignedModifier(row.bonus)} adjustment`)
}
