import type { Spell } from '../../content/spell/body'
import { effectiveSpellModelingStatus } from '../../content/spell/modeling/derive'
import { meetsConsumerThreshold } from '../../primitives/modeling/status'

export type SpellSheetMechanicsContext = {
  characterLevel: number
  castSlotLevel?: number
}

export type SpellSheetMechanicsResult =
  | { kind: 'prose-fallback'; spellId: string }
  | { kind: 'structured'; spellId: string; resolution: NonNullable<Spell['resolution']> }

/**
 * Future character-sheet resolver — returns structured mechanics only when modeling
 * status is at least `sufficient-for-character-sheet`.
 */
export function resolveSpellMechanicsForCharacterSheet(
  spell: Pick<Spell, 'id' | 'modeling' | 'resolution'>,
  _context: SpellSheetMechanicsContext,
): SpellSheetMechanicsResult {
  const status = effectiveSpellModelingStatus(spell)

  if (!meetsConsumerThreshold(status, 'sufficient-for-character-sheet') || !spell.resolution) {
    return { kind: 'prose-fallback', spellId: spell.id }
  }

  return {
    kind: 'structured',
    spellId: spell.id,
    resolution: spell.resolution,
  }
}
