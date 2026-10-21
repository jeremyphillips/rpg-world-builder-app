import { describe, expect, it } from 'vitest'

import { globalSearchPageResultsShellClasses } from './global-search-surface.variants'

describe('global-search-surface variants', () => {
  it('uses transparent panel chrome aligned with destination list panel', () => {
    expect(globalSearchPageResultsShellClasses).toContain('bg-transparent')
    expect(globalSearchPageResultsShellClasses).toContain('border-border')
    expect(globalSearchPageResultsShellClasses).toContain('rounded-md')
    expect(globalSearchPageResultsShellClasses).not.toContain('bg-surface-faint')
  })
})
