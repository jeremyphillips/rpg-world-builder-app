import { formatSignedModifier } from '../../../runtime/creature/weapon-attack'
import {
  EQUIPMENT_EFFECT_TARGET_ENTRIES,
  type EquipmentEffectTarget,
} from '../../../vocab/equipment/effect-target'
import { getTermSentenceForm } from '../../../vocab/types'
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

function formatTargetBonusSegment(
  bonus: number,
  target: Extract<EquipmentEffectTarget, 'attack_roll' | 'damage_roll'>,
): string {
  return `${formatSignedModifier(bonus)} ${getTermSentenceForm(EQUIPMENT_EFFECT_TARGET_ENTRIES[target], 1)}`
}

function formatAdjustmentTargetSegment(
  bonus: number,
  target: Extract<EquipmentEffectTarget, 'attack_roll' | 'damage_roll'>,
): string {
  const kind = target === 'attack_roll' ? 'attack' : 'damage'
  return `${formatSignedModifier(bonus)} ${kind} adjustment`
}

function formatPairedBonusSegments(args: {
  attack: number
  damage: number
  source: 'enhancement' | 'adjustment'
  omitSharedSegment: boolean
}): string[] {
  const { attack, damage, source, omitSharedSegment } = args
  if (attack === 0 && damage === 0) return []
  if (source === 'adjustment') {
    const segments: string[] = []
    if (damage !== 0) segments.push(formatAdjustmentTargetSegment(damage, 'damage_roll'))
    if (attack !== 0) segments.push(formatAdjustmentTargetSegment(attack, 'attack_roll'))
    return segments
  }
  if (attack === damage) {
    if (omitSharedSegment) return []
    return formatEquipmentMechanicalComponentSegments({ enhancementBonus: attack })
  }
  const segments: string[] = []
  if (attack !== 0) segments.push(formatTargetBonusSegment(attack, 'attack_roll'))
  if (damage !== 0) segments.push(formatTargetBonusSegment(damage, 'damage_roll'))
  return segments
}

/**
 * Enhancement and adjustment source labels for attack and damage.
 * A shared enhancement already written into the display name is omitted.
 * Non-enhancement presets stay in effect totals; their names stay on the instance summary.
 */
export function formatEquipmentEffectSourceSegments(args: {
  entry: EquipmentInstance
  magic: ResolvedEquipmentMagicProperties
  omitSharedEnhancement: boolean
}): string[] {
  const enhancementAttack = enhancementBonusOnTarget(args.magic, 'attack_roll')
  const enhancementDamage = enhancementBonusOnTarget(args.magic, 'damage_roll')
  const sharedEnhancement = enhancementAttack !== 0 && enhancementAttack === enhancementDamage
  return [
    ...formatPairedBonusSegments({
      attack: enhancementAttack,
      damage: enhancementDamage,
      source: 'enhancement',
      omitSharedSegment: args.omitSharedEnhancement && sharedEnhancement,
    }),
    ...formatPairedBonusSegments({
      attack: adjustmentBonusOnTarget(args.entry, 'attack_roll'),
      damage: adjustmentBonusOnTarget(args.entry, 'damage_roll'),
      source: 'adjustment',
      omitSharedSegment: false,
    }),
  ]
}

export function adjustmentMetadataSegments(
  adjustments: readonly EquipmentBonusEffect[] | undefined,
): string[] {
  if (!adjustments?.length) return []
  return adjustments.map((row) => `${formatSignedModifier(row.bonus)} adjustment`)
}
