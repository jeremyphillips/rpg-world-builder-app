import { describe, expect, it } from 'vitest'
import type { ClassFeature } from '@rpg/contracts'

import {
  ASI_FEATURE_DESCRIPTION,
  ASI_FEATURE_NAME,
  createAsiFeature,
  deriveAsiLevels,
  isAsiFeature,
  syncAsiFeatures,
} from './class-asi-features'

const secondWind: ClassFeature = {
  kind: 'custom',
  id: 'second-wind',
  name: 'Second Wind',
  level: 1,
}

describe('class-asi-features', () => {
  it('detects ASI features by id or recommendedFeatIds', () => {
    expect(isAsiFeature(createAsiFeature(4))).toBe(true)
    expect(
      isAsiFeature({
        id: 'custom-asi',
        grants: {
          featChoice: {
            category: 'general',
            choose: 1,
            recommendedFeatIds: ['ability-score-improvement'],
          },
        },
      }),
    ).toBe(true)
    expect(isAsiFeature(secondWind)).toBe(false)
  })

  it('derives ASI levels from feature rows', () => {
    const features = [secondWind, createAsiFeature(4), createAsiFeature(8)]
    expect(deriveAsiLevels(features)).toEqual([4, 8])
  })

  it('syncAsiFeatures replaces ASI rows and preserves other features', () => {
    const features = [secondWind, createAsiFeature(4), createAsiFeature(8)]
    const synced = syncAsiFeatures([4, 12], features)

    expect(synced.filter(isAsiFeature).map((f) => f.level)).toEqual([4, 12])
    expect(synced.find((f) => f.id === 'second-wind')).toEqual(secondWind)
    expect(synced.find((f) => f.id === 'ability-score-improvement-4')).toMatchObject({
      name: ASI_FEATURE_NAME,
      description: ASI_FEATURE_DESCRIPTION,
      grants: {
        featChoice: {
          category: 'general',
          choose: 1,
          allowAnyQualifying: true,
          recommendedFeatIds: ['ability-score-improvement'],
        },
      },
    })
  })
})
