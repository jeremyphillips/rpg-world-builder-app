import { describe, expect, it } from 'vitest'

import {
  fieldInputFocusClasses,
  fieldInputFocusWithinClasses,
  fieldInputInvalidAriaClasses,
  fieldInputInvalidClasses,
  fieldInputInvalidSegmentClasses,
  fieldInputShellClasses,
} from './field-input-chrome.variants'

const APPROVED_INPUT_CHROME_TOKENS = [
  'rounded-md',
  'border',
  'border-input',
  'bg-input',
  'shadow-sm',
  'transition-colors',
  'focus-visible:outline-none',
  'focus-visible:ring-2',
  'focus-visible:ring-ring',
  'focus-visible:ring-offset-2',
  'focus-visible:ring-offset-background',
  'focus-within:outline-none',
  'focus-within:ring-2',
  'focus-within:ring-ring',
  'focus-within:ring-offset-2',
  'focus-within:ring-offset-background',
  'aria-invalid:border-input-invalid',
  'aria-invalid:focus-visible:ring-input-invalid',
  'border-input-invalid',
  'focus-within:ring-input-invalid',
  '[&_[data-input-select-value]]:bg-input-invalid-subtle',
]

function expectOnlyApprovedTokens(classes: string) {
  const tokens = classes.split(/\s+/).filter(Boolean)
  for (const token of tokens) {
    expect(APPROVED_INPUT_CHROME_TOKENS).toContain(token)
  }
}

describe('field-input-chrome.variants', () => {
  it('uses approved input tokens for shell chrome', () => {
    expectOnlyApprovedTokens(fieldInputShellClasses)
  })

  it('uses approved input tokens for focus and invalid treatments', () => {
    expectOnlyApprovedTokens(fieldInputFocusClasses)
    expectOnlyApprovedTokens(fieldInputFocusWithinClasses)
    expectOnlyApprovedTokens(fieldInputInvalidAriaClasses)
    expectOnlyApprovedTokens(fieldInputInvalidClasses)
    expectOnlyApprovedTokens(fieldInputInvalidSegmentClasses)
  })
})
