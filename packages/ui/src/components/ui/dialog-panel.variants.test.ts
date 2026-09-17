import { describe, expect, it } from 'vitest'

import { boundedScrollRegionEndInsetClasses } from './bounded-scroll-region.variants'
import {
  dialogContentFocusShellClasses,
  dialogPanelActionRowClasses,
  dialogPanelBodyVariants,
  dialogPanelFooterClasses,
  dialogPanelHeaderClasses,
  dialogPanelHeaderPaddingClasses,
  dialogPanelInnerLeadingScrollViewportClasses,
  dialogPanelInnerScrollViewportClasses,
  dialogPanelManagedBodyVariants,
  dialogPanelSectionScrollViewportClasses,
  dialogPanelSectionSeparatorBorderClasses,
  dialogPanelSectionInsetXClasses,
  dialogPanelSectionPaddingClasses,
  dialogPanelStableBodyVariants,
  dialogPanelScrollRegionBottomInsetClasses,
  dialogPanelScrollRegionClasses,
  dialogPanelScrollRegionFocusClearanceClasses,
  dialogPanelScrollRegionTopInsetClasses,
  dialogPanelScrollRegionViewportClasses,
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

  it('composes default body as a clip shell without self overflow', () => {
    const bodyClasses = dialogPanelBodyVariants()
    expect(bodyClasses).toContain('overflow-hidden')
    expect(bodyClasses).toContain('flex-1')
    expect(bodyClasses).not.toContain('overflow-y-auto')
    expect(bodyClasses).not.toContain('p-6')
  })

  it('restores section horizontal inset on stable body shell', () => {
    const stableBodyClasses = dialogPanelStableBodyVariants()
    expect(stableBodyClasses).toContain('pb-0')
    expect(stableBodyClasses).toContain('overflow-hidden')
    expect(stableBodyClasses).toContain('flex-1')
    expect(stableBodyClasses).toContain(dialogPanelSectionInsetXClasses)
    expect(stableBodyClasses).not.toContain('overflow-y-auto')
  })

  it('uses managed body clip shell with p-0', () => {
    const managedBodyClasses = dialogPanelManagedBodyVariants()
    expect(managedBodyClasses).toContain('p-0')
    expect(managedBodyClasses).toContain('overflow-hidden')
    expect(managedBodyClasses).not.toContain('overflow-y-auto')
  })

  it('keeps section scrollport free of inner scroll chrome', () => {
    expect(dialogPanelSectionScrollViewportClasses).toContain(dialogPanelSectionInsetXClasses)
    expect(dialogPanelSectionScrollViewportClasses).toContain(
      dialogPanelScrollRegionTopInsetClasses,
    )
    expect(dialogPanelSectionScrollViewportClasses).toContain(
      dialogPanelScrollRegionBottomInsetClasses,
    )
    expect(dialogPanelSectionScrollViewportClasses).toContain('overflow-y-auto')
    expect(dialogPanelSectionScrollViewportClasses).not.toContain('p-6')
    expect(dialogPanelSectionScrollViewportClasses).toContain('pe-6')
    expect(dialogPanelSectionScrollViewportClasses).not.toContain('ps-1')
    expect(dialogPanelSectionScrollViewportClasses).not.toContain('pe-2.5')
  })

  it('keeps inner scrollport free of section horizontal inset and top inset', () => {
    expect(dialogPanelInnerScrollViewportClasses).toContain(
      dialogPanelScrollRegionBottomInsetClasses,
    )
    expect(dialogPanelInnerScrollViewportClasses).toContain(
      dialogPanelScrollRegionFocusClearanceClasses,
    )
    expect(dialogPanelInnerScrollViewportClasses).toContain(boundedScrollRegionEndInsetClasses)
    expect(dialogPanelInnerScrollViewportClasses).toContain('overflow-y-auto')
    expect(dialogPanelInnerScrollViewportClasses).not.toContain(dialogPanelSectionInsetXClasses)
    expect(dialogPanelInnerScrollViewportClasses).not.toContain('px-6')
    expect(dialogPanelInnerScrollViewportClasses).not.toContain('pt-5')
  })

  it('adds top inset to leading inner scrollport below the header border', () => {
    expect(dialogPanelInnerLeadingScrollViewportClasses).toContain(
      dialogPanelInnerScrollViewportClasses,
    )
    expect(dialogPanelInnerLeadingScrollViewportClasses).toContain(
      dialogPanelScrollRegionTopInsetClasses,
    )
  })

  it('aliases deprecated viewport token to section preset', () => {
    expect(dialogPanelScrollRegionViewportClasses).toBe(dialogPanelSectionScrollViewportClasses)
  })

  it('applies inner preset on deprecated inner scroll region alias', () => {
    expect(dialogPanelScrollRegionClasses).toContain('min-h-0')
    expect(dialogPanelScrollRegionClasses).toContain('flex-1')
    expect(dialogPanelScrollRegionClasses).toContain(dialogPanelInnerScrollViewportClasses)
    expect(dialogPanelScrollRegionClasses).not.toContain(dialogPanelSectionInsetXClasses)
    expect(dialogPanelScrollRegionBottomInsetClasses).toBe('pb-6')
  })

  it('suppresses visible outlines on programmatic panel focus', () => {
    expect(dialogContentFocusShellClasses).toContain('outline-none')
    expect(dialogContentFocusShellClasses).toContain('focus-visible:outline-none')
  })

  it('keeps sheet body variants aligned with dialog clip shell', () => {
    expect(sheetBodyVariants()).toContain('overflow-hidden')
    expect(sheetBodyVariants()).toContain('flex-1')
    expect(sheetBodyVariants()).not.toContain('overflow-y-auto')
  })
})

describe('overlay section separator borders', () => {
  it('syncs header and footer separator color via one token', () => {
    expect(dialogPanelSectionSeparatorBorderClasses).toBe('border-border-faint')
    expect(dialogPanelHeaderClasses).toContain('border-b')
    expect(dialogPanelHeaderClasses).toContain(dialogPanelSectionSeparatorBorderClasses)
    expect(dialogPanelFooterClasses).toContain('border-t')
    expect(dialogPanelFooterClasses).toContain(dialogPanelSectionSeparatorBorderClasses)
  })

  it('keeps header chrome on section inset with 16px bottom padding', () => {
    expect(dialogPanelHeaderPaddingClasses).toContain(dialogPanelSectionInsetXClasses)
    expect(dialogPanelHeaderPaddingClasses).toContain('pt-6')
    expect(dialogPanelHeaderPaddingClasses).toContain('pb-4')
    expect(dialogPanelHeaderClasses).not.toMatch(/\bjustify-end\b/)
  })
})

describe('overlay footer ownership boundaries', () => {
  it('keeps shared footer chrome free of fill, dock, and action-row concerns', () => {
    expect(dialogPanelFooterClasses).toContain('border-t')
    expect(dialogPanelFooterClasses).toContain(dialogPanelSectionSeparatorBorderClasses)
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
