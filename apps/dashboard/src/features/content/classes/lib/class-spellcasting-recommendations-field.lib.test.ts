import { describe, expect, it } from 'vitest'

import {
  readRecommendationSpellIds,
  upsertRecommendationSpellIds,
} from './class-spellcasting-recommendations-field.lib'

describe('class spellcasting recommendations field lib', () => {
  it('reads and upserts semantic recommendation targets independently', () => {
    const initial = [
      { target: 'cantrips' as const, classLevel: 1, spellIds: ['dancing-lights'] },
      {
        target: 'level1Plus' as const,
        classLevel: 1,
        spellLevel: 1,
        spellIds: ['charm-person'],
      },
    ]

    expect(readRecommendationSpellIds(initial, 'cantrips')).toEqual(['dancing-lights'])
    expect(readRecommendationSpellIds(initial, 'level1Plus')).toEqual(['charm-person'])

    const updated = upsertRecommendationSpellIds(initial, 'cantrips', [
      'dancing-lights',
      'vicious-mockery',
    ])
    expect(readRecommendationSpellIds(updated, 'cantrips')).toEqual([
      'dancing-lights',
      'vicious-mockery',
    ])
    expect(readRecommendationSpellIds(updated, 'level1Plus')).toEqual(['charm-person'])
  })

  it('drops empty recommendation groups', () => {
    expect(
      upsertRecommendationSpellIds(
        [{ target: 'cantrips', spellIds: ['dancing-lights'] }],
        'cantrips',
        [],
      ),
    ).toBeUndefined()
  })
})
