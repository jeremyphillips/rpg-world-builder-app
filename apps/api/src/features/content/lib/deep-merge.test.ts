import { describe, expect, it } from 'vitest'

import { deepMerge } from './deep-merge'

describe('deepMerge', () => {
  it('deep-merges nested plain objects', () => {
    const base = { a: 1, nested: { x: 1, y: 2 } }
    const result = deepMerge(base, { nested: { y: 20, z: 30 } })
    expect(result).toEqual({ a: 1, nested: { x: 1, y: 20, z: 30 } })
  })

  it('replaces arrays wholesale (does not merge element-wise)', () => {
    const base = { items: [1, 2, 3] }
    expect(deepMerge(base, { items: [9] })).toEqual({ items: [9] })
  })

  it('replaces primitives and skips undefined patch values', () => {
    const base = { a: 1, b: 2 }
    expect(deepMerge(base, { a: 5, b: undefined })).toEqual({ a: 5, b: 2 })
  })

  it('does not mutate the base object', () => {
    const base = { nested: { x: 1 } }
    deepMerge(base, { nested: { x: 99 } })
    expect(base.nested.x).toBe(1)
  })
})
