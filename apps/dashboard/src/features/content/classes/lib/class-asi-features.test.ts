import { describe, expect, it } from 'vitest'

import {
  ASI_FEATURE_DESCRIPTION,
  ASI_FEATURE_NAME,
  ABILITY_SCORE_IMPROVEMENT_FEAT_ID,
  createAsiFeature,
} from './class-asi-features'

describe('createAsiFeature', () => {
  it('creates an ASI feature at the specified level', () => {
    const feature = createAsiFeature(4)
    expect(feature.id).toBe('ability-score-improvement-4')
    expect(feature.name).toBe(ASI_FEATURE_NAME)
    expect(feature.level).toBe(4)
    expect(feature.description).toBe(ASI_FEATURE_DESCRIPTION)
  })

  it('uses the atomic grantGroups model (no legacy grants bag)', () => {
    const feature = createAsiFeature(8)
    expect(feature).not.toHaveProperty('grants')
    expect(feature.grantGroups).toHaveLength(1)
    const group = feature.grantGroups![0]!
    expect(group.unlock).toBeUndefined()
    expect(group.grants).toHaveLength(1)
  })

  it('produces a general featChoice grant with ASI as recommended', () => {
    const feature = createAsiFeature(12)
    const grant = feature.grantGroups![0]!.grants[0]!
    expect(grant.kind).toBe('featChoice')
    if (grant.kind === 'featChoice') {
      expect(grant.category).toBe('general')
      expect(grant.choose).toBe(1)
      expect(grant.allowAnyQualifying).toBe(true)
      expect(grant.recommendedFeatIds).toContain(ABILITY_SCORE_IMPROVEMENT_FEAT_ID)
    }
  })

  it('generates unique ids per level', () => {
    const ids = [4, 8, 12, 16].map((l) => createAsiFeature(l).id)
    expect(new Set(ids).size).toBe(4)
  })
})
