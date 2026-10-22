import { describe, expect, it } from 'vitest'

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
import { DEFAULT_INSET_PANEL_SURFACE, insetPanelClassNames } from './inset-panel.variants'

describe('emptyStateWell variants', () => {
  it('keeps shell and content on the sunken muted contract', () => {
    expect(emptyStateWellSurfaceClasses).toContain('bg-sunken')
    expect(emptyStateWellSurfaceClasses).toContain('[--surface-current:var(--sunken)]')
    expect(emptyStateWellPassiveMessageClasses).toContain('text-style-caption')
    expect(emptyStateWellPassiveMessageClasses).toContain('italic')
    expect(emptyStateWellTitleClasses).toContain('text-muted-foreground')
    expect(emptyStateWellTitleClasses).not.toContain('italic')
    expect(emptyStateWellTitleClasses).not.toContain('text-foreground')
    expect(emptyStateWellTitleLgClasses).toContain('text-muted-foreground')
    expect(emptyStateWellTitleLgClasses).not.toContain('italic')
    expect(emptyStateWellSupportingClasses).toContain('text-style-supporting')
    expect(emptyStateWellSupportingClasses).not.toContain('italic')
    expect(emptyStateWellIconMdClasses).toContain('text-muted-foreground')
    expect(emptyStateWellIconMdClasses).toContain('opacity-50')
    expect(emptyStateWellIconLgClasses).toContain('opacity-50')
    expect(resolveEmptyStateWellIconClasses('md')).toContain('opacity-50')
  })

  it('keeps empty panel and inset presets aligned with the well contract', () => {
    expect(
      insetPanelClassNames({
        borderStyle: 'dashed',
        surface: DEFAULT_INSET_PANEL_SURFACE,
        size: 'md',
        align: 'center',
      }),
    ).toContain('bg-sunken')
  })
})
