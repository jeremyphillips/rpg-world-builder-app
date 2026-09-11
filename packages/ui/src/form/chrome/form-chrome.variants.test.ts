import { describe, expect, it } from 'vitest'

import {
  formTabbedAsideBodyClasses,
  formTabbedAsideGridClasses,
  formTabbedAsideSlotBottomInsetClasses,
  formTabbedAsideSlotClasses,
  formTabbedAsideSlotTopInsetClasses,
  formViewportScrollBodyTopInsetClasses,
} from './form-chrome.variants'

describe('formTabbedAside layout tokens', () => {
  it('bounds the 2xl grid row to the viewport flex shell', () => {
    expect(formTabbedAsideGridClasses).toContain('2xl:grid-rows-[minmax(0,1fr)]')
    expect(formTabbedAsideGridClasses).toContain('2xl:h-full')
  })

  it('fills grid cells for scroll + docked footer columns', () => {
    expect(formTabbedAsideBodyClasses).toContain('2xl:h-full')
    expect(formTabbedAsideBodyClasses).toContain('min-h-0')
    expect(formTabbedAsideSlotClasses).toContain('2xl:h-full')
    expect(formTabbedAsideSlotClasses).toContain('2xl:flex')
    expect(formTabbedAsideSlotClasses).toContain('2xl:flex-col')
  })

  it('applies vertical inset on the preview-rail column only', () => {
    expect(formTabbedAsideSlotTopInsetClasses).toBe('2xl:pt-8')
    expect(formTabbedAsideSlotBottomInsetClasses).toBe('2xl:pb-8')
    expect(formTabbedAsideSlotClasses).toContain(formTabbedAsideSlotTopInsetClasses)
    expect(formTabbedAsideSlotClasses).toContain(formTabbedAsideSlotBottomInsetClasses)
  })

  it('defines scroll-body top inset that scrolls with form content', () => {
    expect(formViewportScrollBodyTopInsetClasses).toBe('pt-8')
  })
})
