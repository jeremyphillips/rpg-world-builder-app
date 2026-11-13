import { describe, expect, it } from 'vitest'

import { resolutionFormValidationMessages } from './resolution-form-messages'
import { resolutionFormSchema } from './resolution-form-schema'
import {
  createDefaultAttackResolutionFormValues,
  createDefaultSavingThrowResolutionFormValues,
} from './resolution-form-values'

describe('resolutionFormSchema', () => {
  it('accepts default attack and saving-throw presets', () => {
    expect(resolutionFormSchema.parse(createDefaultAttackResolutionFormValues())).toMatchObject({
      methodKind: 'attack',
      attackType: 'ranged-spell',
    })
    expect(
      resolutionFormSchema.parse(createDefaultSavingThrowResolutionFormValues()),
    ).toMatchObject({
      methodKind: 'saving-throw',
      saveAbility: 'con',
    })
  })

  it('requires attackType when methodKind is attack', () => {
    const result = resolutionFormSchema.safeParse({
      ...createDefaultAttackResolutionFormValues(),
      attackType: undefined,
    })

    expect(result.success).toBe(false)
    if (result.success) return

    expect(result.error.issues).toContainEqual(
      expect.objectContaining({
        path: ['attackType'],
        message: resolutionFormValidationMessages.attackTypeRequired(),
      }),
    )
  })

  it('requires saveAbility when methodKind is saving-throw', () => {
    const result = resolutionFormSchema.safeParse({
      ...createDefaultSavingThrowResolutionFormValues(),
      saveAbility: undefined,
    })

    expect(result.success).toBe(false)
    if (result.success) return

    expect(result.error.issues).toContainEqual(
      expect.objectContaining({
        path: ['saveAbility'],
        message: resolutionFormValidationMessages.saveAbilityRequired(),
      }),
    )
  })

  it('requires target distance when proximity is distance', () => {
    const defaults = createDefaultAttackResolutionFormValues()
    const result = resolutionFormSchema.safeParse({
      ...defaults,
      target: {
        ...defaults.target!,
        proximity: { kind: 'distance' },
      },
    })

    expect(result.success).toBe(false)
    if (result.success) return

    expect(result.error.issues).toContainEqual(
      expect.objectContaining({
        path: ['target', 'proximity', 'distance', 'value'],
        message: resolutionFormValidationMessages.proximityDistanceRequired(),
      }),
    )
  })
})
