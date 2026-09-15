import { describe, expect, it } from 'vitest'

import { grantRowFormSchema } from './grant-form-schema'

describe('grantRowFormSchema', () => {
  it('requires sense type for special sense grants', () => {
    const result = grantRowFormSchema.safeParse({
      grantType: 'senses',
      senseRange: 60,
    })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues.some((issue) => issue.path.join('.') === 'senseType')).toBe(true)
    }
  })

  it('requires language for language grants', () => {
    const result = grantRowFormSchema.safeParse({
      grantType: 'languages',
    })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues.some((issue) => issue.path.join('.') === 'language')).toBe(true)
    }
  })

  it('requires damage types for resistance grants', () => {
    const result = grantRowFormSchema.safeParse({
      grantType: 'resistances',
      resistances: [],
    })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues.some((issue) => issue.path.join('.') === 'resistances')).toBe(true)
    }
  })

  it('requires skills for specific skill proficiency grants', () => {
    const result = grantRowFormSchema.safeParse({
      grantType: 'skillProficiency',
      proficiencySource: 'specific',
      skillProficiencyIds: [],
    })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(
        result.error.issues.some((issue) => issue.path.join('.') === 'skillProficiencyIds'),
      ).toBe(true)
    }
  })

  it('requires tools for specific tool proficiency grants', () => {
    const result = grantRowFormSchema.safeParse({
      grantType: 'toolProficiency',
      proficiencySource: 'specific',
      toolProficiencySlugs: [],
    })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(
        result.error.issues.some((issue) => issue.path.join('.') === 'toolProficiencySlugs'),
      ).toBe(true)
    }
  })

  it('requires weapons for specific weapon proficiency grants', () => {
    const result = grantRowFormSchema.safeParse({
      grantType: 'weaponProficiency',
      proficiencySource: 'specific',
      weaponProficiencySlugs: [],
    })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(
        result.error.issues.some((issue) => issue.path.join('.') === 'weaponProficiencySlugs'),
      ).toBe(true)
    }
  })

  it('requires armor for specific armor training grants', () => {
    const result = grantRowFormSchema.safeParse({
      grantType: 'armorTraining',
      proficiencySource: 'specific',
      armorTrainingSlugs: [],
    })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(
        result.error.issues.some((issue) => issue.path.join('.') === 'armorTrainingSlugs'),
      ).toBe(true)
    }
  })

  it('requires spells for spell grants', () => {
    const result = grantRowFormSchema.safeParse({
      grantType: 'spells',
      spellCastingEnabled: true,
      spellCastingFrequency: 'at_will',
      spellIds: [],
    })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues.some((issue) => issue.path.join('.') === 'spellIds')).toBe(true)
    }
  })

  it('requires movement speed for movement grants', () => {
    const result = grantRowFormSchema.safeParse({
      grantType: 'movement',
      movementMode: 'walk',
      movementOperation: 'increase',
    })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues.some((issue) => issue.path.join('.') === 'movementFeet')).toBe(
        true,
      )
    }
  })
})
