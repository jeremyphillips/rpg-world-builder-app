import { CHALLENGE_RATING_MECHANICS, DEFAULT_CONTENT_CAMPAIGN_ACCESS } from '@rpg/contracts'
import { applyFilterSchema } from '@rpg/ui/filters'
import { describe, expect, it } from 'vitest'

import { makeMonster } from '@/test/fixtures/factories/monster'

import { monstersFilterSchema } from './monsters-overview-columns'

describe('monsters-overview-columns', () => {
  it('sorts challenge ratings numerically via mechanics value', () => {
    const rows = [
      makeMonster({ id: '1', challengeRating: '1' }),
      makeMonster({ id: '2', challengeRating: '1/8' }),
      makeMonster({ id: '3', challengeRating: '1/2' }),
    ]

    const sorted = [...rows].sort(
      (a, b) =>
        CHALLENGE_RATING_MECHANICS[a.challengeRating].value -
        CHALLENGE_RATING_MECHANICS[b.challengeRating].value,
    )

    expect(sorted.map((row) => row.challengeRating)).toEqual(['1/8', '1/2', '1'])
  })

  it('filters by creature type and size', () => {
    const access = DEFAULT_CONTENT_CAMPAIGN_ACCESS
    const rows = [
      {
        ...makeMonster({ id: 'a', creatureType: 'dragon', sizes: ['small'] }),
        campaignAccess: access,
      },
      {
        ...makeMonster({ id: 'b', creatureType: 'undead', sizes: ['medium', 'small'] }),
        campaignAccess: access,
      },
    ]

    const byType = applyFilterSchema(monstersFilterSchema, { creatureType: 'dragon' }, rows)
    expect(byType.map((row) => row.id)).toEqual(['a'])

    const bySize = applyFilterSchema(monstersFilterSchema, { size: 'medium' }, rows)
    expect(bySize.map((row) => row.id)).toEqual(['b'])

    const bySmall = applyFilterSchema(monstersFilterSchema, { size: 'small' }, rows)
    expect(bySmall.map((row) => row.id).sort()).toEqual(['a', 'b'])
  })
})
