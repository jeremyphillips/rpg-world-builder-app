import { describe, expect, it } from 'vitest'

import {
  MONSTER_ARMOR_OWNERSHIP_VIOLATION_ID,
  monsterArmorOwnershipViolations,
} from './monster-armor-ownership'

const leather = { kind: 'armor', category: 'light' }
const chain = { kind: 'armor', category: 'heavy' }
const shield = { kind: 'armor', category: 'shields' }
const dagger = { kind: 'weapon', category: 'simple' }

const catalog = new Map<string, { kind: string; category?: string }>([
  ['leather', leather],
  ['chain', chain],
  ['shield', shield],
  ['dagger', dagger],
])

describe('monsterArmorOwnershipViolations', () => {
  it('accepts one body armor and one shield', () => {
    expect(
      monsterArmorOwnershipViolations(
        [
          { equipmentId: 'leather', quantity: 1 },
          { equipmentId: 'shield', quantity: 1 },
          { equipmentId: 'dagger', quantity: 1 },
        ],
        catalog,
      ),
    ).toEqual([])
  })

  it('flags a second owned suit whether or not it is equipped', () => {
    expect(
      monsterArmorOwnershipViolations(
        [
          { equipmentId: 'leather', quantity: 1 },
          { equipmentId: 'chain', quantity: 1 },
        ],
        catalog,
      ),
    ).toEqual([
      {
        id: MONSTER_ARMOR_OWNERSHIP_VIOLATION_ID.duplicateBodyArmor,
        reason: 'duplicate-slot',
        slot: 'body-armor',
        entryIndex: 1,
      },
    ])
  })

  it('flags quantity other than 1 and skips unresolved references', () => {
    expect(
      monsterArmorOwnershipViolations(
        [
          { equipmentId: 'missing', quantity: 4 },
          { equipmentId: 'leather', quantity: 2 },
        ],
        catalog,
      ),
    ).toEqual([
      {
        id: MONSTER_ARMOR_OWNERSHIP_VIOLATION_ID.invalidQuantity,
        reason: 'invalid-quantity',
        slot: 'body-armor',
        entryIndex: 1,
      },
    ])
  })
})
