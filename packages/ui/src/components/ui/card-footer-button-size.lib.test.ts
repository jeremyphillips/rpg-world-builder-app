import { describe, expect, it } from 'vitest'

import { resolveCardFooterButtonSize } from './card-footer-button-size.lib'

describe('resolveCardFooterButtonSize', () => {
  it('uses sm for compact and comfortable card density', () => {
    expect(resolveCardFooterButtonSize('compact')).toBe('sm')
    expect(resolveCardFooterButtonSize('comfortable')).toBe('sm')
  })

  it('uses default (md tier) for spacious card density', () => {
    expect(resolveCardFooterButtonSize('spacious')).toBe('default')
  })
})
