import { describe, expect, it } from 'vitest'

import { pickClass } from '../../../lib/fixtures/pick'
import {
  startingEquipmentChoiceItemFormSchema,
  startingEquipmentFormSchema,
  startingEquipmentItemFields,
  startingEquipmentItemTitle,
  startingEquipmentOptionFormSchema,
} from './class-starting-equipment-form-fields'
import {
  startingEquipmentFromFormValues,
  startingEquipmentToFormValues,
} from './class-starting-equipment-form-values'

describe('startingEquipment round-trip', () => {
  it('preserves Monk prose-only standard package without pool choice items', () => {
    const monk = pickClass('monk')
    const startingEquipment = monk.characterCreation?.startingEquipment
    expect(startingEquipment).toBeDefined()

    const formValues = startingEquipmentToFormValues(startingEquipment!)
    expect(startingEquipmentFormSchema.parse(formValues)).toEqual(formValues)

    const standard = formValues.options.find((option) => option.id === 'standard')
    expect(standard?.description).toContain('FOLLOWUP: proficiencyLinkedChoice')
    expect(standard?.items.every((item) => item.itemKind === 'grant')).toBe(true)

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
      wealth: { amount: 75, currency: 'gp' },
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
      ?.items.find((item) => item.itemKind === 'grant' && item.equipmentSlug === 'wooden-staff')

    expect(woodenStaff).toMatchObject({
      itemKind: 'grant',
      equipmentSlug: 'wooden-staff',
      equipped: false,
    })
    expect(woodenStaff?.itemKind === 'grant' ? woodenStaff.modifiers : undefined).toBeUndefined()

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
      choose: 1,
      poolSource: 'filtered',
      poolEquipmentKind: 'tool',
      poolToolCategory: 'musical_instrument',
    })

    const roundTripped = startingEquipmentFromFormValues(formValues, startingEquipment)
    expect(roundTripped).toEqual(startingEquipment)
  })
})

describe('startingEquipmentItemTitle', () => {
  const equipmentOptions = [
    { value: 'javelin', label: 'Javelin' },
    { value: 'greataxe', label: 'Greataxe' },
  ]

  it('includes quantity when granted equipment count is greater than one', () => {
    expect(
      startingEquipmentItemTitle(
        { itemKind: 'grant', equipmentSlug: 'javelin', quantity: 4 },
        0,
        equipmentOptions,
      ),
    ).toBe('Javelin x4')
  })

  it('omits quantity suffix for a single granted item', () => {
    expect(
      startingEquipmentItemTitle(
        { itemKind: 'grant', equipmentSlug: 'greataxe', quantity: 1 },
        0,
        equipmentOptions,
      ),
    ).toBe('Greataxe')
  })
})

describe('startingEquipmentItemFields', () => {
  it('uses single-select combobox for granted equipment slugs in a row with quantity', () => {
    const fields = startingEquipmentItemFields({
      options: { equipment: [{ value: 'greataxe', label: 'Greataxe' }] },
    })
    const equipmentRow = fields.find(
      (field): field is Extract<typeof field, { kind: 'row' }> =>
        'kind' in field && field.kind === 'row',
    )
    const equipmentField = equipmentRow?.fields.find((field) => field.name === 'equipmentSlug')
    const quantityField = equipmentRow?.fields.find((field) => field.name === 'quantity')

    expect(equipmentField).toMatchObject({
      type: 'combobox',
      multiple: false,
      width: 'full',
    })
    expect(quantityField).toMatchObject({
      type: 'number',
      width: 'auto',
      digits: 2,
    })
  })
})

describe('startingEquipmentFormSchema validation', () => {
  it('rejects a pool choice item without pool configuration', () => {
    const result = startingEquipmentChoiceItemFormSchema.safeParse({
      itemKind: 'choice',
      choose: 1,
      poolSource: 'filtered',
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
      wealth: { amount: 75, currency: 'gp' },
    })

    expect(result.success).toBe(true)
  })

  it('derives stable option ids from labels on save', () => {
    const existing = pickClass('monk').characterCreation!.startingEquipment!
    const formValues = startingEquipmentToFormValues(existing)
    const renamed = formValues.options.map((option) =>
      option.id === 'standard' ? { ...option, label: 'Renamed Standard Equipment' } : option,
    )

    const roundTripped = startingEquipmentFromFormValues(
      { ...formValues, options: renamed },
      existing,
    )

    expect(roundTripped?.options.find((option) => option.id === 'standard')?.label).toBe(
      'Renamed Standard Equipment',
    )
  })

  it('assigns ids to new options from labels', () => {
    const input = startingEquipmentFromFormValues({
      choose: 1,
      options: [
        {
          label: 'Heavy Armor',
          items: [],
          wealth: { amount: 10, currency: 'gp' },
        },
      ],
    })

    expect(input?.options[0]?.id).toBe('heavy-armor')
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
