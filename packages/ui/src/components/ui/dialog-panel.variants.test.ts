import { describe, expect, it } from 'vitest'

import {
  dialogPanelActionRowClasses,
  dialogPanelBodyVariants,
  dialogPanelSectionInsetXClasses,
  dialogPanelSectionPaddingClasses,
} from './dialog-panel.variants'
import {
  sheetBodyVariants,
  sheetFooterChromeClasses,
  sheetFooterDockVerticalRhythmClasses,
} from './sheet.variants'

describe('dialog-panel variants', () => {
  it('owns the canonical section inset vocabulary', () => {
    expect(dialogPanelSectionPaddingClasses).toBe('p-6')
  })

  it('keeps horizontal inset aligned with section padding scale', () => {
    const paddingMatch = dialogPanelSectionPaddingClasses.match(/^p-(\d+(?:\.\d+)?)$/)
    expect(paddingMatch).not.toBeNull()
    expect(dialogPanelSectionInsetXClasses).toBe(`px-${paddingMatch![1]}`)
  })

  it('keeps action row layout-only (no padding or dock chrome)', () => {
    expect(dialogPanelActionRowClasses).toBe('flex items-center justify-end gap-2')
    expect(dialogPanelActionRowClasses.split(/\s+/)).not.toEqual(
      expect.arrayContaining([expect.stringMatching(/^(p|px|py|pt|pb|pl|pr|border|bg)-/)]),
    )
  })

  it('composes body from section padding (not a parallel p-6 string)', () => {
    const bodyClasses = dialogPanelBodyVariants()
    expect(bodyClasses).toContain(dialogPanelSectionPaddingClasses)
    expect(bodyClasses).toContain('overflow-y-auto')
    expect(bodyClasses).toContain('pt-0')
    expect(bodyClasses).not.toContain('flex-1')
  })

  it('shares body padding with Sheet adding flex-1', () => {
    expect(sheetBodyVariants()).toContain('flex-1')
    expect(sheetBodyVariants()).toContain(dialogPanelSectionPaddingClasses)
    expect(sheetBodyVariants()).toContain('overflow-y-auto')
  })
})

describe('sheet footer ownership boundaries', () => {
  it('keeps dock chrome free of action-row and section-padding concerns', () => {
    expect(sheetFooterChromeClasses).toContain('border-t')
    expect(sheetFooterChromeClasses).toContain('shrink-0')
    expect(sheetFooterChromeClasses).not.toMatch(/\bflex\b/)
    expect(sheetFooterChromeClasses).not.toMatch(/\bp-6\b/)
    expect(sheetFooterChromeClasses).not.toMatch(/\bpx-6\b/)
  })

  it('keeps form dock vertical rhythm separate from horizontal section inset', () => {
    expect(sheetFooterDockVerticalRhythmClasses).toBe('pt-4 pb-4')
    expect(sheetFooterDockVerticalRhythmClasses).not.toMatch(/px-/)
  })
})
