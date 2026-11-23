import { describe, expect, it } from 'vitest'

import {
  ABILITY_SCORE_IMPROVEMENT_FEAT_ID,
  DEFAULT_ASI_FEATURE_DESCRIPTION,
  DEFAULT_ASI_FEATURE_NAME,
  resolveClassFeatureGrantGroups,
} from '@rpg/contracts'

import { createAsiFeature } from './class-asi-features'

describe('createAsiFeature', () => {
  it('creates an ASI feature at the specified level', () => {
    const feature = createAsiFeature(4)
    expect(feature.id).toBe('ability-score-improvement-4')
    expect(feature.name).toBe(DEFAULT_ASI_FEATURE_NAME)
    expect(feature.level).toBe(4)
    expect(feature.description).toBe(DEFAULT_ASI_FEATURE_DESCRIPTION)
    expect(feature.kind).toBe('asi')
  })

  it('projects the canonical feat choice at read time', () => {
    const feature = createAsiFeature(8)
    expect(feature).not.toHaveProperty('grantGroups')
    const grant = resolveClassFeatureGrantGroups(feature)[0]!.grants[0]!
    expect(grant.kind).toBe('featChoice')
    if (grant.kind === 'featChoice') {
      expect(grant.id).toBe('general-feat')
      expect(grant.category).toBe('general')
      expect(grant.recommendedFeatIds).toContain(ABILITY_SCORE_IMPROVEMENT_FEAT_ID)
    }
  })

  it('generates unique ids per level', () => {
    const ids = [4, 8, 12, 16].map((l) => createAsiFeature(l).id)
    expect(new Set(ids).size).toBe(4)
  })
})
