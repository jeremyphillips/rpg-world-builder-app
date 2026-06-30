import { describe, expect, it } from 'vitest'

import { isEmbeddedRowSystemLocked } from './is-embedded-row-system-locked'

describe('isEmbeddedRowSystemLocked', () => {
  it('locks existing rows on system entities', () => {
    expect(isEmbeddedRowSystemLocked({ id: 'rage' }, 'system')).toBe(true)
  })

  it('allows new rows without an id on system entities', () => {
    expect(isEmbeddedRowSystemLocked({}, 'system')).toBe(false)
    expect(isEmbeddedRowSystemLocked(undefined, 'system')).toBe(false)
  })

  it('allows any row on homebrew entities', () => {
    expect(isEmbeddedRowSystemLocked({ id: 'rage' }, 'homebrew')).toBe(false)
    expect(isEmbeddedRowSystemLocked({}, 'homebrew')).toBe(false)
  })

  it('allows rows when entity source is unset', () => {
    expect(isEmbeddedRowSystemLocked({ id: 'rage' }, undefined)).toBe(false)
  })
})
