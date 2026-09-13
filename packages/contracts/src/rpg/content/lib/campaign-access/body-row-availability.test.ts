import { describe, expect, it } from 'vitest'

import { availableBodyRows, isBodyRowAvailable } from './body-row-availability'

describe('isBodyRowAvailable', () => {
  it('treats omitted and true as available', () => {
    expect(isBodyRowAvailable({})).toBe(true)
    expect(isBodyRowAvailable({ available: true })).toBe(true)
  })

  it('treats false as unavailable', () => {
    expect(isBodyRowAvailable({ available: false })).toBe(false)
  })
})

describe('availableBodyRows', () => {
  it('filters unavailable rows', () => {
    const rows = [{ id: 'a', available: true }, { id: 'b', available: false }, { id: 'c' }]
    expect(availableBodyRows(rows).map((row) => row.id)).toEqual(['a', 'c'])
  })
})
