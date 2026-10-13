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

  it('targets the equipped plain stack when another plain stack is unequipped', () => {
    const entries = [
      {
        entryId: 'plain-unequipped',
        equipmentId: 'srd:dagger',
        quantity: 1,
        equipped: false,
      },
      {
        entryId: 'plain-equipped',
        equipmentId: 'srd:dagger',
        quantity: 1,
        equipped: true,
      },
    ]
    const next = incrementMonsterPlainStack(entries, 'srd:dagger')
    expect(next.find((row) => row.entryId === 'plain-equipped')?.quantity).toBe(2)
    expect(next.find((row) => row.entryId === 'plain-unequipped')?.quantity).toBe(1)
  })

  it('creates a new plain stack when only customized copies exist for an id', () => {
    const entries = [
      {
        entryId: 'custom',
        equipmentId: 'srd:dagger',
        quantity: 1,
        equipped: true,
        magical: true,
      },
    ]
    const next = incrementMonsterPlainStack(entries, 'srd:dagger')
    expect(next).toHaveLength(2)
    const plain = next.find((row) => row.entryId !== 'custom')
    expect(plain?.quantity).toBe(1)
    expect(plain?.magical).toBeFalsy()
    expect(next.find((row) => row.entryId === 'custom')?.quantity).toBe(1)
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
