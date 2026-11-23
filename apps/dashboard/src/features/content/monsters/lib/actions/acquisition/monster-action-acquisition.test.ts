import {
  getMonsterActionKindLabel,
  MONSTER_ACTION_KIND_ENTRIES,
  MONSTER_NATURAL_FORM_DUPLICATE_MESSAGE,
  MONSTER_SPELLCASTING_ACTION_NAME,
  MONSTER_WEAPON_EQUIPMENT_DUPLICATE_MESSAGE,
  monsterSingletonKindMessage,
  PRIMARY_SPELLCASTING_DUPLICATE_MESSAGE,
  PRIMARY_SPELLCASTING_PROFILE,
} from '@rpg/contracts'
import { describe, expect, it } from 'vitest'

import {
  MONSTER_ACQUISITION_SPELL_PRIMARY_DESCRIPTION,
  MONSTER_ACQUISITION_SPELL_STANDALONE_DESCRIPTION,
} from '../../monster-form-labels'
import type { MonsterActionDraftRow } from '../monster-action-presets'
import type { FormCastingSections } from '../../casting/spellcasting-sources.lib'
import type { ActionPresetId } from '@rpg/contracts'

import {
  MONSTER_ACTION_ACQUISITION_GROUPS,
  createActionDraft,
  createMonsterActionFromAcquisition,
  createReactionActionDraft,
  createSpellActionDraft,
  monsterActionAcquisitionItems,
  parseMonsterActionAcquisitionId,
} from './monster-action-acquisition'

type GeneralMonsterActionAcquisitionChoice = Exclude<
  Parameters<typeof createMonsterActionFromAcquisition>[0],
  never
>

const weapons = [
  { entryId: 'sword-1', label: 'Longsword', equipped: true },
  { entryId: 'sword-2', label: 'Longsword', equipped: true },
  { entryId: 'bow', label: 'Shortbow', equipped: false },
]

