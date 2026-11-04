import { describe, expect, it } from 'vitest'

import {
  MONSTER_ACTION_ALREADY_ADDED_NOTE,
  monsterActionAcquisitionItems,
  parseMonsterActionAcquisitionId,
} from './monster-action-acquisition'

const weapons = [
  { entryId: 'sword-1', label: 'Longsword', equipped: true },
  { entryId: 'sword-2', label: 'Longsword', equipped: true },
  { entryId: 'bow', label: 'Shortbow', equipped: false },
]

describe('monsterActionAcquisitionItems', () => {
  it('adds an unused equipped weapon and disables an unequipped one', () => {
    const items = monsterActionAcquisitionItems({ weapons, allowAddWeapon: true })
    expect(items.find((item) => item.id === 'weapon-entry:sword-1')).toMatchObject({
      disabled: false,
    })
    expect(parseMonsterActionAcquisitionId('weapon-entry:sword-1')).toEqual({
      type: 'weapon-entry',
      entryId: 'sword-1',
    })
    expect(items.find((item) => item.id === 'weapon-entry:bow')).toMatchObject({
      disabled: true,
      note: 'Not equipped',
    })
  })

  it('opens the first weapon action across economies and ignores multiattack references', () => {
    const items = monsterActionAcquisitionItems({
      weapons,
      allowAddWeapon: true,
      weaponActions: [
        { id: 'bonus-slash', equipmentEntryId: 'sword-1' },
        { id: 'action-slash', equipmentEntryId: 'sword-1' },
      ],
    })
    const sword = items.find((item) => item.label === 'Longsword' && item.note)
    expect(sword).toMatchObject({
      id: 'focus-action:bonus-slash',
      note: MONSTER_ACTION_ALREADY_ADDED_NOTE,
    })
    expect(sword?.disabled).toBeUndefined()
    expect(parseMonsterActionAcquisitionId(sword!.id)).toEqual({
      type: 'focus-existing',
      actionId: 'bonus-slash',
    })
    expect(items.find((item) => item.id === 'weapon-entry:sword-2')).toBeDefined()
  })
})
