import { describe, expect, it } from 'vitest'

import { wrapMasterDetailDetailFields } from './wrap-master-detail-detail-fields'

describe('wrapMasterDetailDetailFields', () => {
  it('wraps fields in a single group that opts out of field container chrome', () => {
    const fields = [{ type: 'text' as const, name: 'name', label: 'Name' }]

    expect(wrapMasterDetailDetailFields(fields)).toEqual([
      {
        kind: 'group',
        fieldChrome: { variant: 'none' },
        fields,
      },
    ])
  })
})
