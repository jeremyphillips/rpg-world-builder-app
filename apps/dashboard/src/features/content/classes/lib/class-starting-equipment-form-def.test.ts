import { describe, expect, it } from 'vitest'

import { pickClass } from '../../lib/fixtures/pick'
import {
  startingEquipmentChoiceItemFormSchema,
  startingEquipmentFormSchema,
  startingEquipmentFromFormValues,
  startingEquipmentItemFields,
  startingEquipmentOptionFormSchema,
  startingEquipmentToFormValues,
} from './class-starting-equipment-form-def'

describe('startingEquipment round-trip', () => {
  it('preserves Monk prose-only standard package without pool choice items', () => {
    const monk = pickClass('monk')
    const startingEquipment = monk.characterCreation?.startingEquipment
    expect(startingEquipment).toBeDefined()

    const formValues = startingEquipmentToFormValues(startingEquipment!)
    expect(startingEquipmentFormSchema.parse(formValues)).toEqual(formValues)

    const standard = formValues.options.find((option) => option.id === 'standard')
    expect(standard?.description).toContain('FOLLOWUP: proficiencyLinkedChoice')
    expect(standard?.items.every((item) => item.itemKind === 'fixed')).toBe(true)

    const roundTripped = startingEquipmentFromFormValues(formValues, startingEquipment)
    expect(roundTripped).toEqual(startingEquipment)
  })

  it('preserves gold-only options with empty items and wealth grant', () => {
    const barbarian = pickClass('barbarian')
    const startingEquipment = barbarian.characterCreation?.startingEquipment
    expect(startingEquipment).toBeDefined()

    const formValues = startingEquipmentToFormValues(startingEquipment!)
    const gold = formValues.options.find((option) => option.id === 'gold')
    expect(gold).toMatchObject({
      id: 'gold',
      label: 'Starting Gold',
      items: [],
      wealth: { gp: 75 },
    })

    const roundTripped = startingEquipmentFromFormValues(formValues, startingEquipment)
    expect(roundTripped?.options.find((option) => option.id === 'gold')).toEqual(
      startingEquipment!.options.find((option) => option.id === 'gold'),
    )
  })

  it('preserves wooden staff starting equipment without modifiers', () => {
    const druid = pickClass('druid')
    const startingEquipment = druid.characterCreation?.startingEquipment
    expect(startingEquipment).toBeDefined()

    const formValues = startingEquipmentToFormValues(startingEquipment!)
    const woodenStaff = formValues.options
      .find((option) => option.id === 'standard')
      ?.items.find((item) => item.itemKind === 'fixed' && item.equipmentSlug === 'wooden-staff')

    expect(woodenStaff).toMatchObject({
      itemKind: 'fixed',
      equipmentSlug: 'wooden-staff',
      equipped: false,
    })
    expect(woodenStaff?.itemKind === 'fixed' ? woodenStaff.modifiers : undefined).toBeUndefined()

    const roundTripped = startingEquipmentFromFormValues(formValues, startingEquipment)
    expect(roundTripped).toEqual(startingEquipment)
  })

  it('preserves Bard pool choice items with tool categories', () => {
    const bard = pickClass('bard')
    const startingEquipment = bard.characterCreation?.startingEquipment
    expect(startingEquipment).toBeDefined()

    const formValues = startingEquipmentToFormValues(startingEquipment!)
    const instrumentChoice = formValues.options
      .find((option) => option.id === 'standard')
      ?.items.find((item) => item.itemKind === 'choice')

    expect(instrumentChoice).toMatchObject({
      itemKind: 'choice',
      label: 'Musical Instrument',
      choose: 1,
      fromToolCategories: ['musical_instrument'],
    })

    const roundTripped = startingEquipmentFromFormValues(formValues, startingEquipment)
    expect(roundTripped).toEqual(startingEquipment)
  })
})

describe('startingEquipmentItemFields', () => {
  it('uses single-select combobox for fixed equipment slugs', () => {
    const fields = startingEquipmentItemFields({
      options: { equipment: [{ value: 'greataxe', label: 'Greataxe' }] },
    })
    const equipmentField = fields.find((field) => 'name' in field && field.name === 'equipmentSlug')

    expect(equipmentField).toMatchObject({
      type: 'combobox',
      multiple: false,
    })
  })
})

describe('startingEquipmentFormSchema validation', () => {
  it('rejects a pool choice item without equipment slugs or tool categories', () => {
    const result = startingEquipmentChoiceItemFormSchema.safeParse({
      itemKind: 'choice',
      label: 'Musical Instrument',
      choose: 1,
    })

    expect(result.success).toBe(false)
  })

  it('rejects a package with empty items and no wealth grant', () => {
    const result = startingEquipmentOptionFormSchema.safeParse({
      id: 'gold',
      label: 'Starting Gold',
      items: [],
    })

    expect(result.success).toBe(false)
  })

  it('accepts a gold-only package with wealth and no items', () => {
    const result = startingEquipmentOptionFormSchema.safeParse({
      id: 'gold',
      label: 'Starting Gold',
      items: [],
      wealth: { gp: 75 },
    })

    expect(result.success).toBe(true)
  })

  it('startingEquipmentFromFormValues omits when options are empty', () => {
    expect(
      startingEquipmentFromFormValues({
        choose: 1,
        options: [],
      }),
    ).toBeUndefined()
  })

  it('round-trips all 12 SRD classes through the form schema', () => {
    for (const slug of [
      'barbarian',
      'bard',
      'cleric',
      'druid',
      'fighter',
      'monk',
      'paladin',
      'ranger',
      'rogue',
      'sorcerer',
      'warlock',
      'wizard',
    ] as const) {
      const characterClass = pickClass(slug)
      const startingEquipment = characterClass.characterCreation?.startingEquipment
      expect(startingEquipment, `${slug} missing starting equipment seed`).toBeDefined()

      const formValues = startingEquipmentToFormValues(startingEquipment!)
      expect(startingEquipmentFormSchema.parse(formValues)).toEqual(formValues)
      expect(startingEquipmentFromFormValues(formValues, startingEquipment)).toEqual(
        startingEquipment,
      )
    }
  })
})