describe('monsterActionAcquisitionItems', () => {
  it('adds an unused equipped weapon and disables an unequipped one', () => {
    const items = monsterActionAcquisitionItems({ weapons, allowAddWeapon: true })
    expect(items.find((item) => item.id === 'weapon-entry:sword-1')?.disabled).toBeUndefined()
    expect(parseMonsterActionAcquisitionId('weapon-entry:sword-1')).toEqual({
      type: 'weapon-entry',
      entryId: 'sword-1',
    })
    expect(items.find((item) => item.id === 'weapon-entry:bow')).toMatchObject({
      disabled: true,
      disabledReason: 'Not equipped',
    })
  })

  it('disables an equipped weapon row that already has an action', () => {
    const items = monsterActionAcquisitionItems({
      weapons,
      allowAddWeapon: true,
      weaponActions: [
        { id: 'bonus-slash', equipmentEntryId: 'sword-1' },
        { id: 'action-slash', equipmentEntryId: 'sword-1' },
      ],
    })
    const sword = items.find((item) => item.id === 'weapon-entry:sword-1')
    expect(sword).toMatchObject({
      disabled: true,
      disabledReason: MONSTER_WEAPON_EQUIPMENT_DUPLICATE_MESSAGE,
      metadata: MONSTER_ACTION_KIND_ENTRIES.weapon.description,
    })
    expect(parseMonsterActionAcquisitionId(sword!.id)).toEqual({
      type: 'weapon-entry',
      entryId: 'sword-1',
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
      'Movement',
      'General',
    ])
    expect(MONSTER_ACTION_ACQUISITION_GROUPS.find((group) => group.label === 'General')?.id).toBe(
      'other',
    )
    expect(items.find((item) => item.id === 'create:attack')).toMatchObject({
      label: 'Attack roll',
      metadata: MONSTER_ACTION_KIND_ENTRIES.attack.description,
    })
    expect(items.find((item) => item.id === 'create:attack')?.label).not.toBe(
      getMonsterActionKindLabel('attack'),
    )
    expect(items.find((item) => item.id === 'create:spell')).toMatchObject({
      metadata: MONSTER_ACQUISITION_SPELL_PRIMARY_DESCRIPTION,
    })
    expect(parseMonsterActionAcquisitionId('create:spell')).toEqual({
      type: 'create',
      kind: 'spell',
      spellAcquisition: 'primary',
    })
    expect(parseMonsterActionAcquisitionId('create:spell-standalone')).toEqual({
      type: 'create',
      kind: 'spell',
      spellAcquisition: 'standalone',
    })
    expect(items.find((item) => item.id === 'create:special')).toMatchObject({
      label: 'Custom ability',
      metadata: MONSTER_ACTION_KIND_ENTRIES.special.description,
    })
    expect(items.find((item) => item.id === 'create:special')?.label).not.toBe(
      getMonsterActionKindLabel('special'),
    )
    expect(items.find((item) => item.id === 'create:save')).toBeUndefined()
    expect(parseMonsterActionAcquisitionId('create:save')).toEqual({ type: 'create', kind: 'save' })
    const bonus = monsterActionAcquisitionItems({
      weapons: [],
      allowAddWeapon: true,
      section: 'bonusActions',
    })
    expect(bonus.find((item) => item.id === 'preset:breath-weapon')).toBeUndefined()
    expect(bonus.find((item) => item.id === 'preset:constrict')).toBeUndefined()
    expect(bonus.find((item) => item.id === 'weapon-entry:sword-1')).toBeUndefined()
    expect(bonus.find((item) => item.id === 'create:save')).toMatchObject({
      metadata: MONSTER_ACTION_KIND_ENTRIES.save.description,
    })
    expect(bonus.map((item) => item.id)).toEqual([
      'create:teleport',
      'create:leap',
      'create:take-actions',
      'create:attack',
      'create:special',
      'create:save',
      'create:shape-shift',
      'create:spell-standalone',
    ])
    expect(createActionDraft('leap')).toMatchObject({
      kind: 'leap',
      name: 'Leap',
      distanceFeet: 30,
      movementFeet: 10,
    })
    expect(createActionDraft('teleport')).toMatchObject({ kind: 'teleport', name: 'Teleport' })
    expect(createActionDraft('teleport')).not.toHaveProperty('distanceFeet')
    expect(createActionDraft('take-actions')).toMatchObject({
      kind: 'take-actions',
      standardActions: [],
      combination: 'one',
    })
    expect(createActionDraft('take-actions')).not.toHaveProperty('name')
    expect(parseMonsterActionAcquisitionId('create:leap')).toEqual({
      type: 'create',
      kind: 'leap',
    })
    const actions = monsterActionAcquisitionItems({
      weapons: [],
      allowAddWeapon: true,
      section: 'actions',
    })
    expect(actions.some((item) => item.id === 'create:teleport')).toBe(true)
    expect(actions.some((item) => item.id === 'create:leap')).toBe(false)
    const reactions = monsterActionAcquisitionItems({
      weapons,
      allowAddWeapon: true,
      section: 'reactions',
    })
    expect(reactions.map((item) => item.id)).toEqual([
      'reaction:reference',
      'reaction:parry',
      'reaction:cast-spell',
      'reaction:custom',
    ])
    expect(reactions.find((item) => item.id === 'reaction:reference')).toMatchObject({
      label: 'Use existing action',
      metadata: MONSTER_ACTION_KIND_ENTRIES['action-reference'].description,
    })
    expect(createReactionActionDraft('reference', {})).toMatchObject({
      kind: 'action-reference',
      actionIds: [],
    })
    expect(createReactionActionDraft('reference', {})).not.toHaveProperty('name')
    expect(items.find((item) => item.id === 'natural:other')?.metadata).toBe(
      MONSTER_ACTION_KIND_ENTRIES['natural-weapon'].description,
    )
  })

  it('lists Multiattack first and keeps natural-attack damage types', () => {
    const special = items.filter((item) => item.groupId === 'special').map((item) => item.label)
    expect(special.slice(0, 3)).toEqual(['Multiattack', 'Constrict', 'Breath Weapon'])
    expect(items.find((item) => item.id === 'preset:multiattack')).toMatchObject({
      metadata: MONSTER_ACTION_KIND_ENTRIES.multiattack.description,
    })
    expect(items.find((item) => item.id === 'preset:constrict')?.metadata).toBeTruthy()
    expect(items.find((item) => item.id === 'preset:breath-weapon')?.metadata).toBeTruthy()
    expect(items.find((item) => item.id === 'natural:bite')).toMatchObject({
      classification: 'Piercing',
      metadata: expect.stringContaining('teeth'),
    })
    expect(items.find((item) => item.id === 'natural:claw')).toMatchObject({
      classification: 'Slashing',
    })
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
  spellAcquisition?: Parameters<typeof createSpellActionDraft>[2],
) {
  const draft = createSpellActionDraft(section, sections ?? {}, spellAcquisition)
  if (draft.kind !== 'spell') throw new Error('expected spell draft')
  return draft
}

describe('createSpellActionDraft', () => {
  it('creates the primary profile only when spellAcquisition is primary', () => {
    expect(spellDraft('actions', {}, 'primary')).toMatchObject({
      kind: 'spell',
      profile: 'primary',
      name: 'Spellcasting',
      spells: [],
    })
    expect(spellDraft('actions', {}, 'standalone')).toMatchObject({
      kind: 'spell',
      spells: [],
    })
    expect(spellDraft('actions', {}, 'standalone').profile).toBeUndefined()
    expect(spellDraft('actions', {}, 'standalone').name).toBeUndefined()
    expect(spellDraft('bonusActions', {}, 'standalone').profile).toBeUndefined()
    expect(spellDraft('bonusActions', {}, 'standalone').name).toBeUndefined()
    expect(spellDraft('reactions', {}, 'standalone').name).toBeUndefined()
  })

  it('shares the primary profile and does not share a standalone spell', () => {
    const sections = {
      actions: [
        {
          id: 'spellcasting',
          kind: 'spell',
          profile: 'primary',
          name: 'Spellcasting',
          castingAbility: { kind: 'ability', ability: 'int' },
        },
        {
          id: 'invisibility',
          kind: 'spell',
          name: 'Invisibility',
          castingAbility: { kind: 'ability', ability: 'cha' },
        },
      ],
    }
    expect(
      spellDraft('bonusActions', sections as FormCastingSections, 'standalone').castingAbility,
    ).toEqual({
      kind: 'shared',
      entryId: 'spellcasting',
    })
    expect(
      spellDraft(
        'reactions',
        { actions: [sections.actions[1] as MonsterActionDraftRow] } as FormCastingSections,
        'standalone',
      ).castingAbility,
    ).toBeUndefined()
  })
})

describe('primary Spellcasting acquisition', () => {
  it('offers Spellcasting only in Actions and disables a second profile', () => {
    const actions = monsterActionAcquisitionItems({
      weapons: [],
      allowAddWeapon: true,
      section: 'actions',
    })
    expect(actions.find((item) => item.id === 'create:spell')?.disabled).toBeUndefined()
    expect(actions.find((item) => item.id === 'create:spell-standalone')).toMatchObject({
      label: 'Cast a spell',
      metadata: MONSTER_ACQUISITION_SPELL_STANDALONE_DESCRIPTION,
    })

    const spellcasting = {
      id: 'spellcasting',
      kind: 'spell',
      profile: PRIMARY_SPELLCASTING_PROFILE,
      name: MONSTER_SPELLCASTING_ACTION_NAME,
      castingAbility: { kind: 'ability', ability: 'int' },
      spells: [{ spellId: 'srd:fire-bolt' }],
    }
    const taken = monsterActionAcquisitionItems({
      weapons: [],
      allowAddWeapon: true,
      section: 'actions',
      sectionRows: { actions: [spellcasting] },
    })
    expect(taken.find((item) => item.id === 'create:spell')).toMatchObject({
      disabled: true,
      disabledReason: PRIMARY_SPELLCASTING_DUPLICATE_MESSAGE,
    })

    const bonus = monsterActionAcquisitionItems({
      weapons: [],
      allowAddWeapon: true,
      section: 'bonusActions',
    })
    expect(bonus.find((item) => item.id === 'create:spell')).toBeUndefined()
    expect(bonus.find((item) => item.id === 'create:spell-standalone')?.label).toBe('Cast a spell')
  })
})

describe('repeatability acquisition', () => {
  it('disables singleton menu entries and restores them when rows are removed', () => {
    const occupied = monsterActionAcquisitionItems({
      weapons: [],
      allowAddWeapon: true,
      section: 'actions',
      sectionRows: { actions: [{ id: 'ma', kind: 'multiattack' }] },
    })
    expect(occupied.find((item) => item.id === 'preset:multiattack')).toMatchObject({
      disabled: true,
      disabledReason: monsterSingletonKindMessage('multiattack'),
    })

    const open = monsterActionAcquisitionItems({
      weapons: [],
      allowAddWeapon: true,
      section: 'actions',
      sectionRows: { actions: [] },
    })
    expect(open.find((item) => item.id === 'preset:multiattack')?.disabled).toBeUndefined()

    const natural = monsterActionAcquisitionItems({
      weapons: [],
      allowAddWeapon: true,
      section: 'actions',
      sectionRows: { actions: [{ id: 'bite', kind: 'natural-weapon', form: 'bite' }] },
    })
    expect(natural.find((item) => item.id === 'natural:bite')).toMatchObject({
      disabled: true,
      disabledReason: MONSTER_NATURAL_FORM_DUPLICATE_MESSAGE,
    })
  })
})

describe('acquisition identity hardening', () => {
  it('does not parse unknown legendary acquisition ids', () => {
    expect(parseMonsterActionAcquisitionId('legendary:custom')).toBeUndefined()
    expect(parseMonsterActionAcquisitionId('legendary:bogus')).toBeUndefined()
  })

  it('throws for unknown preset ids instead of creating a special action', () => {
    expect(() =>
      createMonsterActionFromAcquisition({
        type: 'preset',
        presetId: 'not-a-preset' as ActionPresetId,
      }),
    ).toThrow(/Unknown action preset/)
  })

  it('throws for unsupported acquisition choices instead of creating special', () => {
    expect(() =>
      createMonsterActionFromAcquisition({
        type: 'bogus',
      } as unknown as GeneralMonsterActionAcquisitionChoice),
    ).toThrow(/Unsupported monster action acquisition choice/)
  })
})
