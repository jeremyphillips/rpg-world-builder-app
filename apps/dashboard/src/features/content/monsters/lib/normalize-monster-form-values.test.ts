import { describe, expect, it } from 'vitest'

import { normalizeMonsterFormValues } from './normalize-monster-form-values'
import { resolveMonsterCreateDefaultValues } from './monster-form-values'
import { buildMonsterPreviewSections } from './monster-form-preview'
import { buildMonsterInput } from './monster-form-values'

describe('normalizeMonsterFormValues', () => {
  it('strips inactive variants and never emits a zero hit-dice count', () => {
    const values = resolveMonsterCreateDefaultValues()
    values.sizes = ['small', 'medium']
    values.armorClass = { naturalArmorBonus: 2, useFixedAc: false }
    values.hitPoints = { kind: 'hit-dice', count: 0 }
    values.actions = [
      { id: 'claw', kind: 'natural-weapon', name: 'Claw', damage: { flat: 1 }, mode: 'melee' },
    ]

    const normalized = normalizeMonsterFormValues(values, { intent: 'draft', mode: 'create' })
    expect(normalized.sizes).toEqual(['small', 'medium'])
    expect(normalized.armorClass).toEqual({ naturalArmorBonus: 2 })
    expect(normalized.hitPoints).toEqual({ kind: 'hit-dice' })
    expect(JSON.stringify(normalized)).not.toContain('"count":0')
    expect(normalized).not.toHaveProperty('hover')
    expect(normalized).not.toHaveProperty('experiencePointsOverride')
  })

  it('sends null only for baseline-present clearable keys on update', () => {
    const values = resolveMonsterCreateDefaultValues()
    values.challengeRating = '1/8'
    values.description = '   '
    const created = normalizeMonsterFormValues(values, {
      intent: 'draft',
      mode: 'create',
      baseline: { hover: true, description: 'Old', experiencePointsOverride: 0 },
    })
    expect(created.hover).toBeUndefined()
    expect(created.description).toBeUndefined()

    const updated = normalizeMonsterFormValues(values, {
      intent: 'publish',
      mode: 'update',
      baseline: { hover: true, description: 'Old', experiencePointsOverride: 0 },
    })
    expect(updated.hover).toBeNull()
    expect(updated.description).toBeNull()
    expect(updated.experiencePointsOverride).toBeNull()
  })

  it('keeps a CR 0 override and drops empty telepathy', () => {
    const values = resolveMonsterCreateDefaultValues()
    values.challengeRating = '0'
    values.experiencePointsOverride = 0
    values.proficiencies.languages = [{ language: 'common' }]
    values.communication = { telepathy: undefined }
    const normalized = normalizeMonsterFormValues(values, { intent: 'draft', mode: 'create' })
    expect(normalized.experiencePointsOverride).toBe(0)
    expect(normalized.proficiencies).toMatchObject({
      languages: [{ language: 'common' }],
    })
    expect(normalized.communication).toEqual({})
  })

  it('preserves equipment rows when catalog ids are unresolved', () => {
    const values = resolveMonsterCreateDefaultValues()
    values.equipment = [
      {
        entryId: 'missing',
        equipmentId: 'removed-from-catalog',
        quantity: 2,
        customName: 'Relic',
      },
    ]

    const normalized = normalizeMonsterFormValues(values, { intent: 'draft', mode: 'create' })
    expect(normalized.equipment).toEqual(values.equipment)
  })

  it('omits a blank action name and keeps a custom name that matches the weapon', () => {
    const values = resolveMonsterCreateDefaultValues()
    values.equipment = [
      { entryId: 'sword', equipmentId: 'longsword', quantity: 1, customName: 'Longsword' },
    ]
    values.actions = [
      { id: 'blank', kind: 'weapon', equipmentEntryId: 'sword', name: '   ' },
      { id: 'custom', kind: 'weapon', equipmentEntryId: 'sword', name: 'Longsword' },
    ]
    const normalized = normalizeMonsterFormValues(values, { intent: 'draft', mode: 'create' })
    const actions = normalized.actions as { id: string; name?: string; equipmentEntryId?: string }[]
    expect(actions.find((action) => action.id === 'blank')).not.toHaveProperty('name')
    expect(actions.find((action) => action.id === 'custom')?.name).toBe('Longsword')

    values.equipment[0]!.customName = 'Rusty Shiv'
    const renamed = normalizeMonsterFormValues(values, { intent: 'draft', mode: 'create' })
    const renamedActions = renamed.actions as { id: string; name?: string }[]
    expect(renamedActions.find((action) => action.id === 'custom')?.name).toBe('Longsword')
  })

  it('keeps partial weapon damage and joins a form flat into the draft roll', () => {
    const values = resolveMonsterCreateDefaultValues()
    values.actions = [
      {
        id: 'partial',
        kind: 'weapon',
        equipmentEntryId: 'sword',
        damage: { dice: { count: 2 } },
      },
      {
        id: 'flat',
        kind: 'weapon',
        equipmentEntryId: 'bow',
        damage: { flatOperator: '+', flatAmount: 1 },
      },
      {
        id: 'open',
        kind: 'weapon',
        equipmentEntryId: 'club',
        damage: {},
      },
      { id: 'plain', kind: 'weapon', equipmentEntryId: 'dagger' },
    ]
    const normalized = normalizeMonsterFormValues(values, { intent: 'draft', mode: 'create' })
    const actions = normalized.actions as Array<{ id: string; damage?: unknown }>
    expect(actions.find((action) => action.id === 'partial')?.damage).toEqual({
      dice: { count: 2 },
    })
    expect(actions.find((action) => action.id === 'flat')?.damage).toEqual({ flat: 1 })
    expect(actions.find((action) => action.id === 'open')?.damage).toEqual({})
    expect(actions.find((action) => action.id === 'plain')).not.toHaveProperty('damage')
  })

  it('matches the preview serializer', () => {
    const values = resolveMonsterCreateDefaultValues()
    values.name = 'Scout'
    const fromPreview = normalizeMonsterFormValues(values, { intent: 'draft', mode: 'create' })
    const sections = buildMonsterPreviewSections(values, {
      equipmentCatalogStatus: 'ready',
      equipmentCatalogById: new Map(),
    })
    expect(sections.statistics?.facts?.some((fact) => fact.label === 'AC')).toBe(true)
    expect(fromPreview.armorClass).toEqual({})
    expect(buildMonsterInput(values, undefined, 'draft').name).toContain('Scout')
  })
})
