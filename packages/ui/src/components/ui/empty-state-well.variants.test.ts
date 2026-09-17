import { describe, expect, it } from 'vitest'

import { emptyPanelVariants } from './empty-panel.variants'
import {
  emptyStateWellBodyClasses,
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
    expect(emptyStateWellBodyClasses).toContain('text-muted-foreground')
    expect(emptyStateWellTitleClasses).toContain('text-muted-foreground')
    expect(emptyStateWellTitleClasses).not.toContain('text-foreground')
    expect(emptyStateWellTitleLgClasses).toContain('text-muted-foreground')
    expect(emptyStateWellSupportingClasses).toContain('text-muted-foreground')
    expect(emptyStateWellIconMdClasses).toContain('text-muted-foreground')
    expect(emptyStateWellIconMdClasses).toContain('opacity-50')
    expect(emptyStateWellIconLgClasses).toContain('opacity-50')
    expect(resolveEmptyStateWellIconClasses('md')).toContain('opacity-50')
  })

  it('keeps empty panel and inset presets aligned with the well contract', () => {
    expect(emptyPanelVariants()).toContain('bg-sunken')
    expect(emptyPanelVariants()).toContain('text-muted-foreground')
    expect(insetPanelEmptyStateClasses).toContain('bg-sunken')
  })
})
