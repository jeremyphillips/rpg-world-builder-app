import { describe, expect, it } from 'vitest'

import {
  grantFieldMinSelectionsMessage,
  grantFieldRequiredSelectMessage,
} from './grant-field-terms'
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
      expect(
        result.error.issues.find((issue) => issue.path.join('.') === 'senseType')?.message,
      ).toBe(grantFieldRequiredSelectMessage('senseType'))
    }
  })

  it('treats blank sense type as missing, not invalid format', () => {
    const result = grantRowFormSchema.safeParse({
      grantType: 'senses',
      senseType: '',
      senseRange: 60,
    })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(
        result.error.issues.find((issue) => issue.path.join('.') === 'senseType')?.message,
      ).toBe(grantFieldRequiredSelectMessage('senseType'))
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
      expect(
        result.error.issues.find((issue) => issue.path.join('.') === 'resistances')?.message,
      ).toBe(grantFieldMinSelectionsMessage('resistances'))
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
      expect(
        result.error.issues.find((issue) => issue.path.join('.') === 'skillProficiencyIds')
          ?.message,
      ).toBe(grantFieldMinSelectionsMessage('skillProficiencyIds'))
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
      expect(
        result.error.issues.find((issue) => issue.path.join('.') === 'toolProficiencySlugs')
          ?.message,
      ).toBe(grantFieldMinSelectionsMessage('toolProficiencySlugs'))
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
      expect(
        result.error.issues.find((issue) => issue.path.join('.') === 'weaponProficiencySlugs')
          ?.message,
      ).toBe(grantFieldMinSelectionsMessage('weaponProficiencySlugs'))
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
      expect(
        result.error.issues.find((issue) => issue.path.join('.') === 'armorTrainingSlugs')?.message,
      ).toBe(grantFieldMinSelectionsMessage('armorTrainingSlugs'))
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
      expect(
        result.error.issues.find((issue) => issue.path.join('.') === 'spellIds')?.message,
      ).toBe(grantFieldMinSelectionsMessage('spellIds'))
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
