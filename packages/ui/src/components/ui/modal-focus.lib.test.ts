/**
 * @vitest-environment jsdom
 */
import { describe, expect, it } from 'vitest'

import {
  focusModalInitialTarget,
  INFO_TOOLTIP_TRIGGER_SELECTOR,
  shouldSkipModalAutoFocus,
} from './modal-focus.lib'

describe('modal focus helpers', () => {
  it('skips info tooltip triggers', () => {
    document.body.innerHTML = `
      <div id="dialog">
        <button type="button" data-info-tooltip-trigger aria-label="About Availability"></button>
        <button type="button" role="combobox" id="field">Field</button>
      </div>
    `

    const dialog = document.getElementById('dialog')!
    const infoTrigger = dialog.querySelector(INFO_TOOLTIP_TRIGGER_SELECTOR) as HTMLElement
    const field = document.getElementById('field') as HTMLElement

    expect(shouldSkipModalAutoFocus(infoTrigger)).toBe(true)
    expect(shouldSkipModalAutoFocus(field)).toBe(false)

    focusModalInitialTarget({
      preventDefault: () => undefined,
      currentTarget: dialog,
    } as unknown as Event)

    expect(document.activeElement).toBe(field)
  })
})
