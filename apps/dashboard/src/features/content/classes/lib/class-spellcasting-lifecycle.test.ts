import { describe, expect, it } from 'vitest'

import type { ClassFormValues } from './class-form-fields'
import { featureToFormRow } from './class-feature-form-fields'
import { createSpellcastingFeature } from './class-spellcasting-features'
import {
  findSpellcastingGrantingFeatureIndex,
  reconcileSpellcastingOnEnable,
  removeSpellcastingFromFormValues,
} from './class-spellcasting-lifecycle'

function baseFormValues(overrides: Partial<ClassFormValues> = {}): ClassFormValues {
  return {
    name: 'Custom Caster',
    hitDie: 8,
    primaryAbilities: ['int'],
    proficiencies: {
      savingThrows: ['int'],
      armor: [],
      weapons: { categories: ['simple'], items: [] },
      tools: { categories: [], items: [] },
      skills: { items: [] },
    },
    features: [],
    hasSpellcasting: false,
    ...overrides,
  } as ClassFormValues
}

describe('class spellcasting lifecycle', () => {
  it('creates config and granting feature when enabling from empty state', () => {
    const next = reconcileSpellcastingOnEnable(baseFormValues({ hasSpellcasting: true }))
    expect(next.hasSpellcasting).toBe(true)
    expect(next.spellcasting?.slotProgressionId).toBe('full-caster')
    expect(findSpellcastingGrantingFeatureIndex(next.features ?? [])).toBe(0)
  })

  it('preserves existing config when grant feature is missing', () => {
    const existingConfig = {
      slotProgressionId: 'half-caster',
      ability: 'wis' as const,
      progression: {
        cantrips: { curve: { rows: [{ level: 1, count: 2 }] }, extension: 'carryForward' as const },
      },
    }
    const next = reconcileSpellcastingOnEnable(
      baseFormValues({
        hasSpellcasting: true,
        spellcasting: existingConfig,
      }),
    )
    expect(next.spellcasting).toEqual(existingConfig)
    expect(findSpellcastingGrantingFeatureIndex(next.features ?? [])).toBe(0)
  })

  it('preserves existing granting feature when config is missing', () => {
    const featureRow = featureToFormRow(
      createSpellcastingFeature({ level: 3, usesPactMagic: true }),
    )
    const next = reconcileSpellcastingOnEnable(
      baseFormValues({
        hasSpellcasting: true,
        features: [featureRow],
      }),
    )
    expect(next.features).toHaveLength(1)
    expect(next.features?.[0]?.level).toBe(3)
    expect(next.spellcasting?.slotProgressionId).toBe('pact-magic')
  })

  it('does not duplicate the granting feature on repeated enable', () => {
    const featureRow = featureToFormRow(createSpellcastingFeature({ usesPactMagic: false }))
    const values = baseFormValues({
      hasSpellcasting: true,
      features: [featureRow],
      spellcasting: { slotProgressionId: 'full-caster', ability: 'cha' },
    })
    const next = reconcileSpellcastingOnEnable(values)
    expect(next.features).toHaveLength(1)
  })

  it('remove helper clears config and the dedicated granting feature', () => {
    const featureRow = featureToFormRow(createSpellcastingFeature({ usesPactMagic: false }))
    const next = removeSpellcastingFromFormValues(
      baseFormValues({
        hasSpellcasting: true,
        features: [featureRow],
        spellcasting: {
          slotProgressionId: 'full-caster',
          ability: 'cha',
          recommendations: [{ target: 'cantrips', spellIds: ['dancing-lights'] }],
        },
        grantsCantrips: true,
        spellSelectionModel: 'limitedRepertoire',
      }),
    )
    expect(next.hasSpellcasting).toBe(false)
    expect(next.features).toEqual([])
    expect(next.spellcasting).toBeUndefined()
    expect(next.grantsCantrips).toBe(false)
  })
})
