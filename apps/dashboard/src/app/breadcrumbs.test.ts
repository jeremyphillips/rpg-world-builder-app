import { describe, expect, it } from 'vitest'

import { hasInlineBreadcrumbPlacement } from './breadcrumbs'

describe('hasInlineBreadcrumbPlacement', () => {
  it('returns true for inline placement handles', () => {
    expect(hasInlineBreadcrumbPlacement({ breadcrumbPlacement: 'inline' })).toBe(true)
  })

  it('returns false for other handles', () => {
    expect(hasInlineBreadcrumbPlacement({ breadcrumbMode: 'edit' })).toBe(false)
    expect(hasInlineBreadcrumbPlacement(undefined)).toBe(false)
  })
})
