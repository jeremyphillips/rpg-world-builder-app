import { describe, expect, it } from 'vitest'

import { emptyPanelVariants } from './empty-panel.variants'
import {
  emptyStateWellPassiveMessageClasses,
  emptyStateWellIconLgClasses,
  emptyStateWellIconMdClasses,
  emptyStateWellSupportingClasses,
  emptyStateWellSurfaceClasses,
  emptyStateWellTitleClasses,
  emptyStateWellTitleLgClasses,
  resolveEmptyStateWellIconClasses,
} from './empty-state-well.variants'
import { insetPanelEmptyStateClasses } from './inset-panel.variants'

describe('emptyStateWell variants', () => {
  it('keeps shell and content on the sunken muted contract', () => {
    expect(emptyStateWellSurfaceClasses).toContain('bg-sunken')
    expect(emptyStateWellSurfaceClasses).toContain('[--surface-current:var(--sunken)]')
    expect(emptyStateWellPassiveMessageClasses).toContain('text-muted-foreground')
    expect(emptyStateWellPassiveMessageClasses).toContain('italic')
    expect(emptyStateWellTitleClasses).toContain('text-muted-foreground')
    expect(emptyStateWellTitleClasses).not.toContain('italic')
    expect(emptyStateWellTitleClasses).not.toContain('text-foreground')
    expect(emptyStateWellTitleLgClasses).toContain('text-muted-foreground')
    expect(emptyStateWellTitleLgClasses).not.toContain('italic')
    expect(emptyStateWellSupportingClasses).toContain('text-muted-foreground')
    expect(emptyStateWellSupportingClasses).not.toContain('italic')
    expect(emptyStateWellIconMdClasses).toContain('text-muted-foreground')
    expect(emptyStateWellIconMdClasses).toContain('opacity-50')
    expect(emptyStateWellIconLgClasses).toContain('opacity-50')
    expect(resolveEmptyStateWellIconClasses('md')).toContain('opacity-50')
  })

  it('keeps empty panel and inset presets aligned with the well contract', () => {
    expect(emptyPanelVariants()).toContain('bg-sunken')
    expect(emptyPanelVariants()).toContain('text-muted-foreground')
    expect(emptyPanelVariants()).toContain('italic')
    expect(insetPanelEmptyStateClasses).toContain('bg-sunken')
  })
})
