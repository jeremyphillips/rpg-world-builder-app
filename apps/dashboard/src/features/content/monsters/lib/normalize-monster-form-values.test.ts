import { describe, expect, it } from 'vitest'

import { normalizeMonsterFormValues } from './normalize-monster-form-values'
import { resolveMonsterCreateDefaultValues } from './monster-form-values'
import { buildMonsterPreviewSections } from './monster-form-preview'
import { buildMonsterInput } from './monster-form-values'

describe('normalizeMonsterFormValues', () => {
  it('strips inactive variants and never emits a zero hit-dice count', () => {
    const values = resolveMonsterCreateDefaultValues()
    values.armorClass = { kind: 'natural', bonus: 2 }
    values.hitPoints = { kind: 'hit-dice', count: 0 }
    values.actions = [
      { id: 'claw', kind: 'natural-weapon', name: 'Claw', damage: { flat: 1 }, mode: 'melee' },
    ]

    const normalized = normalizeMonsterFormValues(values, { intent: 'draft', mode: 'create' })
    expect(normalized.armorClass).toEqual({ kind: 'natural', bonus: 2 })
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

  it('matches the preview serializer', () => {
    const values = resolveMonsterCreateDefaultValues()
    values.name = 'Scout'
    const fromPreview = normalizeMonsterFormValues(values, { intent: 'draft', mode: 'create' })
    const sections = buildMonsterPreviewSections(values, {
      equipmentCatalogStatus: 'ready',
      equipmentCatalogById: new Map(),
    })
    expect(sections.statistics?.facts?.some((fact) => fact.label === 'AC')).toBe(true)
    expect(fromPreview.armorClass).toEqual({ kind: 'unarmored' })
    expect(buildMonsterInput(values, undefined, 'draft').name).toContain('Scout')
  })
})
