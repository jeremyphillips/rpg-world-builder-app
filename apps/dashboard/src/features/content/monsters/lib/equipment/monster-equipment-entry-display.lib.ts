import {
  formatSignedModifier,
  joinInlineMetadata,
  resolveEquipmentMagicProperties,
  type Equipment,
  type MagicPropertyDefinitionProvider,
  type Monster,
} from '@rpg/contracts'

import type { MonsterEquipmentFormEntry } from '../monster-form-values'

// fallow-ignore-next-line complexity
export function formatMonsterEquipmentRowMetadata(args: {
  entry: MonsterEquipmentFormEntry
  item: Equipment | undefined
  provider: MagicPropertyDefinitionProvider
}): string {
  const { entry, item, provider } = args
  if (!item) return ''

  const segments: string[] = []
  if (entry.equipped) segments.push('Equipped')

  const magic = resolveEquipmentMagicProperties(entry, item, provider)
  const enhancement = magic.resolved.find((row) => row.definition.category === 'enhancement')
  const propertyCount =
    (entry.magicProperties?.length ?? 0) -
    (enhancement ? 1 : 0) +
    magic.custom.length +
    magic.unresolved.length

  if (enhancement) {
    const bonus =
      enhancement.definition.effects.find((effect) => effect.target === 'attack_roll')?.bonus ??
      enhancement.definition.effects.find((effect) => effect.target === 'armor_class')?.bonus ??
      enhancement.definition.effects[0]?.bonus ??
      1
    segments.push(`${formatSignedModifier(bonus)} enhancement`)
  } else if (entry.magical) {
    segments.push('Magical')
  }

  if (propertyCount > 0) {
    segments.push(`${propertyCount} ${propertyCount === 1 ? 'property' : 'properties'}`)
  }

  const effectCount = entry.mechanicalEffects?.length ?? 0
  if (effectCount > 0) {
    segments.push(`${effectCount} ${effectCount === 1 ? 'effect' : 'effects'}`)
  }

  if (magic.unresolved.length > 0) {
    segments.push(
      `${magic.unresolved.length} unknown ${magic.unresolved.length === 1 ? 'property' : 'properties'}`,
    )
  }

  return joinInlineMetadata(segments)
}

export function formatMechanicalEffectCardMetadata(bonus: number): string {
  return `${formatSignedModifier(bonus)} modifier`
}

export type MonsterEquipmentFormEntryFields = Monster['equipment'][number]
