import { describe, expect, it } from 'vitest'

import { CHILL_TOUCH_RESOLUTION, FIREBALL_RESOLUTION } from '../resolution/fixtures'
import {
  isSpellModelingGapCode,
  SPELL_MODELING_GAP_CODES,
  validateSpellModelingPromotion,
  validateSpellResolutionSchemaRoundTrip,
} from './index'

describe('spell modeling gap codes', () => {
  it('includes new environmental and application codes', () => {
    expect(SPELL_MODELING_GAP_CODES['object-state-awareness']).toBeDefined()
    expect(SPELL_MODELING_GAP_CODES['flammability-rules']).toBeDefined()
    expect(SPELL_MODELING_GAP_CODES['unconditional-application']).toBeDefined()
    expect(isSpellModelingGapCode('dynamic-target-count')).toBe(true)
    expect(isSpellModelingGapCode('projectile-target-allocation')).toBe(true)
    expect(isSpellModelingGapCode('retargetable-mark')).toBe(true)
    expect(isSpellModelingGapCode('not-a-code')).toBe(false)
  })
})

describe('validateSpellResolutionSchemaRoundTrip', () => {
  it('accepts fixture resolutions', () => {
    expect(validateSpellResolutionSchemaRoundTrip(CHILL_TOUCH_RESOLUTION)).toEqual([])
    expect(validateSpellResolutionSchemaRoundTrip(FIREBALL_RESOLUTION)).toEqual([])
  })
})

describe('validateSpellModelingPromotion', () => {
  it('requires resolution for meaningful-partial and above', () => {
    const issues = validateSpellModelingPromotion({
      modeling: {
        reviewedAt: '2026-07-15T00:00:00.000Z',
        status: 'meaningful-partial',
      },
    })
    expect(issues.some((issue) => issue.code === 'missing-resolution')).toBe(true)
  })

  it('accepts meaningful-partial when resolution round-trips', () => {
    const issues = validateSpellModelingPromotion({
      modeling: {
        reviewedAt: '2026-07-15T00:00:00.000Z',
        status: 'meaningful-partial',
      },
      resolution: CHILL_TOUCH_RESOLUTION,
    })
    expect(issues).toEqual([])
  })

  it('runs display smoke test for sufficient-for-display', () => {
    const issues = validateSpellModelingPromotion({
      modeling: {
        reviewedAt: '2026-07-15T00:00:00.000Z',
        status: 'sufficient-for-display',
      },
      resolution: FIREBALL_RESOLUTION,
    })
    expect(issues).toEqual([])
  })
})
