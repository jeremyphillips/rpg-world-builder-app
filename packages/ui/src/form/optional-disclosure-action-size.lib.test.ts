import { describe, expect, it } from 'vitest'

import { resolveOptionalDisclosureActionButtonSize } from './optional-disclosure-action-size.lib'

describe('resolveOptionalDisclosureActionButtonSize', () => {
  it('uses xs for inline-with-label placement regardless of field size', () => {
    expect(
      resolveOptionalDisclosureActionButtonSize({
        placement: 'inlineWithLabel',
        fieldSize: 'sm',
      }),
    ).toBe('xs')
    expect(
      resolveOptionalDisclosureActionButtonSize({
        placement: 'inlineWithLabel',
        fieldSize: 'md',
      }),
    ).toBe('xs')
  })

  it('maps standalone collapsed actions to field control scale', () => {
    expect(
      resolveOptionalDisclosureActionButtonSize({
        placement: 'standalone',
        fieldSize: 'xs',
      }),
    ).toBe('xs')
    expect(
      resolveOptionalDisclosureActionButtonSize({
        placement: 'standalone',
        fieldSize: 'sm',
      }),
    ).toBe('sm')
    expect(
      resolveOptionalDisclosureActionButtonSize({
        placement: 'standalone',
        fieldSize: 'md',
      }),
    ).toBe('default')
    expect(
      resolveOptionalDisclosureActionButtonSize({
        placement: 'standalone',
        fieldSize: 'lg',
      }),
    ).toBe('default')
  })
})
