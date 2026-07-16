import { describe, expect, it } from 'vitest'

import { CHILL_TOUCH_RESOLUTION } from '../../content/spell/resolution/fixtures'
import { resolveSpellMechanicsForCharacterSheet } from './resolve-spell-mechanics'

describe('resolveSpellMechanicsForCharacterSheet', () => {
  const baseSpell = {
    id: 'srd-cc-5.2.1:chill-touch',
    resolution: CHILL_TOUCH_RESOLUTION,
  }

  it('returns prose fallback below sufficient-for-character-sheet', () => {
    expect(resolveSpellMechanicsForCharacterSheet(baseSpell, { characterLevel: 5 })).toEqual({
      kind: 'prose-fallback',
      spellId: baseSpell.id,
    })
  })

  it('returns structured mechanics when modeling status qualifies', () => {
    expect(
      resolveSpellMechanicsForCharacterSheet(
        {
          ...baseSpell,
          modeling: {
            reviewedAt: '2026-07-15T00:00:00.000Z',
            status: 'sufficient-for-character-sheet',
          },
        },
        { characterLevel: 5 },
      ),
    ).toEqual({
      kind: 'structured',
      spellId: baseSpell.id,
      resolution: CHILL_TOUCH_RESOLUTION,
    })
  })
})
