import { describe, expect, it } from 'vitest'
import { BUILDER_STEPS } from '@rpg/contracts'

import {
  appendTouchedStepId,
  getAdjacentBuilderStepId,
  isFirstBuilderStep,
  isReviewBuilderStep,
  resolveCurrentStepId,
} from './character-builder-navigation'

describe('character-builder-navigation', () => {
  it('defaults missing currentStepId to identity', () => {
    expect(resolveCurrentStepId(undefined)).toBe('identity')
  })

  it('walks adjacent steps forward and back', () => {
    expect(getAdjacentBuilderStepId('identity', 'forward')).toBe('connections')
    expect(getAdjacentBuilderStepId('connections', 'back')).toBe('identity')
    expect(getAdjacentBuilderStepId('identity', 'back')).toBeNull()
    expect(getAdjacentBuilderStepId('review', 'forward')).toBeNull()
  })

  it('walks the supplied effective steps when Connections is omitted', () => {
    const effectiveSteps = BUILDER_STEPS.filter(({ id }) => id !== 'connections')

    expect(getAdjacentBuilderStepId('identity', 'forward', effectiveSteps)).toBe('species')
    expect(getAdjacentBuilderStepId('species', 'back', effectiveSteps)).toBe('identity')
  })

  it('identifies first and review steps', () => {
    expect(isFirstBuilderStep('identity')).toBe(true)
    expect(isFirstBuilderStep('species')).toBe(false)
    expect(isReviewBuilderStep('review')).toBe(true)
  })

  it('appends touched step ids once', () => {
    expect(appendTouchedStepId(['identity'], 'species')).toEqual(['identity', 'species'])
    expect(appendTouchedStepId(['identity'], 'identity')).toEqual(['identity'])
  })
})
