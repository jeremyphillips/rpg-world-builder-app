import { describe, expect, it } from 'vitest'

import { cn } from './utils'

describe('cn semantic control groups', () => {
  it('drops conflicting ui-button appearance modifiers', () => {
    expect(cn('ui-button--primary', 'ui-button--outline')).toBe('ui-button--outline')
  })

  it('drops conflicting ui-button size modifiers', () => {
    expect(cn('ui-button--md', 'ui-button--sm')).toBe('ui-button--sm')
  })

  it('keeps field trigger modifier alongside size', () => {
    expect(cn('ui-field-control--md', 'ui-field-control--trigger')).toBe(
      'ui-field-control--md ui-field-control--trigger',
    )
  })

  it('keeps digit reserve modifier alongside size', () => {
    expect(cn('ui-field-control--md', 'ui-field-control--digits-md')).toBe(
      'ui-field-control--md ui-field-control--digits-md',
    )
  })

  it('drops conflicting ui-choice-control kind modifiers', () => {
    expect(cn('ui-choice-control--checkbox', 'ui-choice-control--radio')).toBe(
      'ui-choice-control--radio',
    )
  })

  it('drops conflicting ui-choice-control indicator size modifiers', () => {
    expect(cn('ui-choice-control--indicator-lg', 'ui-choice-control--indicator-sm')).toBe(
      'ui-choice-control--indicator-sm',
    )
  })
})
