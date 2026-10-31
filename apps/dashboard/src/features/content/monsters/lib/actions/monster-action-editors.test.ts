import { describe, expect, it } from 'vitest'

import { pickEquipment, pickMonster } from '@/test/fixtures/pick'

import {
  createEquippedWeaponAcquisition,
  createMonsterActionFromAcquisition,
} from './monster-action-acquisition'
import {
  monsterActionActiveKeys,
  actionMoveDropsTrigger,
  actionAfterSectionMove,
} from './monster-action-kind'
import { createMonsterRowId } from './monster-action-presets'
import {
  resolveFirstInvalidActionPath,
  resolveMonsterActionSelectionAfterRemoval,
} from './monster-action-selection'
import { collectMonsterFormAdvisories } from '../monster-form-advisories'
import { resolveMonsterCreateDefaultValues } from '../monster-form-values'
import { buildMonsterInput, monsterToFormValues } from '../monster-form-values'
import type { FieldErrors } from 'react-hook-form'

describe('monster action acquisition', () => {
  it('seeds a natural weapon from vocabulary without recording the preset id', () => {
    const action = createMonsterActionFromAcquisition({ type: 'natural', presetId: 'claw' })
    expect(action.kind).toBe('natural-weapon')
    expect(action.name).toBe('Claw')
    expect(action.damageType).toBe('slashing')
    expect(action.mode).toBe('melee')
    expect(action.damage).toEqual({ dice: { count: 1, faces: 6 } })
    expect(action).not.toHaveProperty('preset')
    expect(createMonsterRowId()).not.toBe(createMonsterRowId())
  })

  it('links a new equipped weapon and its action in one result', () => {
    const { entry, action } = createEquippedWeaponAcquisition('srd-cc-5.2.1:greatsword')
    expect(entry.equipped).toBe(true)
    expect(entry.quantity).toBe(1)
    expect(action).toMatchObject({ kind: 'weapon', equipmentEntryId: entry.entryId })
    expect(action.id).not.toBe(entry.entryId)
  })

  it('creates the remaining kinds without extra rows', () => {
    expect(createMonsterActionFromAcquisition({ type: 'create', kind: 'attack' }).kind).toBe(
      'attack',
    )
    expect(createMonsterActionFromAcquisition({ type: 'create', kind: 'spell' })).toMatchObject({
      kind: 'spell',
      spells: [],
    })
    expect(createMonsterActionFromAcquisition({ type: 'create', kind: 'special' }).kind).toBe(
      'special',
    )
    expect(createMonsterActionFromAcquisition({ type: 'create', kind: 'natural' })).toMatchObject({
      kind: 'natural-weapon',
      mode: 'melee',
    })
    expect(
      createMonsterActionFromAcquisition({ type: 'weapon-entry', entryId: 'greatsword' }),
    ).toMatchObject({ kind: 'weapon', equipmentEntryId: 'greatsword' })
  })
})

describe('monster action section moves', () => {
  it('confirms dropping a trigger when leaving reactions and keeps ids', () => {
    const action = {
      id: 'parry',
      kind: 'special' as const,
      name: 'Parry',
      trigger: { text: 'When hit' },
    }
    expect(actionMoveDropsTrigger(action, 'reactions', 'actions')).toBe(true)
    expect(actionAfterSectionMove(action, 'actions')).toEqual({
      id: 'parry',
      kind: 'special',
      name: 'Parry',
    })
    expect(action.id).toBe('parry')
  })

  it('derives active keys from the draft schema', () => {
    expect(monsterActionActiveKeys('weapon', 'actions')).toContain('equipmentEntryId')
    expect(monsterActionActiveKeys('weapon', 'actions')).not.toContain('trigger')
    expect(monsterActionActiveKeys('weapon', 'reactions')).toContain('trigger')
  })
})

describe('resolveFirstInvalidActionPath', () => {
  it('scans actions, then bonus actions, then reactions and selects by domain id', () => {
    const values = resolveMonsterCreateDefaultValues()
    values.actions = [{ id: 'ok', kind: 'special', name: 'Ok' }]
    values.bonusActions = [{ id: 'bonus', kind: 'special', name: '' }]
    values.reactions = [{ id: 'react', kind: 'special' }]
    const errors = {
      bonusActions: [{ name: { message: 'Required', type: 'required' } }],
      reactions: [{ name: { message: 'Required', type: 'required' } }],
    } as unknown as FieldErrors
    expect(resolveFirstInvalidActionPath(errors, values)).toEqual({
      section: 'bonusActions',
      index: 0,
      id: 'bonus',
    })
  })
})

describe('resolveMonsterActionSelectionAfterRemoval', () => {
  it('selects the next sibling, then the nearest section', () => {
    const values = resolveMonsterCreateDefaultValues()
    values.actions = [
      { id: 'a', kind: 'special', name: 'A' },
      { id: 'b', kind: 'special', name: 'B' },
      { id: 'c', kind: 'special', name: 'C' },
    ]
    values.bonusActions = [{ id: 'd', kind: 'special', name: 'D' }]
    expect(resolveMonsterActionSelectionAfterRemoval(values, 'actions', 'b')).toBe('c')
    expect(resolveMonsterActionSelectionAfterRemoval(values, 'actions', 'c')).toBe('b')
    values.actions = [{ id: 'only', kind: 'special', name: 'Only' }]
    expect(resolveMonsterActionSelectionAfterRemoval(values, 'actions', 'only')).toBe('d')
  })
})

