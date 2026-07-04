import { describe, expect, it } from 'vitest'

import { getBuilderStepStatusLabel } from './builder-step-status-display'

describe('getBuilderStepStatusLabel', () => {
  it('labels deferred spells as skipped in MVP-A', () => {
    expect(getBuilderStepStatusLabel('spells', 'deferred', null)).toBe('Skipped')
  })

  it('keeps the default deferred label for other choice steps', () => {
    expect(getBuilderStepStatusLabel('proficiencies', 'deferred', null)).toBe('Later')
  })

  it('uses the status label when choice sets are resolved', () => {
    expect(getBuilderStepStatusLabel('spells', 'deferred', [])).toBe('Later')
  })
})
