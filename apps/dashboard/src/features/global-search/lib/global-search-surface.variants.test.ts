import { describe, expect, it } from 'vitest'

import { globalSearchPageResultsShellClasses } from './global-search-surface.variants'

describe('global-search-surface variants', () => {
  it('establishes faint plane on the page results shell', () => {
    expect(globalSearchPageResultsShellClasses).toContain('bg-surface-faint')
    expect(globalSearchPageResultsShellClasses).toContain('rounded-md')
    expect(globalSearchPageResultsShellClasses).toContain(
      '[--surface-current:var(--surface-faint)]',
    )
  })
})
