import { describe, expect, it } from 'vitest'

import { contentModelingSchema, modelingValidationMessages } from './schema'
import { isEditorEligible, meetsConsumerThreshold, meetsModelingThreshold } from './status'
import {
  deriveSpellModelingStatus,
  effectiveSpellModelingStatus,
} from '../../content/spell/modeling/derive'
import { CHILL_TOUCH_RESOLUTION } from '../../content/spell/resolution/fixtures'

describe('modeling status ladder', () => {
  it('orders rungs for threshold checks', () => {
    expect(meetsModelingThreshold('prose-only', 'meaningful-partial')).toBe(false)
    expect(meetsModelingThreshold('meaningful-partial', 'meaningful-partial')).toBe(true)
    expect(meetsModelingThreshold('sufficient-for-display', 'meaningful-partial')).toBe(true)
    expect(isEditorEligible('non-meaningful-partial')).toBe(false)
    expect(isEditorEligible('meaningful-partial')).toBe(true)
  })

  it('keeps meaningful-partial out of consumer thresholds', () => {
    expect(meetsConsumerThreshold('meaningful-partial', 'sufficient-for-display')).toBe(false)
    expect(meetsConsumerThreshold('sufficient-for-display', 'sufficient-for-display')).toBe(true)
  })
})

describe('contentModelingSchema', () => {
  it('accepts reviewed metadata with status and gaps', () => {
    expect(
      contentModelingSchema.parse({
        reviewedAt: '2026-07-15T00:00:00.000Z',
        status: 'meaningful-partial',
        gaps: [{ code: 'flammability-rules', note: 'Rider stays prose' }],
      }),
    ).toMatchObject({ status: 'meaningful-partial' })
  })

  it('rejects an empty gaps array', () => {
    const result = contentModelingSchema.safeParse({
      reviewedAt: '2026-07-15T00:00:00.000Z',
      gaps: [],
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe(modelingValidationMessages.emptyGapsArray)
    }
  })
})

describe('deriveSpellModelingStatus', () => {
  it('derives prose-only when no resolution or legacy effects', () => {
    expect(deriveSpellModelingStatus({})).toBe('prose-only')
  })

  it('derives non-meaningful-partial when resolution exists without explicit status', () => {
    expect(
      deriveSpellModelingStatus({
        resolution: CHILL_TOUCH_RESOLUTION,
      }),
    ).toBe('non-meaningful-partial')
  })

  it('uses explicit status when present', () => {
    expect(
      effectiveSpellModelingStatus({
        resolution: CHILL_TOUCH_RESOLUTION,
        modeling: {
          reviewedAt: '2026-07-15T00:00:00.000Z',
          status: 'sufficient-for-display',
        },
      }),
    ).toBe('sufficient-for-display')
  })
})
