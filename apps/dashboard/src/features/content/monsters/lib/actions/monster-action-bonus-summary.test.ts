import { describe, expect, it } from 'vitest'

import type { MonsterFormValues } from '../monster-form-values'
import { buildMonsterActionBonusPreview } from './monster-action-bonus-summary'

describe('buildMonsterActionBonusPreview', () => {
  it('uses the stat-block sentence and omits an incomplete teleport', () => {
    const values = { name: 'Hezrou' } as MonsterFormValues
    expect(
      buildMonsterActionBonusPreview({
        values,
        action: {
          id: 'leap',
          kind: 'leap',
          name: 'Leap',
          distanceFeet: 30,
          movementFeet: 10,
        },
      })?.bodyHtml,
    ).toBe('<p>Leap</p><p>The hezrou jumps up to 30 feet by spending 10 feet of movement.</p>')
    expect(
      buildMonsterActionBonusPreview({
        values,
        action: {
          id: 'leap',
          kind: 'leap',
          name: 'Leap',
          distanceFeet: 10,
          movementFeet: 10,
        },
      })?.bodyHtml,
    ).toContain('jumps up to 10 feet by spending 10 feet of movement.')
    expect(
      buildMonsterActionBonusPreview({
        values,
        action: { id: 'leap', kind: 'leap', name: 'Leap', distanceFeet: 30 },
      }),
    ).toBeNull()
    expect(
      buildMonsterActionBonusPreview({
        values: { name: 'Balor' } as MonsterFormValues,
        action: {
          id: 'teleport',
          kind: 'teleport',
          name: 'Teleport',
          distanceFeet: 60,
          passenger: {},
        },
      }),
    ).toBeNull()
  })

  it('adds the recharge heading without putting it in the sentence', () => {
    expect(
      buildMonsterActionBonusPreview({
        values: { name: 'Blink Dog' } as MonsterFormValues,
        action: {
          id: 'teleport',
          kind: 'teleport',
          name: 'Teleport',
          distanceFeet: 40,
          limitedUse: { kind: 'recharge', minRoll: 4 },
        },
      })?.bodyHtml,
    ).toBe(
      '<p>Teleport (Recharge 4–6)</p><p>The blink dog teleports up to 40 feet to an unoccupied space it can see.</p>',
    )
  })
})
