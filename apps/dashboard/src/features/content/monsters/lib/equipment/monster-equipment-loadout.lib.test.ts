import { describe, expect, it } from 'vitest'

import { pickEquipment } from '@/test/fixtures/pick'

import { EQUIPMENT_INVENTORY_GROUP_LABELS } from '../../../equipment/lib/inventory/equipment-inventory-group-labels.lib'

import {
  createPlainMonsterEquipmentEntry,
  groupMonsterEquipmentByKind,
  incrementMonsterPlainStack,
  incrementMonsterPlainStacks,
  replaceMonsterArmorSlotEntry,
  setMonsterPlainStackQuantity,
} from './monster-equipment-loadout.lib'

describe('monster-equipment-loadout.lib', () => {
  it('increments and creates a plain stack', () => {
    const next = incrementMonsterPlainStack([], 'srd:dagger')
    expect(next).toHaveLength(1)
    expect(next[0]?.quantity).toBe(1)
    expect(next[0]?.equipped).toBe(true)
  })

  it('creates an unequipped plain stack when requested', () => {
    const next = incrementMonsterPlainStack([], 'srd:dagger', { equipped: false })
    expect(next).toHaveLength(1)
    expect(next[0]?.quantity).toBe(1)
    expect(next[0]?.equipped).toBe(false)
  })

  it('incrementMonsterPlainStacks matches sequential single adds', () => {
    const dagger = pickEquipment('dagger')
    const shortsword = pickEquipment('shortsword')
    const ids = [dagger.id, shortsword.id, dagger.id]
    const sequential = ids.reduce(
      (acc, id) => incrementMonsterPlainStack(acc, id, { equipped: false }),
      [] as ReturnType<typeof incrementMonsterPlainStack>,
    )
    const batched = incrementMonsterPlainStacks([], ids, { equipped: false })

    const summarize = (entries: ReturnType<typeof incrementMonsterPlainStack>) =>
      entries
        .map((entry) => ({
          equipmentId: entry.equipmentId,
          quantity: entry.quantity,
          equipped: entry.equipped,
        }))
        .sort((a, b) => a.equipmentId.localeCompare(b.equipmentId))

    expect(summarize(batched)).toEqual(summarize(sequential))
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

  it('orders groups by inventory bucket labels and uses gear for unresolved ids', () => {
    const dagger = pickEquipment('dagger')
    const rope = pickEquipment('rope')
    const catalog = new Map([
      [dagger.id, dagger],
      [rope.id, rope],
    ])
    const groups = groupMonsterEquipmentByKind(
      [
        { entryId: 'r1', equipmentId: rope.id, quantity: 1 },
        { entryId: 'w1', equipmentId: dagger.id, quantity: 1 },
        { entryId: 'bad', equipmentId: 'missing-id', quantity: 1 },
      ],
      catalog,
    )
    expect(groups.map((group) => group.groupLabel)).toEqual([
      EQUIPMENT_INVENTORY_GROUP_LABELS.weapons,
      EQUIPMENT_INVENTORY_GROUP_LABELS.gear,
    ])
    expect(groups[1]?.entries.map((entry) => entry.entryId)).toEqual(['r1', 'bad'])
  })

  it('replaces the owned body armor and leaves other gear', () => {
    const leather = pickEquipment('leather-armor')
    const chain = pickEquipment('chain-mail')
    const dagger = pickEquipment('dagger')
    const catalog = new Map([leather, chain, dagger].map((item) => [item.id, item]))
    const next = replaceMonsterArmorSlotEntry(
      [createPlainMonsterEquipmentEntry(leather.id), createPlainMonsterEquipmentEntry(dagger.id)],
      'body-armor',
      chain.id,
      catalog,
    )
    expect(next.map((entry) => entry.equipmentId)).toEqual([dagger.id, chain.id])
    expect(next.find((entry) => entry.equipmentId === chain.id)).toMatchObject({
      quantity: 1,
      equipped: true,
    })
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
