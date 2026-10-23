import { describe, expect, it } from 'vitest'

import {
  formDockedActionsBarClasses,
  formStickyScrollBodyClipClasses,
  formStickyScrollBodyScrollerClasses,
  formStickyScrollShellWithDockedFooterClasses,
  formStickyTabsClasses,
  formTabbedAsideBodyClasses,
  formTabbedAsideGridClasses,
  formTabbedAsideSlotClasses,
  formViewportScrollBodyTopInsetClasses,
} from './form-chrome.variants'

describe('form chrome semantic blocks', () => {
  it('maps tabbed-form aside layout to ui-tabbed-form blocks', () => {
    expect(formTabbedAsideGridClasses).toBe('ui-tabbed-form')
    expect(formTabbedAsideBodyClasses).toBe('ui-tabbed-form__body')
    expect(formTabbedAsideSlotClasses).toBe('ui-tabbed-form__aside')
  })

  it('maps docked footer shell and actions bar to semantic classes', () => {
    expect(formStickyScrollShellWithDockedFooterClasses).toBe('ui-form-docked-shell')
    expect(formDockedActionsBarClasses).toContain('ui-form-actions-bar--docked')
    expect(formStickyTabsClasses).toBe('ui-form-sticky-tabs')
  })

  it('keeps scroll-body clip and scroller responsibilities split', () => {
    expect(formStickyScrollBodyClipClasses).toContain('form-scroll-body-container')
    expect(formStickyScrollBodyClipClasses).toContain('overflow-hidden')
    expect(formStickyScrollBodyClipClasses).not.toContain('overflow-y-auto')
    expect(formStickyScrollBodyScrollerClasses).toContain('overflow-y-auto')
    expect(formStickyScrollBodyScrollerClasses).not.toContain('form-scroll-body-container')
  })

  it('defines scroll-body top inset that scrolls with form content', () => {
    expect(formViewportScrollBodyTopInsetClasses).toBe('pt-8')
  })
})
