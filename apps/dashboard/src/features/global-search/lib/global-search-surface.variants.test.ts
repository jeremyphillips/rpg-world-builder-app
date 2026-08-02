import { describe, expect, it } from 'vitest'

import {
  globalSearchPageResultsShellClasses,
  resolveGlobalSearchHeadingSurfaceClasses,
  resolveGlobalSearchRowHoverSurfaceClasses,
} from './global-search-surface.variants'

describe('global-search-surface variants', () => {
  it('steps heading and row hover one rung above each surface base', () => {
    expect(resolveGlobalSearchHeadingSurfaceClasses('preview')).toBe('bg-surface-muted')
    expect(resolveGlobalSearchHeadingSurfaceClasses('page')).toBe('bg-surface-subtle')
    expect(resolveGlobalSearchRowHoverSurfaceClasses('preview')).toBe('hover:bg-surface-muted')
    expect(resolveGlobalSearchRowHoverSurfaceClasses('page')).toBe('hover:bg-surface-subtle')
  })

  it('establishes faint plane on the page results shell', () => {
    expect(globalSearchPageResultsShellClasses).toContain('bg-surface-faint')
    expect(globalSearchPageResultsShellClasses).toContain('rounded-md')
    expect(globalSearchPageResultsShellClasses).toContain(
      '[--surface-current:var(--surface-faint)]',
    )
  })
})
