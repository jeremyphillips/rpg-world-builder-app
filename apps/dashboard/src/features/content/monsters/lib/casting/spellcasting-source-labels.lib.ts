import { getAbilityLabel, getContentTypeSentenceForm } from '@rpg/contracts'
import { joinInlineMetadata } from '@rpg/contracts/primitives'
import type { ResolvedSpellCastingSource } from '@rpg/contracts'

import { masterDetailItemTitle } from '../../../lib/master-detail/master-detail-constants'
import { monsterActionSectionHeading, MONSTER_ACTION_ITEM_NOUN } from '../monster-form-labels'

function sourceTitle(source: ResolvedSpellCastingSource): string {
  return source.name?.trim() || masterDetailItemTitle(undefined, MONSTER_ACTION_ITEM_NOUN)
}

function sourceNameKey(source: ResolvedSpellCastingSource): string {
  return source.name?.trim() ?? ''
}

export function formatSharedCastingOptionLabel(
  source: ResolvedSpellCastingSource,
  sources: readonly ResolvedSpellCastingSource[],
): string {
  const base = `${sourceTitle(source)} (${getAbilityLabel(source.ability)})`
  const collisions = sources.filter((other) => sourceNameKey(other) === sourceNameKey(source))
  if (collisions.length < 2) return base
  return joinInlineMetadata([base, monsterActionSectionHeading(source.section)])
}

/** Action title with its spell count and ability. Section is added only when names collide. */
export function formatSpellcastingActionOptionLabel(
  source: ResolvedSpellCastingSource,
  sources: readonly ResolvedSpellCastingSource[],
  spellCount: number,
): string {
  const collisions = sources.filter((other) => sourceNameKey(other) === sourceNameKey(source))
  return joinInlineMetadata([
    sourceTitle(source),
    `${spellCount} ${getContentTypeSentenceForm('spells', spellCount)}`,
    getAbilityLabel(source.ability),
    collisions.length < 2 ? undefined : monsterActionSectionHeading(source.section),
  ])
}
