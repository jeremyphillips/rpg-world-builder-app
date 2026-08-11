import { describe, expect, it } from 'vitest'

import {
  dialogContentFocusShellClasses,
  dialogPanelActionRowClasses,
  dialogPanelBodyVariants,
  dialogPanelFooterClasses,
  dialogPanelSectionInsetXClasses,
  dialogPanelSectionPaddingClasses,
  dialogPanelStableBodyVariants,
  dialogPanelScrollRegionBottomInsetClasses,
  dialogPanelScrollRegionClasses,
} from './dialog-panel.variants'
import { sheetBodyVariants, sheetFooterDockClasses } from './sheet.variants'

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

  it('uses horizontal inset only on stable body without bottom padding', () => {
    const stableBodyClasses = dialogPanelStableBodyVariants()
    expect(stableBodyClasses).toContain(dialogPanelSectionInsetXClasses)
    expect(stableBodyClasses).toContain('pb-0')
    expect(stableBodyClasses).toContain('overflow-hidden')
    expect(stableBodyClasses).toContain('flex-1')
    expect(stableBodyClasses).not.toContain(dialogPanelSectionPaddingClasses)
    expect(stableBodyClasses).not.toContain('overflow-y-auto')
  })

  it('applies bottom inset on inner scroll regions above docked footers', () => {
    expect(dialogPanelScrollRegionClasses).toContain('overflow-y-auto')
    expect(dialogPanelScrollRegionClasses).toContain('min-h-0')
    expect(dialogPanelScrollRegionClasses).toContain('flex-1')
    expect(dialogPanelScrollRegionClasses).toContain(dialogPanelScrollRegionBottomInsetClasses)
    expect(dialogPanelScrollRegionClasses).toContain('px-1')
    expect(dialogPanelScrollRegionBottomInsetClasses).toBe('pb-6')
  })

  it('suppresses visible outlines on programmatic panel focus', () => {
    expect(dialogContentFocusShellClasses).toContain('outline-none')
    expect(dialogContentFocusShellClasses).toContain('focus-visible:outline-none')
  })

  it('shares body padding with Sheet adding flex-1', () => {
    expect(sheetBodyVariants()).toContain('flex-1')
    expect(sheetBodyVariants()).toContain(dialogPanelSectionPaddingClasses)
    expect(sheetBodyVariants()).toContain('overflow-y-auto')
  })
})

describe('overlay footer ownership boundaries', () => {
  it('keeps shared footer chrome free of fill, dock, and action-row concerns', () => {
    expect(dialogPanelFooterClasses).toContain('border-t')
    expect(dialogPanelFooterClasses).toContain('border-border-faint')
    expect(dialogPanelFooterClasses).toContain('px-6')
    expect(dialogPanelFooterClasses).toContain('py-4')
    expect(dialogPanelFooterClasses).toContain('flex-col')
    expect(dialogPanelFooterClasses).not.toMatch(/\bbg-/)
    expect(dialogPanelFooterClasses).not.toMatch(/\bshrink-0\b/)
    expect(dialogPanelFooterClasses).not.toMatch(/\bjustify-end\b/)
  })

  it('keeps sheet dock placement separate from footer chrome', () => {
    expect(sheetFooterDockClasses).toBe('shrink-0 z-20')
    expect(sheetFooterDockClasses).not.toMatch(/border/)
    expect(sheetFooterDockClasses).not.toMatch(/p[xytblr]?-/)
  })
})
