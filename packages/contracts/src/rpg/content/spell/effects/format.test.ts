import { describe, expect, it } from 'vitest'

import {
  BURNING_HANDS_RESOLUTION,
  FALSE_LIFE_RESOLUTION,
  FIREBALL_RESOLUTION,
} from '../resolution/fixtures'
import { deriveEffectRecipientFromResolution } from '../resolution/effect-context'
import { formatEffectRowSentenceFromParts } from './format'

describe('formatEffectRowSentenceFromParts', () => {
  const damageParts = {
    kind: 'damage' as const,
    roll: { dice: { count: 8, faces: 6 as const } },
    damageType: 'fire',
  }

  it('uses authoring voice for effect row summaries', () => {
    expect(formatEffectRowSentenceFromParts(damageParts)).toBe('Inflicts 8d6 Fire damage.')
    expect(
      formatEffectRowSentenceFromParts(
        { kind: 'healing', roll: { dice: { count: 2, faces: 4 as const } } },
        { recipient: 'target', targetKind: 'creature' },
      ),
    ).toBe('Target creature heals 2d4 Hit Points.')
  })

  it('uses resolution-preview voice for area occupants', () => {
    expect(
      formatEffectRowSentenceFromParts(damageParts, {
        recipient: 'area',
        register: 'resolution-preview',
      }),
    ).toBe('Each creature or object in the area takes 8d6 fire damage.')
  })

  it('uses resolution-preview voice for player-facing sentences', () => {
    expect(
      formatEffectRowSentenceFromParts(damageParts, {
        recipient: 'target',
        register: 'resolution-preview',
      }),
    ).toBe('Target takes 8d6 fire damage.')

    expect(
      formatEffectRowSentenceFromParts(damageParts, {
        recipient: 'target',
        register: 'resolution-preview',
        applicationAmount: 'half',
      }),
    ).toBe('Target takes half as much damage.')

    expect(
      formatEffectRowSentenceFromParts(
        { kind: 'healing', roll: { dice: { count: 2, faces: 4 as const } } },
        { recipient: 'target', register: 'resolution-preview' },
      ),
    ).toBe('Target regains 2d4 hit points.')

    expect(
      formatEffectRowSentenceFromParts(
        { kind: 'temporary-hit-points', roll: { dice: { count: 2, faces: 4 as const }, flat: 4 } },
        { recipient: 'self', register: 'resolution-preview' },
      ),
    ).toBe('You gain 2d4+4 temporary hit points.')
  })
})

describe('resolution fixture recipient phrasing', () => {
  it('false life uses caster recipient copy', () => {
    const effect = FALSE_LIFE_RESOLUTION.effects[0]!
    const recipient = deriveEffectRecipientFromResolution(FALSE_LIFE_RESOLUTION)

    expect(recipient).toBe('self')
    expect(
      formatEffectRowSentenceFromParts(
        {
          kind: effect.kind,
          roll: effect.roll,
        },
        { recipient, register: 'resolution-preview' },
      ),
    ).toBe('You gain 2d4+4 temporary hit points.')
  })

  it('burning hands and fireball use area-occupant recipient copy', () => {
    for (const resolution of [BURNING_HANDS_RESOLUTION, FIREBALL_RESOLUTION]) {
      const effect = resolution.effects[0]!
      if (effect.kind !== 'damage') throw new Error('expected damage fixture')
      const recipient = deriveEffectRecipientFromResolution(resolution)

      expect(recipient).toBe('area')
      expect(
        formatEffectRowSentenceFromParts(
          {
            kind: effect.kind,
            roll: effect.roll,
            damageType: effect.damageType,
          },
          { recipient, register: 'resolution-preview' },
        ),
      ).toContain('Each creature or object in the area')
    }
  })
})
