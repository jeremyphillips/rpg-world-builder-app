import { describe, expect, it } from 'vitest'

import { resolveEntityRowInlineIconActionButtonSize } from './entity-row-inline-icon-action-button-size.lib'

describe('resolveEntityRowInlineIconActionButtonSize', () => {
  it('maps compact and comfortable to icon-xs', () => {
    expect(resolveEntityRowInlineIconActionButtonSize('compact')).toBe('icon-xs')
    expect(resolveEntityRowInlineIconActionButtonSize('comfortable')).toBe('icon-xs')
    expect(resolveEntityRowInlineIconActionButtonSize()).toBe('icon-xs')
  })

  it('maps spacious to icon-sm', () => {
    expect(resolveEntityRowInlineIconActionButtonSize('spacious')).toBe('icon-sm')
  })
})
