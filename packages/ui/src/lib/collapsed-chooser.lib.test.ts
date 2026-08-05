import { describe, expect, it } from 'vitest'

import { resolveDefaultChooserExpanded, shouldShowChooserSummary } from './collapsed-chooser.lib'

describe('collapsed-chooser.lib', () => {
  describe('shouldShowChooserSummary', () => {
    it('shows the summary when a value is selected and the chooser is collapsed', () => {
      expect(shouldShowChooserSummary({ value: 'governs', expanded: false })).toBe(true)
    })

    it('shows the chooser when nothing is selected', () => {
      expect(shouldShowChooserSummary({ value: null, expanded: false })).toBe(false)
    })

    it('shows the chooser when expanded even with a selected value', () => {
      expect(shouldShowChooserSummary({ value: 'governs', expanded: true })).toBe(false)
    })
  })

  describe('resolveDefaultChooserExpanded', () => {
    it('defaults to expanded when no value is selected', () => {
      expect(resolveDefaultChooserExpanded(null)).toBe(true)
      expect(resolveDefaultChooserExpanded(undefined)).toBe(true)
      expect(resolveDefaultChooserExpanded('')).toBe(true)
    })

    it('defaults to collapsed when a value is pre-selected', () => {
      expect(resolveDefaultChooserExpanded('governs')).toBe(false)
    })
  })
})
