import { describe, expect, it } from 'vitest'

import {
  formStickyScrollBodyClipClasses,
  formStickyScrollBodyScrollerClasses,
  formStickyScrollShellWithDockedFooterClasses,
} from './form-chrome.variants'

describe('form chrome semantic blocks', () => {
  it('maps the docked footer shell to its semantic class', () => {
    expect(formStickyScrollShellWithDockedFooterClasses).toBe('ui-form-docked-shell')
  })

  it('keeps scroll-body clip and scroller responsibilities split', () => {
    expect(formStickyScrollBodyClipClasses).toContain('form-scroll-body-container')
    expect(formStickyScrollBodyClipClasses).toContain('overflow-hidden')
    expect(formStickyScrollBodyClipClasses).not.toContain('overflow-y-auto')
    expect(formStickyScrollBodyScrollerClasses).toContain('overflow-y-auto')
    expect(formStickyScrollBodyScrollerClasses).not.toContain('form-scroll-body-container')
  })
})
