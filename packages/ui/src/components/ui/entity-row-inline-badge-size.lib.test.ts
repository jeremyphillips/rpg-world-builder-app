import { describe, expect, it } from 'vitest'

import { resolveEntityRowInlineBadgeSize } from './entity-row-inline-badge-size.lib'

describe('resolveEntityRowInlineBadgeSize', () => {
  it('maps compact and comfortable to sm', () => {
    expect(resolveEntityRowInlineBadgeSize('compact')).toBe('sm')
    expect(resolveEntityRowInlineBadgeSize('comfortable')).toBe('sm')
  })

  it('maps spacious to md', () => {
    expect(resolveEntityRowInlineBadgeSize('spacious')).toBe('md')
  })
})
