import { describe, expect, it } from 'vitest'

import {
  choiceControlIndicatorCheckedBorderClasses,
  choiceControlIndicatorDisabledClasses,
  choiceControlIndicatorFocusClasses,
  choiceControlIndicatorGroupCheckedBorderClasses,
  choiceControlIndicatorInvalidClasses,
  choiceControlIndicatorShellClasses,
} from './choice-control-chrome.variants'

const APPROVED_CHOICE_CONTROL_CHROME_TOKENS = [
  'border',
  'border-choice-control',
  'shadow-sm',
  'transition-colors',
  'focus-visible:outline-none',
  'focus-visible:ring-2',
  'focus-visible:ring-ring',
  'focus-visible:ring-offset-2',
  'focus-visible:ring-offset-background',
  'data-[state=checked]:border-primary',
  'group-data-[state=checked]:border-primary',
  'aria-invalid:border-input-invalid',
  'disabled:cursor-not-allowed',
  'disabled:opacity-50',
] as const

describe('choice-control-chrome.variants', () => {
  it('uses approved border and focus utilities only', () => {
    const combined = [
      choiceControlIndicatorShellClasses,
      choiceControlIndicatorFocusClasses,
      choiceControlIndicatorCheckedBorderClasses,
      choiceControlIndicatorGroupCheckedBorderClasses,
      choiceControlIndicatorInvalidClasses,
      choiceControlIndicatorDisabledClasses,
    ].join(' ')

    for (const token of APPROVED_CHOICE_CONTROL_CHROME_TOKENS) {
      expect(combined, `missing ${token}`).toContain(token)
    }

    expect(combined.split(/\s+/)).not.toContain('border-input')
  })
})
