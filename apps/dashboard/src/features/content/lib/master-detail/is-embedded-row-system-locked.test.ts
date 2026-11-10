import { describe, expect, it } from 'vitest'

import { isEmbeddedRowSystemLocked } from './is-embedded-row-system-locked'

const origin = new Set(['rage'])

describe('isEmbeddedRowSystemLocked', () => {
  it('locks rows that were on the system entity at load', () => {
    expect(isEmbeddedRowSystemLocked({ id: 'rage' }, 'system', origin)).toBe(true)
  })

  it('allows rows added after load, even on a system entity', () => {
    expect(isEmbeddedRowSystemLocked({ id: 'added' }, 'system', origin)).toBe(false)
    expect(isEmbeddedRowSystemLocked({}, 'system', origin)).toBe(false)
    expect(isEmbeddedRowSystemLocked(undefined, 'system', origin)).toBe(false)
  })

  it('allows any row on homebrew entities', () => {
    expect(isEmbeddedRowSystemLocked({ id: 'rage' }, 'homebrew', origin)).toBe(false)
    expect(isEmbeddedRowSystemLocked({}, 'homebrew')).toBe(false)
  })

  it('allows rows when entity source is unset', () => {
    expect(isEmbeddedRowSystemLocked({ id: 'rage' }, undefined, origin)).toBe(false)
  })
})
