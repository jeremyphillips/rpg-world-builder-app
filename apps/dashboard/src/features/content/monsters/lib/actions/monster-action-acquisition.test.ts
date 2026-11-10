import { describe, expect, it } from 'vitest'

import {
  MONSTER_ACQUISITION_ATTACK_DESCRIPTION,
  MONSTER_ACQUISITION_MULTIATTACK_DESCRIPTION,
  MONSTER_ACQUISITION_SPELL_DESCRIPTION,
  MONSTER_ACQUISITION_SAVE_DESCRIPTION,
  MONSTER_ACQUISITION_SPECIAL_DESCRIPTION,
} from '../monster-form-labels'
import {
  MONSTER_ACTION_ACQUISITION_GROUPS,
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

describe('monster action acquisition presentation', () => {
  const items = monsterActionAcquisitionItems({ weapons: [], allowAddWeapon: true })

  it('uses General for custom actions and describes what each item creates', () => {
    expect(MONSTER_ACTION_ACQUISITION_GROUPS.map((group) => group.label)).toEqual([
      'Equipped weapons',
      'Natural attacks',
      'Special actions',
      'General',
    ])
    expect(MONSTER_ACTION_ACQUISITION_GROUPS.find((group) => group.label === 'General')?.id).toBe(
      'other',
    )
    expect(items.find((item) => item.id === 'create:attack')).toMatchObject({
      metadata: MONSTER_ACQUISITION_ATTACK_DESCRIPTION,
    })
    expect(items.find((item) => item.id === 'create:spell')).toMatchObject({
      metadata: MONSTER_ACQUISITION_SPELL_DESCRIPTION,
    })
    expect(items.find((item) => item.id === 'create:special')).toMatchObject({
      metadata: MONSTER_ACQUISITION_SPECIAL_DESCRIPTION,
    })
    expect(items.find((item) => item.id === 'create:save')).toMatchObject({
      label: 'Saving throw',
      groupId: 'other',
      metadata: MONSTER_ACQUISITION_SAVE_DESCRIPTION,
    })
    expect(parseMonsterActionAcquisitionId('create:save')).toEqual({
      type: 'create',
      kind: 'save',
    })
    expect(items.find((item) => item.id === 'natural:other')?.metadata).toBeUndefined()
  })

  it('lists Multiattack first and keeps natural-attack damage types', () => {
    const special = items.filter((item) => item.groupId === 'special').map((item) => item.label)
    expect(special.slice(0, 3)).toEqual(['Multiattack', 'Constrict', 'Breath Weapon'])
    expect(items.find((item) => item.id === 'preset:multiattack')).toMatchObject({
      metadata: MONSTER_ACQUISITION_MULTIATTACK_DESCRIPTION,
    })
    expect(items.find((item) => item.id === 'preset:constrict')?.metadata).toBeUndefined()
    expect(items.find((item) => item.id === 'preset:breath-weapon')?.metadata).toBeUndefined()
    expect(items.find((item) => item.id === 'natural:bite')).toMatchObject({ metadata: 'Piercing' })
    expect(items.find((item) => item.id === 'natural:claw')).toMatchObject({ metadata: 'Slashing' })
    expect(items.find((item) => item.id === 'natural:bite')).toMatchObject({
      search: { includeSupporting: false },
      searchTerms: expect.arrayContaining(['teeth']),
    })
    expect(items.find((item) => item.id === 'preset:constrict')?.searchTerms).toEqual(
      expect.arrayContaining(['squeeze']),
    )
    expect(parseMonsterActionAcquisitionId('preset:multiattack')).toEqual({
      type: 'preset',
      presetId: 'multiattack',
    })
  })
})

function spellDraft(
  section: Parameters<typeof createSpellActionDraft>[0],
  sections?: Parameters<typeof createSpellActionDraft>[1],
) {
  const draft = createSpellActionDraft(section, sections ?? {})
  if (draft.kind !== 'spell') throw new Error('expected spell draft')
  return draft
}

describe('createSpellActionDraft', () => {
  it('names the first Actions spell row and leaves bonus and reaction rows unnamed', () => {
    expect(spellDraft('actions', {})).toMatchObject({
      kind: 'spell',
      name: 'Spellcasting',
      spells: [],
    })
    expect(spellDraft('actions', {}).castingAbility).toBeUndefined()
    expect(spellDraft('bonusActions', {}).name).toBeUndefined()
    expect(spellDraft('reactions', {}).name).toBeUndefined()
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
    expect(spellDraft('actions', sections)).toMatchObject({
      castingAbility: { kind: 'shared', entryId: 'spellcasting' },
    })
    expect(spellDraft('actions', sections).name).toBeUndefined()
    expect(spellDraft('bonusActions', sections).castingAbility).toEqual({
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
    expect(spellDraft('actions', standalone).name).toBe('Spellcasting')
    expect(spellDraft('actions', standalone).castingAbility).toBeUndefined()
    expect(spellDraft('bonusActions', unfinished).name).toBeUndefined()
    expect(spellDraft('bonusActions', unfinished).castingAbility).toBeUndefined()
    expect(spellDraft('actions', unfinished).name).toBeUndefined()
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
    expect(spellDraft('reactions', sections).castingAbility).toBeUndefined()
  })
})
