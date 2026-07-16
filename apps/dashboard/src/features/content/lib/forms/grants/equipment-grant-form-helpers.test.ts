import { describe, expect, it } from 'vitest'

import { pickClass } from '../../fixtures/pick'
import {
  equipmentGrantChoiceItemFormSchema,
  equipmentGrantItemFields,
  equipmentGrantItemFormSchema,
  EQUIPMENT_POOL_CATEGORY_ANY,
  type EquipmentGrantItemForm,
} from './equipment-grant-form-fields'
import {
  applyEquipmentGrantKindSync,
  equipmentGrantFromFormRow,
  equipmentGrantSummary,
  equipmentGrantTitle,
  equipmentGrantToFormRow,
  equipmentPoolFromFormRow,
  equipmentPoolToFormRow,
} from './equipment-grant-form-values'

describe('equipmentGrantToFormRow / equipmentGrantFromFormRow', () => {
  it('round-trips a granted item', () => {
    const grant = {
      kind: 'grant' as const,
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
      poolSource: 'filtered',
      poolEquipmentKind: 'tool',
      poolToolCategory: 'musical_instrument',
    })
    expect(equipmentGrantFromFormRow(row)).toEqual(instrumentChoice)
  })
})

describe('equipmentPoolToFormRow / equipmentPoolFromFormRow', () => {
  it('maps filtered pools to flat form fields and back', () => {
    const pool = {
      source: 'filtered' as const,
      equipmentKind: 'weapon' as const,
      weaponCategory: 'simple' as const,
    }
    const formFields = equipmentPoolToFormRow(pool)
    expect(equipmentPoolFromFormRow({ itemKind: 'choice', choose: 1, ...formFields })).toEqual(pool)
  })

  it('maps empty category form values to undefined pool categories', () => {
    const pool = equipmentPoolFromFormRow({
      itemKind: 'choice',
      choose: 1,
      poolSource: 'filtered',
      poolEquipmentKind: 'tool',
      poolToolCategory: EQUIPMENT_POOL_CATEGORY_ANY,
    })
    expect(pool).toEqual({
      source: 'filtered',
      equipmentKind: 'tool',
    })
  })
})

describe('applyEquipmentGrantKindSync', () => {
  it('clears stale category filters when equipment kind changes', () => {
    const synced = applyEquipmentGrantKindSync({
      itemKind: 'choice',
      choose: 1,
      poolSource: 'filtered',
      poolEquipmentKind: 'weapon',
      poolToolCategory: 'musical_instrument',
      poolWeaponCategory: 'simple',
    })

    expect(synced.poolToolCategory).toBe(EQUIPMENT_POOL_CATEGORY_ANY)
    expect(synced.poolWeaponCategory).toEqual('simple')
  })
})

describe('equipmentGrantTitle', () => {
  const equipmentOptions = [
    { value: 'javelin', label: 'Javelin' },
    { value: 'greataxe', label: 'Greataxe' },
    { value: 'longsword', label: 'Longsword' },
    { value: 'rapier', label: 'Rapier' },
  ]

  it('includes quantity when granted equipment count is greater than one', () => {
    expect(
      equipmentGrantTitle(
        {
          itemKind: 'grant',
          grantTargetSource: 'equipment',
          equipmentSlug: 'javelin',
          quantity: 4,
        },
        0,
        equipmentOptions,
      ),
    ).toBe('4 × Javelin')
  })

  it('returns empty summary for incomplete choice rows', () => {
    expect(
      equipmentGrantSummary({
        itemKind: 'choice',
        choose: 1,
        poolSource: 'filtered',
      } as EquipmentGrantItemForm),
    ).toBe('')
  })

  it('formats choice titles with pool label and choose count', () => {
    expect(
      equipmentGrantTitle(
        {
          itemKind: 'choice',
          choose: 1,
          poolSource: 'filtered',
          poolEquipmentKind: 'tool',
          poolToolCategory: 'musical_instrument',
        },
        0,
      ),
    ).toBe('Musical Instrument — choose 1')
  })

  it('truncates explicit pool titles when more than two items are listed', () => {
    expect(
      equipmentGrantTitle(
        {
          itemKind: 'choice',
          choose: 1,
          poolSource: 'explicit',
          poolEquipmentSlugs: ['longsword', 'rapier', 'greataxe'],
        },
        0,
        equipmentOptions,
      ),
    ).toBe('3 items — choose 1')
  })
})

