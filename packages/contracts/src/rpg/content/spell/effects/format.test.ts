import { describe, expect, it } from 'vitest'

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
