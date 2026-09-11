import { describe, expect, it } from 'vitest'

import {
  previewRailTabbedAsideGridColsAt2xlClasses,
  previewRailTabbedAsideGridColsBelow2xlClasses,
  previewRailTabbedAsideGridMaxWidthAt2xlClasses,
  previewRailTabbedAsideGridMaxWidthBelow2xlClasses,
} from '../../components/preview-rail/preview-rail.variants'
import {
  formTabbedAsideBodyClasses,
  formTabbedAsideGridClasses,
  formTabbedAsideSlotBottomInsetClasses,
  formTabbedAsideSlotClasses,
  formTabbedAsideSlotTopInsetClasses,
  formViewportScrollBodyTopInsetClasses,
} from './form-chrome.variants'

describe('formTabbedAside layout tokens', () => {
  it('bounds the xl grid row to the viewport flex shell', () => {
    expect(formTabbedAsideGridClasses).toContain('xl:grid-rows-[minmax(0,1fr)]')
    expect(formTabbedAsideGridClasses).toContain('xl:h-full')
  })

  it('uses a narrower preview-rail column below 2xl', () => {
    expect(formTabbedAsideGridClasses).toContain(previewRailTabbedAsideGridColsBelow2xlClasses)
    expect(formTabbedAsideGridClasses).toContain(previewRailTabbedAsideGridColsAt2xlClasses)
  })

  it('keeps the preview-rail grid centered with a capped max width', () => {
    expect(formTabbedAsideGridClasses).toContain('mx-auto')
    expect(formTabbedAsideGridClasses).not.toContain('xl:mx-0')
    expect(formTabbedAsideGridClasses).toContain(previewRailTabbedAsideGridMaxWidthBelow2xlClasses)
    expect(formTabbedAsideGridClasses).toContain(previewRailTabbedAsideGridMaxWidthAt2xlClasses)
  })

  it('fills grid cells for scroll + docked footer columns', () => {
    expect(formTabbedAsideBodyClasses).toContain('xl:h-full')
    expect(formTabbedAsideBodyClasses).toContain('min-h-0')
    expect(formTabbedAsideSlotClasses).toContain('xl:h-full')
    expect(formTabbedAsideSlotClasses).toContain('xl:flex')
    expect(formTabbedAsideSlotClasses).toContain('xl:flex-col')
  })

  it('applies vertical inset on the preview-rail column only', () => {
    expect(formTabbedAsideSlotTopInsetClasses).toBe('xl:pt-8')
    expect(formTabbedAsideSlotBottomInsetClasses).toBe('xl:pb-8')
    expect(formTabbedAsideSlotClasses).toContain(formTabbedAsideSlotTopInsetClasses)
    expect(formTabbedAsideSlotClasses).toContain(formTabbedAsideSlotBottomInsetClasses)
  })

  it('defines scroll-body top inset that scrolls with form content', () => {
    expect(formViewportScrollBodyTopInsetClasses).toBe('pt-8')
  })
})
