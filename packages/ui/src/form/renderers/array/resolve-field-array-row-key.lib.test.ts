import { describe, expect, it } from 'vitest'

import { resolveFieldArrayRowKey } from './resolve-field-array-row-key.lib'

describe('resolveFieldArrayRowKey', () => {
  it('uses default id when keyName is omitted', () => {
    expect(resolveFieldArrayRowKey({ id: 'rhf-row-1' }, undefined)).toBe('rhf-row-1')
  })

  it('uses configured keyName for list keys while domain id remains separate', () => {
    expect(
      resolveFieldArrayRowKey(
        { id: 'omt_persisted', _fieldArrayKey: 'synthetic-1' },
        '_fieldArrayKey',
      ),
    ).toBe('synthetic-1')
  })
})
