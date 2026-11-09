import { describe, expect, it } from 'vitest'

import {
  MONSTER_ACTION_ALREADY_ADDED_NOTE,
  createSpellActionDraft,
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

describe('createSpellActionDraft', () => {
  it('names the first Actions spell row and leaves bonus and reaction rows unnamed', () => {
    expect(createSpellActionDraft('actions', {})).toMatchObject({
      kind: 'spell',
      name: 'Spellcasting',
      spells: [],
    })
    expect(createSpellActionDraft('actions', {}).castingAbility).toBeUndefined()
    expect(createSpellActionDraft('bonusActions', {}).name).toBeUndefined()
    expect(createSpellActionDraft('reactions', {}).name).toBeUndefined()
  })

  it('does not name a second Spellcasting row and shares the one conventional source', () => {
    const sections = {
      actions: [
        {
          id: 'spellcasting',
          kind: 'spell',
          name: 'Spellcasting',
          castingAbility: { kind: 'ability', ability: 'int' },
        },
      ],
    }
    expect(createSpellActionDraft('actions', sections)).toMatchObject({
      castingAbility: { kind: 'shared', entryId: 'spellcasting' },
    })
    expect(createSpellActionDraft('actions', sections).name).toBeUndefined()
    expect(createSpellActionDraft('bonusActions', sections).castingAbility).toEqual({
      kind: 'shared',
      entryId: 'spellcasting',
    })
  })

  it('does not share a standalone source or an unfinished Spellcasting row', () => {
    const standalone = {
      actions: [
        {
          id: 'invisibility',
          kind: 'spell',
          name: 'Invisibility',
          castingAbility: { kind: 'ability', ability: 'cha' },
        },
      ],
    }
    const unfinished = {
      actions: [{ id: 'spellcasting', kind: 'spell', name: 'Spellcasting', spells: [] }],
    }
    expect(createSpellActionDraft('actions', standalone).name).toBe('Spellcasting')
    expect(createSpellActionDraft('actions', standalone).castingAbility).toBeUndefined()
    expect(createSpellActionDraft('bonusActions', unfinished).name).toBeUndefined()
    expect(createSpellActionDraft('bonusActions', unfinished).castingAbility).toBeUndefined()
    expect(createSpellActionDraft('actions', unfinished).name).toBeUndefined()
  })

  it('leaves the ability unset when several conventional sources exist', () => {
    const sections = {
      actions: [
        {
          id: 'one',
          kind: 'spell',
          name: 'Spellcasting',
          castingAbility: { kind: 'ability', ability: 'int' },
        },
      ],
      bonusActions: [
        {
          id: 'two',
          kind: 'spell',
          name: 'Spellcasting',
          castingAbility: { kind: 'ability', ability: 'wis' },
        },
      ],
    }
    expect(createSpellActionDraft('reactions', sections).castingAbility).toBeUndefined()
  })
})
