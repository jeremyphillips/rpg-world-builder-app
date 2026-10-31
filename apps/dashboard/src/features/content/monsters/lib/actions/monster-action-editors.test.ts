import { ACTION_PRESET_IDS, getActionPreset, getActionVocabularyEntry } from '@rpg/contracts'
import type { FormItem } from '@rpg/ui/form'
import { describe, expect, it } from 'vitest'

import { buildSeedDamageTypeVocabulary } from '@/features/vocabulary'
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
import { monsterActionDetailFields } from './monster-action-detail-fields'
import { createMonsterRowId, type MonsterActionDraftRow } from './monster-action-presets'
import {
  resolveFirstInvalidActionPath,
  resolveMonsterActionSelectionAfterRemoval,
} from './monster-action-selection'
import type { ContentFormCtx } from '../../../lib/forms/registry/content-form-registry'
import { collectMonsterFormAdvisories } from '../monster-form-advisories'
import { resolveMonsterCreateDefaultValues } from '../monster-form-values'
import { buildMonsterInput, monsterToFormValues } from '../monster-form-values'
import type { FieldErrors } from 'react-hook-form'

describe('monster action acquisition', () => {
  it('stamps a natural attack with its preset and form', () => {
    const action = createMonsterActionFromAcquisition({ type: 'natural', presetId: 'claw' })
    expect(action).toMatchObject({
      kind: 'natural-weapon',
      preset: 'claw',
      name: 'Claw',
      form: 'claw',
      damageType: 'slashing',
      mode: 'melee',
      reach: 5,
      damage: { dice: { count: 1, faces: 6 } },
    })
    expect(createMonsterRowId()).not.toBe(createMonsterRowId())
  })

  it('seeds every attack-roll preset without properties or a limit', () => {
    for (const presetId of ACTION_PRESET_IDS) {
      const preset = getActionPreset(presetId)
      if (preset?.mechanics !== 'attack-roll') continue
      const action = createMonsterActionFromAcquisition({ type: 'natural', presetId })
      expect(action).toMatchObject({
        kind: 'natural-weapon',
        preset: presetId,
        name: getActionVocabularyEntry(preset.vocabularyId)?.label,
        form: preset.defaults.naturalForm,
        damageType: preset.defaults.damageType,
        mode: preset.defaults.mode,
        reach: 5,
        damage: { dice: { count: 1, faces: 6 } },
      })
      expect(action).not.toHaveProperty('properties')
      expect(action).not.toHaveProperty('limitedUse')
    }
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
    const customNatural = createMonsterActionFromAcquisition({ type: 'other-natural' })
    expect(customNatural).toMatchObject({
      kind: 'natural-weapon',
      mode: 'melee',
      reach: 5,
    })
    expect(customNatural.damageType).toBeUndefined()
    expect(customNatural.form).toBeUndefined()
    expect(
      createMonsterActionFromAcquisition({ type: 'preset', presetId: 'breath-weapon' }),
    ).toMatchObject({
      kind: 'save',
      preset: 'breath-weapon',
      name: 'Fire Breath',
      dcSource: { kind: 'ability', ability: 'con', proficient: true },
      limitedUse: { kind: 'recharge', minRoll: 5 },
    })
    expect(
      createMonsterActionFromAcquisition({ type: 'preset', presetId: 'multiattack' }),
    ).toMatchObject({ kind: 'multiattack', preset: 'multiattack', name: 'Multiattack', steps: [] })
    expect(
      createMonsterActionFromAcquisition({ type: 'weapon-entry', entryId: 'greatsword' }),
    ).toMatchObject({ kind: 'weapon', equipmentEntryId: 'greatsword' })
  })
})

const detailCtx = {
  damageTypeVocabulary: buildSeedDamageTypeVocabulary(),
} as ContentFormCtx

function collectFieldNames(items: readonly FormItem[]): string[] {
  const names: string[] = []
  for (const item of items) {
    if ('name' in item && typeof item.name === 'string') names.push(item.name)
    if ('fields' in item && Array.isArray(item.fields)) {
      names.push(...collectFieldNames(item.fields as FormItem[]))
    }
    if ('start' in item && item.start && typeof item.start === 'object' && 'name' in item.start) {
      if (typeof item.start.name === 'string') names.push(item.start.name)
    }
  }
  return names
}

function detailFields(action: MonsterActionDraftRow, section: 'actions' | 'reactions' = 'actions') {
  return collectFieldNames(
    monsterActionDetailFields({
      ctx: detailCtx,
      action,
      section,
      namePrefix: `${section}.0`,
      equipmentOptions: [],
      sharedCastingOptions: [],
    }),
  )
}

describe('monster action detail fields', () => {
  it('shows only the natural-weapon editors and keeps attack editors', () => {
    const natural = detailFields({
      id: 'bite',
      kind: 'natural-weapon',
      name: 'Bite',
      mode: 'melee',
      damageType: 'piercing',
    })
    expect(natural).toEqual(
      expect.arrayContaining([
        'name',
        'description',
        'damage',
        'damageType',
        'onHit.additionalDamage',
      ]),
    )
    for (const hidden of ['mode', 'properties', 'reach', 'limitedUse.kind', 'moveSection']) {
      expect(natural).not.toContain(hidden)
    }

    const reaction = detailFields(
      { id: 'bite', kind: 'natural-weapon', name: 'Bite', mode: 'melee' },
      'reactions',
    )
    expect(reaction).toContain('trigger.text')

    const attack = detailFields({ id: 'slash', kind: 'attack', name: 'Slash' })
    expect(attack).toEqual(
      expect.arrayContaining(['modes', 'reach', 'limitedUse.kind', 'damageType', 'damage']),
    )
    expect(attack).not.toContain('moveSection')

    const weapon = detailFields({ id: 'sword', kind: 'weapon', equipmentEntryId: 'sword' })
    expect(weapon).toContain('equipmentEntryId')
    expect(weapon).toContain('limitedUse.kind')
    expect(weapon).not.toContain('moveSection')
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
