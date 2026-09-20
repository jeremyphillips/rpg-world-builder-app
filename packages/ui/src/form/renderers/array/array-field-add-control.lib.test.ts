import { describe, expect, it } from 'vitest'

import {
  resolveArrayAddButtonDensity,
  resolveArrayAddDisabledProps,
} from './array-field-add-control.lib'

describe('array-field-add-control.lib', () => {
  it('resolves compact density for inline text add actions', () => {
    expect(resolveArrayAddButtonDensity('inline', 'text')).toBe('compact')
    expect(resolveArrayAddButtonDensity('inline', 'outline')).toBeUndefined()
    expect(resolveArrayAddButtonDensity('stacked', 'text')).toBeUndefined()
  })

  it('resolves disabled props only when append is blocked', () => {
    expect(resolveArrayAddDisabledProps(true)).toEqual({})
    expect(resolveArrayAddDisabledProps(false, 'Limit reached', 'reason-id')).toEqual({
      disabled: true,
      title: 'Limit reached',
      'aria-disabled': true,
      'aria-describedby': 'reason-id',
    })
    expect(resolveArrayAddDisabledProps(false)).toEqual({
      disabled: true,
      'aria-disabled': true,
      'aria-describedby': undefined,
    })
  })
})
