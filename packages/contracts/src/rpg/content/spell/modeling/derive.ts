import type { ContentModeling } from '../../../primitives/modeling/schema'
import type { DerivedModelingStatus, ModelingStatus } from '../../../primitives/modeling/status'
import type { Spell } from '../body'

export function hasStructuredSpellResolution(spell: Pick<Spell, 'resolution'>): boolean {
  return spell.resolution !== undefined && spell.resolution !== null
}

/** Derives base modeling status when `modeling.status` is absent. */
export function deriveSpellModelingStatus(spell: Pick<Spell, 'resolution'>): DerivedModelingStatus {
  if (hasStructuredSpellResolution(spell)) return 'non-meaningful-partial'
  return 'prose-only'
}

export function effectiveSpellModelingStatus(
  spell: Pick<Spell, 'modeling' | 'resolution'>,
): ModelingStatus {
  return spell.modeling?.status ?? deriveSpellModelingStatus(spell)
}

export function spellModelingGaps(spell: Pick<Spell, 'modeling'>): ContentModeling['gaps'] {
  return spell.modeling?.gaps
}

export function hasSpellModelingGap(spell: Pick<Spell, 'modeling'>, code: string): boolean {
  return spell.modeling?.gaps?.some((gap) => gap.code === code) ?? false
}
