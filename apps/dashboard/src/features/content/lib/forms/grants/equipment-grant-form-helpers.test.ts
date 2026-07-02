import { describe, expect, it } from 'vitest'

import { pickClass } from '../../fixtures/pick'
import {
  equipmentGrantChoiceItemFormSchema,
  equipmentGrantItemFields,
  equipmentGrantItemFormSchema,
} from './equipment-grant-form-fields'
import {
  applyEquipmentGrantKindSync,
  equipmentGrantFromFormRow,
  equipmentGrantTitle,
  equipmentGrantToFormRow,
  equipmentPoolFromFormRow,
  equipmentPoolToFormRow,
} from './equipment-grant-form-values'

describe('equipmentGrantToFormRow / equipmentGrantFromFormRow', () => {
  it('round-trips a fixed grant', () => {
    const grant = {
      kind: 'fixed' as const,
      equipmentSlug: 'dagger',
      quantity: 2,
      equipped: true,
    }
    const row = equipmentGrantToFormRow(grant)
    expect(equipmentGrantFromFormRow(row)).toEqual(grant)
  })

  it('round-trips an explicit pool choice', () => {
    const grant = {
      kind: 'choice' as const,
      choose: 1,
      label: 'Melee weapon',
      pool: {
        source: 'explicit' as const,
        equipmentSlugs: ['longsword', 'rapier'],
      },
    }
    const row = equipmentGrantToFormRow(grant)
    expect(row).toMatchObject({
      itemKind: 'choice',
      poolSource: 'explicit',
      poolEquipmentSlugs: ['longsword', 'rapier'],
    })
    expect(equipmentGrantFromFormRow(row)).toEqual(grant)
  })

  it('round-trips a filtered pool choice', () => {
    const bard = pickClass('bard')
    const instrumentChoice = bard.characterCreation?.startingEquipment?.options
      .find((option) => option.id === 'standard')
      ?.items.find((item) => item.kind === 'choice')
    expect(instrumentChoice).toBeDefined()

    const row = equipmentGrantToFormRow(instrumentChoice!)
    expect(row).toMatchObject({
      itemKind: 'choice',
      label: 'Musical Instrument',
      poolSource: 'filtered',
      poolEquipmentKind: 'tool',
      poolToolCategories: ['musical_instrument'],
    })
    expect(equipmentGrantFromFormRow(row)).toEqual(instrumentChoice)
  })
})

describe('equipmentPoolToFormRow / equipmentPoolFromFormRow', () => {
  it('maps filtered pools to flat form fields and back', () => {
    const pool = {
      source: 'filtered' as const,
      equipmentKind: 'weapon' as const,
      weaponCategories: ['simple' as const],
    }
    const formFields = equipmentPoolToFormRow(pool)
    expect(
      equipmentPoolFromFormRow({ itemKind: 'choice', label: 'Weapon', choose: 1, ...formFields }),
    ).toEqual(pool)
  })
})

describe('applyEquipmentGrantKindSync', () => {
  it('clears stale category filters when equipment kind changes', () => {
    const synced = applyEquipmentGrantKindSync({
      itemKind: 'choice',
      label: 'Pick',
      choose: 1,
      poolSource: 'filtered',
      poolEquipmentKind: 'weapon',
      poolToolCategories: ['musical_instrument'],
      poolWeaponCategories: ['simple'],
    })

    expect(synced.poolToolCategories).toBeUndefined()
    expect(synced.poolWeaponCategories).toEqual(['simple'])
  })
})

describe('equipmentGrantTitle', () => {
  const equipmentOptions = [
    { value: 'javelin', label: 'Javelin' },
    { value: 'greataxe', label: 'Greataxe' },
  ]

  it('includes quantity when fixed equipment count is greater than one', () => {
    expect(
      equipmentGrantTitle(
        { itemKind: 'fixed', equipmentSlug: 'javelin', quantity: 4 },
        0,
        equipmentOptions,
      ),
    ).toBe('Javelin x4')
  })

  it('formats choice titles with pool label and choose count', () => {
    expect(
      equipmentGrantTitle(
        {
          itemKind: 'choice',
          label: 'Musical Instrument',
          choose: 1,
          poolSource: 'filtered',
          poolEquipmentKind: 'tool',
          poolToolCategories: ['musical_instrument'],
        },
        0,
      ),
    ).toBe('Musical Instrument — choose 1')
  })
})

describe('equipmentGrantItemFields', () => {
  it('uses single-select combobox for fixed equipment slugs in a row with quantity', () => {
    const fields = equipmentGrantItemFields({
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

  it('shows category chips only for the matching filtered equipment kind', () => {
    const fields = equipmentGrantItemFields({ options: { equipment: [] } })
    const toolCategories = fields.find(
      (field) => 'name' in field && field.name === 'poolToolCategories',
    )
    const weaponCategories = fields.find(
      (field) => 'name' in field && field.name === 'poolWeaponCategories',
    )

    expect(
      toolCategories && 'visibility' in toolCategories ? toolCategories.visibility : undefined,
    ).toMatchObject({
      dependsOn: ['itemKind', 'poolSource', 'poolEquipmentKind'],
    })
    expect(
      weaponCategories && 'visibility' in weaponCategories
        ? weaponCategories.visibility
        : undefined,
    ).toMatchObject({
      dependsOn: ['itemKind', 'poolSource', 'poolEquipmentKind'],
    })
  })
})

describe('equipmentGrantChoiceItemFormSchema validation', () => {
  it('rejects explicit pools without equipment slugs', () => {
    expect(
      equipmentGrantChoiceItemFormSchema.safeParse({
        itemKind: 'choice',
        label: 'Pick one',
        choose: 1,
        poolSource: 'explicit',
      }).success,
    ).toBe(false)
  })

  it('rejects filtered pools without an equipment kind', () => {
    expect(
      equipmentGrantChoiceItemFormSchema.safeParse({
        itemKind: 'choice',
        label: 'Pick one',
        choose: 1,
        poolSource: 'filtered',
      }).success,
    ).toBe(false)
  })

  it('accepts a filtered pool with equipment kind', () => {
    expect(
      equipmentGrantChoiceItemFormSchema.safeParse({
        itemKind: 'choice',
        label: 'Musical Instrument',
        choose: 1,
        poolSource: 'filtered',
        poolEquipmentKind: 'tool',
        poolToolCategories: ['musical_instrument'],
      }).success,
    ).toBe(true)
  })
})

describe('equipmentGrantItemFormSchema', () => {
  it('parses fixed and choice rows', () => {
    expect(
      equipmentGrantItemFormSchema.parse({
        itemKind: 'fixed',
        equipmentSlug: 'dagger',
        quantity: 1,
      }),
    ).toMatchObject({ itemKind: 'fixed', equipmentSlug: 'dagger' })
  })
})