describe('equipmentGrantSummary', () => {
  it('wraps formatEquipmentGrantSentence for form rows', () => {
    expect(
      equipmentGrantSummary(
        {
          itemKind: 'choice',
          choose: 1,
          poolSource: 'filtered',
          poolEquipmentKind: 'tool',
          poolToolCategory: 'musical_instrument',
        },
        [],
      ),
    ).toBe('Character chooses 1 musical instrument.')
  })

  it('returns an empty string for incomplete granted rows', () => {
    expect(equipmentGrantSummary({ itemKind: 'grant' } as EquipmentGrantItemForm, [])).toBe('')
  })
})

describe('equipmentGrantItemFields', () => {
  it('uses single-select combobox for granted equipment slugs in a row with quantity', () => {
    const fields = equipmentGrantItemFields({
      options: { equipment: [{ value: 'greataxe', label: 'Greataxe' }] },
    })
    const equipmentRow = fields.find(
      (field): field is Extract<typeof field, { kind: 'row' }> =>
        'kind' in field &&
        field.kind === 'row' &&
        field.fields.some((f) => f.name === 'equipmentSlug'),
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

  it('uses Grant type for the item kind select', () => {
    const fields = equipmentGrantItemFields({ options: { equipment: [] } })
    const itemKind = fields.find((field) => 'name' in field && field.name === 'itemKind')
    expect(itemKind).toMatchObject({ label: 'Grant type' })
  })

  it('embeds pool source in the choice inline sentence', () => {
    const fields = equipmentGrantItemFields({ options: { equipment: [] } })
    const chooseField = fields.find((field) => 'name' in field && field.name === 'choose')
    expect(chooseField).toMatchObject({
      type: 'inlineSentence',
      segments: expect.arrayContaining([
        { kind: 'text', value: 'Character chooses', tone: 'label' },
        { kind: 'number', name: 'choose', min: 1, digits: 1, defaultValue: 1 },
        { kind: 'text', value: 'item(s) from', tone: 'label' },
        expect.objectContaining({
          kind: 'select',
          name: 'poolSource',
          defaultValue: 'filtered',
          ariaLabel: 'Pool source',
        }),
      ]),
    })
    expect(fields.some((field) => 'name' in field && field.name === 'label')).toBe(false)
  })

  it('shows a single category select for the matching filtered equipment kind', () => {
    const fields = equipmentGrantItemFields({ options: { equipment: [] } })
    const filteredRow = fields.find(
      (field): field is Extract<typeof field, { kind: 'row' }> =>
        'kind' in field &&
        field.kind === 'row' &&
        field.fields.some((f) => f.name === 'poolEquipmentKind'),
    )
    const toolCategory = filteredRow?.fields.find((field) => field.name === 'poolToolCategory')
    const weaponCategory = filteredRow?.fields.find((field) => field.name === 'poolWeaponCategory')

    expect(toolCategory).toMatchObject({
      type: 'select',
      label: 'Tool category',
    })
    expect(weaponCategory).toMatchObject({
      type: 'select',
      label: 'Weapon category',
    })
  })
})

describe('equipmentGrantChoiceItemFormSchema validation', () => {
  it('rejects explicit pools without equipment slugs', () => {
    expect(
      equipmentGrantChoiceItemFormSchema.safeParse({
        itemKind: 'choice',
        choose: 1,
        poolSource: 'explicit',
      }).success,
    ).toBe(false)
  })

  it('rejects filtered pools without an equipment kind', () => {
    expect(
      equipmentGrantChoiceItemFormSchema.safeParse({
        itemKind: 'choice',
        choose: 1,
        poolSource: 'filtered',
      }).success,
    ).toBe(false)
  })

  it('accepts a filtered pool with equipment kind', () => {
    expect(
      equipmentGrantChoiceItemFormSchema.safeParse({
        itemKind: 'choice',
        choose: 1,
        poolSource: 'filtered',
        poolEquipmentKind: 'tool',
        poolToolCategory: 'musical_instrument',
      }).success,
    ).toBe(true)
  })
})

describe('equipmentGrantItemFormSchema', () => {
  it('parses granted and choice rows', () => {
    expect(
      equipmentGrantItemFormSchema.parse({
        itemKind: 'grant',
        equipmentSlug: 'dagger',
        quantity: 1,
      }),
    ).toMatchObject({ itemKind: 'grant', equipmentSlug: 'dagger' })
  })
})
