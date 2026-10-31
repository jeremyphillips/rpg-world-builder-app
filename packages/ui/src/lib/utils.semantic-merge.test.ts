import { describe, expect, it } from 'vitest'

import { cn } from './utils'

describe('cn semantic control groups', () => {
  it('prefers interactive list row size over menu item padding utilities', () => {
    expect(cn('px-2 py-1.5', 'ui-list--comfortable')).toBe('ui-list--comfortable')
  })

  it('drops conflicting interactive row hover modifiers', () => {
    expect(cn('ui-interactive-row--hover-none', 'ui-interactive-row--hover')).toBe(
      'ui-interactive-row--hover',
    )
  })

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

  it('drops conflicting ui-field-control trigger flow modifiers', () => {
    expect(cn('ui-field-control--trigger-fill', 'ui-field-control--trigger-fit')).toBe(
      'ui-field-control--trigger-fit',
    )
  })

  it('drops conflicting ui-field-control width modifiers', () => {
    expect(cn('ui-field-control--width-md', 'ui-field-control--width-lg')).toBe(
      'ui-field-control--width-lg',
    )
  })

  it('lets consumer w-full override semantic width-full modifier', () => {
    expect(cn('ui-field-control--width-full', 'w-auto')).toBe('ui-field-control--width-full w-auto')
  })
})
