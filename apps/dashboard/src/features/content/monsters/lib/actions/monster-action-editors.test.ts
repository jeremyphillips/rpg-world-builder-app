import { ACTION_PRESET_IDS, getActionPreset } from '@rpg/contracts'
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
import {
  collectMonsterFormAdvisories,
  FLYBY_MISSING_FLY_SPEED_MESSAGE,
  TUNNELER_MISSING_BURROW_SPEED_MESSAGE,
} from '../monster-form-advisories'
import { resolveMonsterCreateDefaultValues, type MonsterFormValues } from '../monster-form-values'
import { buildMonsterInput, monsterToFormValues } from '../monster-form-values'
import type { FieldErrors } from 'react-hook-form'

describe('monster action acquisition', () => {
  it('stamps a natural attack with its preset and form', () => {
    const action = createMonsterActionFromAcquisition({ type: 'natural', presetId: 'claw' })
    expect(action).toMatchObject({
      kind: 'natural-weapon',
      preset: 'claw',
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
    expect(createMonsterActionFromAcquisition({ type: 'create', kind: 'save' })).toEqual({
      id: expect.any(String),
      kind: 'save',
    })
    const customNatural = createMonsterActionFromAcquisition({ type: 'other-natural' })
    expect(customNatural).toMatchObject({
      kind: 'natural-weapon',
      mode: 'melee',
      reach: 5,
    })
    if (customNatural.kind === 'natural-weapon') {
      expect(customNatural.damageType).toBeUndefined()
      expect(customNatural.form).toBeUndefined()
    }
    expect(
      createMonsterActionFromAcquisition({ type: 'preset', presetId: 'breath-weapon' }),
    ).toMatchObject({
      kind: 'save',
      preset: 'breath-weapon',
      dcSource: { kind: 'ability', ability: 'con', proficient: true },
      limitedUse: { kind: 'recharge', minRoll: 5 },
    })
    expect(
      createMonsterActionFromAcquisition({ type: 'preset', presetId: 'breath-weapon' }).name,
    ).toBeUndefined()
    expect(
      createMonsterActionFromAcquisition({ type: 'preset', presetId: 'multiattack' }),
    ).toMatchObject({ kind: 'multiattack', preset: 'multiattack', steps: [] })
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
    if ('kind' in item && item.kind === 'dependent') {
      names.push(...collectFieldNames([item.controller as FormItem]))
      names.push(...collectFieldNames(item.dependents.fields))
      continue
    }
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

function descriptionFieldConfig(action: MonsterActionDraftRow): FormItem | undefined {
  return monsterActionDetailFields({
    ctx: detailCtx,
    action,
    section: 'actions',
    namePrefix: 'actions.0',
    equipmentOptions: [],
    sharedCastingOptions: [],
  }).find((item) => 'name' in item && item.name === 'description')
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
    expect(natural).toContain('limitedUse')
    for (const hidden of ['mode', 'properties', 'reach', 'limitedUse.kind', 'moveSection']) {
      expect(natural).not.toContain(hidden)
    }

    const reaction = detailFields(
      { id: 'bite', kind: 'natural-weapon', name: 'Bite', mode: 'melee' },
      'reactions',
    )
    expect(reaction).toContain('trigger.text')

    const attack = detailFields({
      id: 'slash',
      kind: 'attack',
      name: 'Slash',
    } as MonsterActionDraftRow)
    expect(attack).toEqual(
      expect.arrayContaining(['modes', 'reach', 'limitedUse', 'damageType', 'damage']),
    )
    const attackItems = monsterActionDetailFields({
      ctx: detailCtx,
      action: { id: 'slash', kind: 'attack', name: 'Slash' } as MonsterActionDraftRow,
      section: 'actions',
      namePrefix: 'actions.0',
      equipmentOptions: [],
      sharedCastingOptions: [],
    })
    const attackDamage = attackItems.find(
      (item) => 'kind' in item && item.kind === 'group' && item.heading?.label === 'Damage',
    )
    expect(attackDamage).toMatchObject({ heading: { label: 'Damage' } })
    const damageRow =
      attackDamage && 'fields' in attackDamage
        ? attackDamage.fields.find((field) => 'kind' in field && field.kind === 'row')
        : undefined
    const damageType =
      damageRow && 'fields' in damageRow
        ? damageRow.fields.find((field) => 'name' in field && field.name === 'damageType')
        : undefined
    const damageRoll =
      damageRow && 'fields' in damageRow
        ? damageRow.fields.find((field) => !('kind' in field) && field.type === 'rollValue')
        : undefined
    expect(damageRoll).toMatchObject({ name: 'damage', label: 'Damage roll', required: true })
    expect(damageType).toMatchObject({ name: 'damageType', label: 'Type', required: true })
    expect(
      damageType && 'options' in damageType
        ? damageType.options?.map((option) => ('value' in option ? option.value : option))
        : [],
    ).not.toEqual(['bludgeoning', 'piercing', 'slashing'])
    const naturalItems = monsterActionDetailFields({
      ctx: detailCtx,
      action: { id: 'bite', kind: 'natural-weapon', name: 'Bite', mode: 'melee' },
      section: 'actions',
      namePrefix: 'actions.0',
      equipmentOptions: [],
      sharedCastingOptions: [],
    })
    const naturalDamage = naturalItems.find(
      (item) => 'kind' in item && item.kind === 'group' && item.heading?.label === 'Damage',
    )
    expect(naturalDamage).toMatchObject({ heading: { label: 'Damage' } })
    const naturalRow =
      naturalDamage && 'fields' in naturalDamage
        ? naturalDamage.fields.find((field) => 'kind' in field && field.kind === 'row')
        : undefined
    const naturalType =
      naturalRow && 'fields' in naturalRow
        ? naturalRow.fields.find((field) => 'name' in field && field.name === 'damageType')
        : undefined
    const naturalRoll =
      naturalRow && 'fields' in naturalRow
        ? naturalRow.fields.find((field) => !('kind' in field) && field.type === 'rollValue')
        : undefined
    expect(naturalType).toMatchObject({
      label: 'Type',
      presentation: { change: { label: 'Change' } },
    })
    expect(naturalRoll).toMatchObject({
      label: 'Damage roll',
      hint: { text: 'Ability modifiers are applied automatically.' },
    })
    expect(
      naturalType && 'options' in naturalType
        ? naturalType.options?.some(
            (option) => ('value' in option ? option.value : option) === 'fire',
          )
        : false,
    ).toBe(true)
    expect(attack).not.toContain('moveSection')
    expect(natural[0]).toBe('attackPreview')
    expect(natural[1]).toBe('buildAdvisories')
    expect(attack[0]).toBe('attackPreview')
    expect(attack[1]).toBe('buildAdvisories')

    const weapon = detailFields({ id: 'sword', kind: 'weapon', equipmentEntryId: 'sword' })
    expect(weapon).toContain('equipmentEntryId')
    expect(weapon).not.toContain('limitedUse')
    expect(weapon).not.toContain('limitedUse.kind')
    expect(weapon).not.toContain('moveSection')
    expect(weapon.indexOf('name')).toBeLessThan(weapon.indexOf('equipmentEntryId'))
    expect(weapon.indexOf('attackPreview')).toBe(weapon.indexOf('equipmentEntryId') + 1)
    expect(weapon.indexOf('buildAdvisories')).toBe(weapon.indexOf('attackPreview') + 1)
    expect(weapon.indexOf('damage')).toBe(weapon.indexOf('buildAdvisories') + 1)
    const spellNames = detailFields({ id: 'cast', kind: 'spell' })
    expect(spellNames).not.toContain('attackPreview')
    expect(spellNames[0]).toBe('buildAdvisories')

    const spell = detailFields({ id: 'cast', kind: 'spell', name: 'Spellcasting', spells: [] })
    expect(spell.indexOf('name')).toBeLessThan(spell.indexOf('castingAbility'))
    expect(spell.indexOf('castingAbility')).toBeLessThan(spell.indexOf('spells'))
    expect(spell.indexOf('spells')).toBeLessThan(spell.indexOf('description'))
    expect(spell.indexOf('description')).toBeLessThan(spell.indexOf('omittedComponents'))
    expect(spell.indexOf('omittedComponents')).toBeLessThan(spell.lastIndexOf('limitedUse.kind'))
    expect(spell).not.toContain('trigger.text')
    expect(spell.filter((name) => name === 'limitedUse.kind')).toHaveLength(2)

    const reactionSpell = detailFields(
      { id: 'shield', kind: 'spell', name: 'Protective Magic', spells: [] },
      'reactions',
    )
    expect(reactionSpell.indexOf('castingAbility')).toBeLessThan(
      reactionSpell.indexOf('trigger.text'),
    )
    expect(reactionSpell.indexOf('trigger.text')).toBeLessThan(reactionSpell.indexOf('spells'))
    expect(reactionSpell.indexOf('spells')).toBeLessThan(reactionSpell.indexOf('description'))
  })

  it('uses optional disclosure for preset action descriptions and required richtext for custom', () => {
    expect(
      descriptionFieldConfig({
        id: 'slash',
        kind: 'attack',
        name: 'Slash',
      } as MonsterActionDraftRow),
    ).toMatchObject({
      type: 'richtext',
      optionalDisclosure: { addLabel: 'Add additional details' },
    })
    expect(descriptionFieldConfig({ id: 'parry', kind: 'special', name: 'Parry' })).toMatchObject({
      type: 'richtext',
      required: true,
    })
    expect(
      descriptionFieldConfig({ id: 'parry', kind: 'special', name: 'Parry' }),
    ).not.toHaveProperty('optionalDisclosure')
  })

  it('places save damage inline immediately after the description field', () => {
    const names = detailFields({
      id: 'breath',
      kind: 'save',
      name: 'Fire Breath',
      preset: 'breath-weapon',
    })
    const descriptionIndex = names.indexOf('description')
    const rollIndex = names.indexOf('resolution.effects.0.roll')
    const damageTypeIndex = names.indexOf('resolution.effects.0.damageType')
    expect(descriptionIndex).toBeGreaterThanOrEqual(0)
    expect(damageTypeIndex).toBe(descriptionIndex + 1)
    expect(rollIndex).toBe(damageTypeIndex + 1)
    expect(names.indexOf('limitedUse')).toBeGreaterThan(rollIndex)
    expect(names).not.toContain('limitedUse.kind')
    expect(names).not.toContain('attackPreview')
    expect(names[0]).toBe('buildAdvisories')
    const constrict = detailFields({
      id: 'squeeze',
      kind: 'save',
      name: 'Constrict',
      preset: 'constrict',
    })
    expect(constrict).not.toContain('limitedUse')
    expect(constrict).not.toContain('limitedUse.kind')
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

  it('advises when Tunneler or Flyby has no usable speed and leaves the trait unchanged', () => {
    const values = resolveMonsterCreateDefaultValues()
    values.movement = [{ mode: 'walk', feet: 30 }]
    values.traits = [
      { id: 'tunnel', preset: 'tunneler' },
      { id: 'glide', preset: 'flyby' },
      { id: 'leap', preset: 'running-leap' },
    ]
    const before = structuredClone(values.traits)

    const missing = collectMonsterFormAdvisories(values, new Map())
    expect(missing.map((advisory) => advisory.code)).toEqual([
      'tunneler-missing-burrow-speed',
      'flyby-missing-fly-speed',
    ])
    expect(missing[0]).toMatchObject({
      message: TUNNELER_MISSING_BURROW_SPEED_MESSAGE,
      path: 'traits.0',
    })
    expect(missing[1]).toMatchObject({
      message: FLYBY_MISSING_FLY_SPEED_MESSAGE,
      path: 'traits.1',
    })
    expect(values.traits).toEqual(before)

    values.movement = [
      { mode: 'walk', feet: 5 },
      { mode: 'burrow', feet: 10 },
      { mode: 'fly', feet: 30 },
    ]
    expect(collectMonsterFormAdvisories(values, new Map())).toEqual([])

    values.movement = [
      { mode: 'walk', feet: 5 },
      { mode: 'burrow', feet: 0 },
      { mode: 'fly', feet: 0 },
    ] as MonsterFormValues['movement']
    expect(
      collectMonsterFormAdvisories(values, new Map()).map((advisory) => advisory.code),
    ).toEqual(['tunneler-missing-burrow-speed', 'flyby-missing-fly-speed'])

    values.movement = [
      { mode: 'walk', feet: 30 },
      { mode: 'burrow', feet: '' },
      { mode: 'fly', feet: '' },
    ]
    expect(collectMonsterFormAdvisories(values, new Map())).toEqual([])

    values.traits = [{ id: 'leap', preset: 'running-leap' }]
    values.movement = [{ mode: 'walk', feet: 5 }]
    expect(collectMonsterFormAdvisories(values, new Map())).toEqual([])
    expect(values.traits).toEqual([{ id: 'leap', preset: 'running-leap' }])
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
      preset: 'bite',
      damageType: 'piercing',
      mode: 'melee',
    })
    expect(reloaded.actions[1]).not.toHaveProperty('name')

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

    const knight = pickMonster('knight')
    const knightForm = monsterToFormValues(knight)
    const crossbow = knightForm.actions.find((action) => action.id === 'heavy-crossbow')
    expect(crossbow).toMatchObject({ damage: { dice: { count: 2, faces: 10 } } })
    const knightSaved = buildMonsterInput(knightForm, { entity: knight }, 'draft')
    expect(
      (knightSaved.actions as Array<{ id?: string; damage?: unknown }>).find(
        (action) => action.id === 'heavy-crossbow',
      )?.damage,
    ).toEqual({ dice: { count: 2, faces: 10 } })
  })
})
