import type { Spell, SpellRecommendation } from '@rpg/contracts'

import { toContentFieldOption } from '../../lib/form-options/content-field-option.lib'

export const SPELLCASTING_RECOMMENDATION_TARGET_LABELS = {
  cantrips: 'Cantrips',
  level1Plus: 'Level 1 spells',
} as const

export function spellOptionsForRecommendationTarget(
  spells: readonly Spell[] | undefined,
  target: SpellRecommendation['target'],
) {
  const filtered = (spells ?? []).filter((spell) => {
    if (target === 'cantrips') return spell.level === 0
    return spell.level === 1
  })

  return filtered
    .map((spell) => toContentFieldOption(spell, 'spells'))
    .sort((left, right) => left.label.localeCompare(right.label))
}

export function readRecommendationSpellIds(
  recommendations: SpellRecommendation[] | undefined,
  target: SpellRecommendation['target'],
): string[] {
  return recommendations?.find((entry) => entry.target === target)?.spellIds ?? []
}

export function upsertRecommendationSpellIds(
  recommendations: SpellRecommendation[] | undefined,
  target: SpellRecommendation['target'],
  spellIds: string[],
): SpellRecommendation[] | undefined {
  const next = [...(recommendations ?? [])].filter((entry) => entry.target !== target)
  if (spellIds.length > 0) {
    next.push({
      target,
      classLevel: 1,
      ...(target === 'level1Plus' ? { spellLevel: 1 } : {}),
      spellIds,
    })
  }
  return next.length > 0 ? next : undefined
}
