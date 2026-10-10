import { describe, expect, it } from 'vitest'

import { UI_CHOICE_CONTROL_BLOCK_CLASS } from './choice-control.styles'
import {
  choiceControlIndicatorFocusClasses,
  choiceControlIndicatorShellClasses,
} from './choice-control-chrome.variants'

describe('choice-control-chrome.variants', () => {
  it('exports the semantic block class for legacy shell imports', () => {
    expect(choiceControlIndicatorShellClasses).toBe(UI_CHOICE_CONTROL_BLOCK_CLASS)
  })

  it('composes standalone focus ring policy', () => {
    expect(choiceControlIndicatorFocusClasses).toContain('ui-focus-ring')
    expect(choiceControlIndicatorFocusClasses).not.toContain('border-input')
  })
})
