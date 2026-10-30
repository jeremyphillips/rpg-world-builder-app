import { describe, expect, it } from 'vitest'

import { pickEquipment } from '@/test/fixtures/pick'

import {
  reconcileMonsterActionKind,
  describeActionKindSwitchLoss,
  monsterActionActiveKeys,
  actionMoveDropsTrigger,
  actionAfterSectionMove,
} from './monster-action-kind'
import { createActionFromPreset, createMonsterRowId } from './monster-action-presets'
import {
  resolveFirstInvalidActionPath,
  resolveMonsterActionSelectionAfterRemoval,
} from './monster-action-selection'
import { collectMonsterFormAdvisories } from '../monster-form-advisories'
import { resolveMonsterCreateDefaultValues } from '../monster-form-values'
import { buildMonsterInput, monsterToFormValues } from '../monster-form-values'
import type { FieldErrors } from 'react-hook-form'

describe('monster action presets', () => {
  it('initializes a natural weapon without recording the preset', () => {
    const action = createActionFromPreset('claw')
    expect(action.kind).toBe('natural-weapon')
    expect(action.name).toBe('Claw')
    expect(action.damageType).toBe('slashing')
    expect(action.mode).toBe('melee')
    expect(action).not.toHaveProperty('preset')
    expect(createMonsterRowId()).not.toBe(createMonsterRowId())
  })
})

describe('reconcileMonsterActionKind', () => {
  it('keeps id, name, and description and drops the previous kind', () => {
    const next = reconcileMonsterActionKind(
      {
        id: 'claw',
        kind: 'natural-weapon',
        name: 'Claw',
        description: '<p>Swipe</p>',
        damage: { dice: { count: 1, faces: 6 } },
        damageType: 'slashing',
        mode: 'melee',
        reach: 5,
      },
      'special',
    )
    expect(next).toEqual({ id: 'claw', kind: 'special', name: 'Claw', description: '<p>Swipe</p>' })
  })

  it('fills a weapon name from the resolved weapon when leaving weapon kind', () => {
    const next = reconcileMonsterActionKind(
      { id: 'hit', kind: 'weapon', equipmentEntryId: 'dagger-1' },
      'natural-weapon',
      { resolvedWeaponName: 'Dagger' },
    )
    expect(next.name).toBe('Dagger')
    expect(next).not.toHaveProperty('equipmentEntryId')
  })
})

describe('describeActionKindSwitchLoss', () => {
  it('reports an equipment link even when the entry does not resolve', () => {
    expect(
      describeActionKindSwitchLoss(
        { id: 'hit', kind: 'weapon', equipmentEntryId: 'missing' },
        'special',
        { equipmentName: 'missing' },
      ).join(' '),
    ).toMatch(/missing/)
  })

  it('reports partial natural-weapon damage and nothing for a fresh special', () => {
    expect(
      describeActionKindSwitchLoss(
        { id: 'claw', kind: 'natural-weapon', damage: { dice: { count: 1 } } },
        'weapon',
      ).length,
    ).toBeGreaterThan(0)
    expect(describeActionKindSwitchLoss({ id: 'note', kind: 'special' }, 'weapon')).toEqual([])
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
      source: 'homebrew',
      status: 'draft',
      rulesetId: 'srd',
      slug: 'scout',
    } as never)
    expect(reloaded.actions[0]).toMatchObject({ damage: { dice: { count: 1 } } })
  })
})
