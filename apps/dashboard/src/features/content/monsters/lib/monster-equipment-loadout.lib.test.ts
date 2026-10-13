import { describe, expect, it } from 'vitest'

import {
  incrementMonsterPlainStack,
  setMonsterPlainStackQuantity,
} from './monster-equipment-loadout.lib'

describe('monster-equipment-loadout.lib', () => {
  it('increments and creates a plain stack', () => {
    const next = incrementMonsterPlainStack([], 'srd:dagger')
    expect(next).toHaveLength(1)
    expect(next[0]?.quantity).toBe(1)
    expect(next[0]?.equipped).toBe(true)
  })

  it('removes the plain stack when quantity hits zero', () => {
    const entries = [
      {
        entryId: 'a',
        equipmentId: 'srd:dagger',
        quantity: 2,
        equipped: true,
      },
    ]
    const next = setMonsterPlainStackQuantity(entries, 'srd:dagger', 0)
    expect(next).toHaveLength(0)
  })
})