describe('monster form advisories', () => {
  it('reports unequipped weapons and missing proficiency', () => {
    const values = resolveMonsterCreateDefaultValues()
    values.equipment = [{ entryId: 'bow', equipmentId: 'shortbow', quantity: 1, equipped: false }]
    values.actions = [{ id: 'shot', kind: 'weapon', equipmentEntryId: 'bow' }]
    const shortbow = pickEquipment('shortbow')
    const advisories = collectMonsterFormAdvisories(values, new Map([['shortbow', shortbow]]))
    expect(advisories.map((advisory) => advisory.code)).toEqual(
      expect.arrayContaining(['weapon-not-equipped', 'weapon-not-proficient']),
    )
    expect(advisories.find((advisory) => advisory.code === 'weapon-not-equipped')?.message).toBe(
      'Shortbow is not equipped.',
    )
  })
})

describe('monster action draft round trip', () => {
  it('keeps partial active-kind fields and drops inactive kind fields', () => {
    const values = resolveMonsterCreateDefaultValues()
    values.name = 'Scout'
    values.actions = [
      {
        id: 'claw',
        kind: 'natural-weapon',
        name: 'Claw',
        damage: { dice: { count: 1 } },
        mode: 'melee',
        equipmentEntryId: 'stale',
      },
    ]
    values.bonusActions = [{ id: 'note', kind: 'special', name: 'N' }]
    values.reactions = [
      { id: 'parry', kind: 'special', trigger: { text: 'When' } },
      { id: 'legacy', kind: 'special', trigger: 'Still' },
      { id: 'blank', kind: 'special', trigger: { text: '   ' } },
    ]
    const input = buildMonsterInput(values, undefined, 'draft')
    const actions = input.actions as Array<Record<string, unknown>>
    const reactions = input.reactions as Array<Record<string, unknown>>
    expect(actions[0]).toMatchObject({
      id: 'claw',
      kind: 'natural-weapon',
      damage: { dice: { count: 1 } },
    })
    expect(actions[0]).not.toHaveProperty('equipmentEntryId')
    expect(reactions[0]).toMatchObject({ trigger: { text: 'When' } })
    expect(reactions[1]).toMatchObject({ trigger: { text: 'Still' } })
    expect(reactions[2]).not.toHaveProperty('trigger')
    const reloaded = monsterToFormValues({
      ...input,
      id: 'm1',
      catalogLayer: 'homebrew',
      status: 'draft',
      rulesetId: 'srd',
      slug: 'scout',
    } as never)
    expect(reloaded.actions[0]).toMatchObject({ damage: { dice: { count: 1 } } })
  })

  it('reloads every acquired kind and leaves catalog monsters unchanged', () => {
    const values = resolveMonsterCreateDefaultValues()
    values.name = 'Scout'
    values.equipment = [
      {
        entryId: 'greatsword',
        equipmentId: 'srd-cc-5.2.1:greatsword',
        quantity: 1,
        equipped: true,
      },
    ]
    values.actions = [
      createMonsterActionFromAcquisition({ type: 'weapon-entry', entryId: 'greatsword' }),
      createMonsterActionFromAcquisition({ type: 'natural', presetId: 'bite' }),
      createMonsterActionFromAcquisition({ type: 'create', kind: 'attack' }),
      createMonsterActionFromAcquisition({ type: 'create', kind: 'spell' }),
      createMonsterActionFromAcquisition({ type: 'create', kind: 'special' }),
    ]
    const input = buildMonsterInput(values, undefined, 'draft')
    const reloaded = monsterToFormValues({
      ...input,
      id: 'm1',
      catalogLayer: 'homebrew',
      status: 'draft',
      rulesetId: 'srd',
      slug: 'scout',
    } as never)
    expect(reloaded.actions.map((action) => action.kind)).toEqual([
      'weapon',
      'natural-weapon',
      'attack',
      'spell',
      'special',
    ])
    expect(reloaded.actions[0]).toMatchObject({ equipmentEntryId: 'greatsword' })
    expect(reloaded.actions[1]).toMatchObject({
      name: 'Bite',
      damageType: 'piercing',
      mode: 'melee',
    })

    for (const slug of ['knight', 'mage', 'hell-hound'] as const) {
      const monster = pickMonster(slug)
      const form = monsterToFormValues(monster)
      const saved = buildMonsterInput(form, { entity: monster }, 'draft')
      const again = monsterToFormValues({ ...monster, ...saved } as never)
      expect(again.actions.map((action) => action.id)).toEqual(
        form.actions.map((action) => action.id),
      )
      expect(again.actions.map((action) => action.kind)).toEqual(
        form.actions.map((action) => action.kind),
      )
      expect(again.bonusActions.map((action) => action.id)).toEqual(
        form.bonusActions.map((action) => action.id),
      )
      expect(again.reactions.map((action) => action.id)).toEqual(
        form.reactions.map((action) => action.id),
      )
    }
  })
})
