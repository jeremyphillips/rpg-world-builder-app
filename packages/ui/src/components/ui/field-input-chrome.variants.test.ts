import { describe, expect, it } from 'vitest'

import {
  fieldInputAutofillClasses,
  fieldInputDisabledClasses,
  fieldInputFocusClasses,
  fieldInputFocusWithinClasses,
  fieldInputInvalidAriaClasses,
  fieldInputInvalidClasses,
  fieldInputInvalidSegmentClasses,
  fieldInputReadonlyClasses,
  fieldInputShellClasses,
} from './field-input-chrome.variants'

const APPROVED_INPUT_CHROME_TOKENS = [
  'rounded-md',
  'border',
  'border-input',
  'bg-input',
  'shadow-sm',
  'transition-colors',
  'hover:border-input-hover',
  'focus-visible:outline-none',
  'focus-visible:border-input-focus',
  'focus-visible:ring-2',
  'focus-visible:ring-ring',
  'focus-visible:ring-offset-2',
  'focus-visible:ring-offset-background',
  'focus-within:outline-none',
  'focus-within:border-input-focus',
  'focus-within:ring-2',
  'focus-within:ring-ring',
  'focus-within:ring-offset-2',
  'focus-within:ring-offset-background',
  'aria-invalid:border-input-invalid',
  'aria-invalid:bg-input-invalid-subtle',
  'aria-invalid:focus-visible:ring-input-invalid',
  'border-input-invalid',
  'bg-input-invalid-subtle',
  'focus-within:ring-input-invalid',
  '[&_[data-input-select-value]]:bg-input-invalid-subtle',
  'disabled:cursor-not-allowed',
  'disabled:bg-input-disabled',
  'disabled:border-input-disabled',
  'disabled:text-input-disabled',
  'read-only:bg-input-readonly',
  'read-only:border-input-readonly',
  '[&:-webkit-autofill]:shadow-[inset_0_0_0_1000px_var(--field-control-bg)]',
  '[&:-webkit-autofill]:[-webkit-text-fill-color:var(--field-control-fg)]',
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

  it('uses approved input tokens for focus, invalid, disabled, readonly, and autofill', () => {
    expectOnlyApprovedTokens(fieldInputFocusClasses)
    expectOnlyApprovedTokens(fieldInputFocusWithinClasses)
    expectOnlyApprovedTokens(fieldInputInvalidAriaClasses)
    expectOnlyApprovedTokens(fieldInputInvalidClasses)
    expectOnlyApprovedTokens(fieldInputInvalidSegmentClasses)
    expectOnlyApprovedTokens(fieldInputDisabledClasses)
    expectOnlyApprovedTokens(fieldInputReadonlyClasses)
    expectOnlyApprovedTokens(fieldInputAutofillClasses)
  })
})
