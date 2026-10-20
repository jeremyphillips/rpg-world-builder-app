import { describe, expect, it } from 'vitest'

import { resolveHeadingAccessoryBadgeSize } from './heading-accessory-size.lib'

describe('resolveHeadingAccessoryBadgeSize', () => {
  it('uses sm for compact and comfortable card density', () => {
    expect(resolveHeadingAccessoryBadgeSize('compact')).toBe('sm')
    expect(resolveHeadingAccessoryBadgeSize('comfortable')).toBe('sm')
  })

  it('uses md for spacious card density', () => {
    expect(resolveHeadingAccessoryBadgeSize('spacious')).toBe('md')
  })
})
