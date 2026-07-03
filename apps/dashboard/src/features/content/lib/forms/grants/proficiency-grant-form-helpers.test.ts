import { describe, expect, it } from 'vitest'

import {
  armorTrainingChoiceFormSchema,
  armorTrainingGrantItemFields,
  PROFICIENCY_POOL_CATEGORY_ANY,
  skillProficiencyChoiceFormSchema,
  skillProficiencyGrantItemFields,
  toolProficiencyChoiceFormSchema,
  toolProficiencyGrantItemFields,
  weaponProficiencyChoiceFormSchema,
  weaponProficiencyGrantItemFields,
  weaponProficiencyItemFormSchema,
  type WeaponProficiencyItemForm,
} from './proficiency-grant-form-fields'
import {
  armorTrainingGrantFromFormRow,
  armorTrainingGrantSummary,
  armorTrainingGrantTitle,
  armorTrainingGrantToFormRow,
  armorTrainingPoolFromFormRow,
  armorTrainingPoolToFormRow,
  skillProficiencyGrantFromFormRow,
  skillProficiencyGrantTitle,
  skillProficiencyGrantToFormRow,
  toolProficiencyGrantFromFormRow,
  toolProficiencyGrantTitle,
  toolProficiencyGrantToFormRow,
  toolProficiencyPoolFromFormRow,
  toolProficiencyPoolToFormRow,
  weaponProficiencyGrantFromFormRow,
  weaponProficiencyGrantSummary,
  weaponProficiencyGrantTitle,
  weaponProficiencyGrantToFormRow,
  weaponProficiencyPoolFromFormRow,
  weaponProficiencyPoolToFormRow,
} from './proficiency-grant-form-values'

describe('weaponProficiencyGrantToFormRow / weaponProficiencyGrantFromFormRow', () => {
  it('round-trips a fixed grant', () => {
    const grant = {
      kind: 'fixed' as const,
      weaponCategories: ['simple' as const],
    }
    const row = weaponProficiencyGrantToFormRow(grant)
    expect(weaponProficiencyGrantFromFormRow(row)).toEqual(grant)
  })

  it('round-trips a filtered choice pool', () => {
    const grant = {
      kind: 'choice' as const,
      choose: 1,
      pool: { source: 'filtered' as const, weaponCategory: 'martial' as const },
    }
    const row = weaponProficiencyGrantToFormRow(grant)
    expect(row).toMatchObject({
      itemKind: 'choice',
      poolSource: 'filtered',
      weaponProficiencyPoolCategory: 'martial',
    })
    expect(weaponProficiencyGrantFromFormRow(row)).toEqual(grant)
  })
})

describe('toolProficiencyGrantToFormRow / toolProficiencyGrantFromFormRow', () => {
  it('round-trips an any-tool choice pool', () => {
    const grant = {
      kind: 'choice' as const,
      choose: 3,
      pool: { source: 'any' as const },
    }
    const row = toolProficiencyGrantToFormRow(grant)
    expect(row).toMatchObject({ itemKind: 'choice', poolSource: 'any' })
    expect(toolProficiencyGrantFromFormRow(row)).toEqual(grant)
  })
})

describe('skillProficiencyGrantToFormRow / skillProficiencyGrantFromFormRow', () => {
  it('round-trips fixed skill ids', () => {
    const grant = {
      kind: 'fixed' as const,
      skillIds: ['athletics' as const, 'stealth' as const],
    }
    const row = skillProficiencyGrantToFormRow(grant)
    expect(skillProficiencyGrantFromFormRow(row)).toEqual(grant)
  })

  it('round-trips an any-skill choice pool', () => {
    const grant = {
      kind: 'choice' as const,
      choose: 2,
      pool: { source: 'any' as const },
    }
    const row = skillProficiencyGrantToFormRow(grant)
    expect(skillProficiencyGrantFromFormRow(row)).toEqual(grant)
  })
})

describe('armorTrainingGrantToFormRow / armorTrainingGrantFromFormRow', () => {
  it('round-trips fixed armor categories', () => {
    const grant = {
      kind: 'fixed' as const,
      armorCategories: ['light' as const, 'medium' as const],
    }
    const row = armorTrainingGrantToFormRow(grant)
    expect(armorTrainingGrantFromFormRow(row)).toEqual(grant)
  })
})

describe('weaponProficiencyPoolToFormRow / weaponProficiencyPoolFromFormRow', () => {
  it('maps empty category form values to undefined pool categories', () => {
    const pool = weaponProficiencyPoolFromFormRow({
      itemKind: 'choice',
      choose: 1,
      poolSource: 'filtered',
      weaponProficiencyPoolCategory: PROFICIENCY_POOL_CATEGORY_ANY,
    })
    expect(pool).toEqual({ source: 'filtered' })
  })

  it('maps filtered pools to flat form fields and back', () => {
    const pool = {
      source: 'filtered' as const,
      weaponCategory: 'simple' as const,
    }
    const formFields = weaponProficiencyPoolToFormRow(pool)
    expect(
      weaponProficiencyPoolFromFormRow({ itemKind: 'choice', choose: 1, ...formFields }),
    ).toEqual(pool)
  })
})

describe('toolProficiencyPoolToFormRow / toolProficiencyPoolFromFormRow', () => {
  it('maps filtered tool pools without a category', () => {
    const pool = toolProficiencyPoolFromFormRow({
      itemKind: 'choice',
      choose: 1,
      poolSource: 'filtered',
      toolProficiencyPoolCategory: PROFICIENCY_POOL_CATEGORY_ANY,
    })
    expect(pool).toEqual({ source: 'filtered' })
  })

  it('round-trips explicit tool pools', () => {
    const pool = {
      source: 'explicit' as const,
      toolSlugs: ['thieves-tools'],
    }
    const formFields = toolProficiencyPoolToFormRow(pool)
    expect(
      toolProficiencyPoolFromFormRow({ itemKind: 'choice', choose: 1, ...formFields }),
    ).toEqual(pool)
  })
})

describe('armorTrainingPoolToFormRow / armorTrainingPoolFromFormRow', () => {
  it('maps filtered armor pools to flat form fields and back', () => {
    const pool = {
      source: 'filtered' as const,
      armorCategory: 'heavy' as const,
    }
    const formFields = armorTrainingPoolToFormRow(pool)
    expect(armorTrainingPoolFromFormRow({ itemKind: 'choice', choose: 1, ...formFields })).toEqual(
      pool,
    )
  })
})

describe('proficiency grant titles and summaries', () => {
  const weaponOptions = [
    { value: 'longsword', label: 'Longsword' },
    { value: 'rapier', label: 'Rapier' },
  ]

  it('formats weapon choice titles with pool label and choose count', () => {
    expect(
      weaponProficiencyGrantTitle(
        {
          itemKind: 'choice',
          choose: 1,
          poolSource: 'filtered',
          weaponProficiencyPoolCategory: 'martial',
        },
        0,
      ),
    ).toBe('Martial Weapon — choose 1')
  })

  it('truncates explicit weapon pool titles when more than two items are listed', () => {
    expect(
      weaponProficiencyGrantTitle(
        {
          itemKind: 'choice',
          choose: 1,
          poolSource: 'explicit',
          weaponProficiencyPoolSlugs: ['longsword', 'rapier', 'greataxe'],
        },
        0,
        weaponOptions,
      ),
    ).toBe('3 items — choose 1')
  })

  it('wraps formatWeaponProficiencyGrantSentence for form rows', () => {
    expect(
      weaponProficiencyGrantSummary(
        {
          itemKind: 'choice',
          choose: 1,
          poolSource: 'filtered',
          weaponProficiencyPoolCategory: 'martial',
        },
        [],
      ),
    ).toBe('Character chooses 1 martial weapon.')
  })

  it('returns an empty summary for incomplete fixed rows', () => {
    expect(
      weaponProficiencyGrantSummary({ itemKind: 'fixed' } as WeaponProficiencyItemForm, []),
    ).toBe('')
  })

  it('formats tool choice titles', () => {
    expect(toolProficiencyGrantTitle({ itemKind: 'choice', choose: 3, poolSource: 'any' }, 0)).toBe(
      'any tool — choose 3',
    )
  })

  it('formats skill fixed titles from skill labels', () => {
    expect(
      skillProficiencyGrantTitle(
        { itemKind: 'fixed', skillProficiencyIds: ['athletics', 'stealth'] },
        0,
      ),
    ).toBe('Athletics, Stealth')
  })

  it('formats armor training summaries', () => {
    expect(
      armorTrainingGrantSummary(
        {
          itemKind: 'choice',
          choose: 1,
          poolSource: 'filtered',
          armorTrainingPoolCategory: 'heavy',
        },
        [],
      ),
    ).toBe('Character chooses 1 heavy armor.')
  })

  it('formats armor training choice titles', () => {
    expect(
      armorTrainingGrantTitle(
        {
          itemKind: 'choice',
          choose: 1,
          poolSource: 'filtered',
          armorTrainingPoolCategory: 'heavy',
        },
        0,
      ),
    ).toBe('Heavy Armor — choose 1')
  })
})

describe('weaponProficiencyGrantItemFields', () => {
  it('uses Grant type for the item kind select', () => {
    const fields = weaponProficiencyGrantItemFields({ options: { weapons: [] } })
    const itemKind = fields.find((field) => 'name' in field && field.name === 'itemKind')
    expect(itemKind).toMatchObject({ label: 'Grant type' })
  })

  it('embeds pool source in the choice inline sentence', () => {
    const fields = weaponProficiencyGrantItemFields({ options: { weapons: [] } })
    const chooseField = fields.find((field) => 'name' in field && field.name === 'choose')
    expect(chooseField).toMatchObject({
      type: 'inlineSentence',
      segments: expect.arrayContaining([
        { kind: 'text', value: 'Character chooses', tone: 'label' },
        { kind: 'text', value: 'from', tone: 'label' },
        expect.objectContaining({
          kind: 'select',
          name: 'poolSource',
          defaultValue: 'filtered',
          ariaLabel: 'Pool source',
        }),
      ]),
    })
  })

  it('uses armor options for fixed armor slug comboboxes', () => {
    const fields = armorTrainingGrantItemFields({
      options: { armor: [{ value: 'chain-mail', label: 'Chain Mail' }] },
    })
    const armorField = fields.find(
      (field) => 'name' in field && field.name === 'armorTrainingSlugs',
    )
    expect(armorField).toMatchObject({
      type: 'combobox',
      multiple: true,
      options: [{ value: 'chain-mail', label: 'Chain Mail' }],
    })
  })

  it('uses chips for skill proficiency fields', () => {
    const fields = skillProficiencyGrantItemFields({ options: {} })
    const skillField = fields.find(
      (field) => 'name' in field && field.name === 'skillProficiencyIds',
    )
    expect(skillField).toMatchObject({ type: 'chips', required: true })
  })

  it('uses tool options for fixed tool slug comboboxes', () => {
    const fields = toolProficiencyGrantItemFields({
      options: { tools: [{ value: 'thieves-tools', label: "Thieves' Tools" }] },
    })
    const toolField = fields.find(
      (field) => 'name' in field && field.name === 'toolProficiencySlugs',
    )
    expect(toolField).toMatchObject({
      type: 'combobox',
      multiple: true,
      options: [{ value: 'thieves-tools', label: "Thieves' Tools" }],
    })
  })
})

describe('proficiency grant choice schema validation', () => {
  it('rejects explicit weapon pools without slugs', () => {
    expect(
      weaponProficiencyChoiceFormSchema.safeParse({
        itemKind: 'choice',
        choose: 1,
        poolSource: 'explicit',
      }).success,
    ).toBe(false)
  })

  it('rejects explicit skill pools without skill ids', () => {
    expect(
      skillProficiencyChoiceFormSchema.safeParse({
        itemKind: 'choice',
        choose: 1,
        poolSource: 'explicit',
      }).success,
    ).toBe(false)
  })

  it('accepts filtered weapon pools with optional category', () => {
    expect(
      weaponProficiencyChoiceFormSchema.safeParse({
        itemKind: 'choice',
        choose: 1,
        poolSource: 'filtered',
        weaponProficiencyPoolCategory: PROFICIENCY_POOL_CATEGORY_ANY,
      }).success,
    ).toBe(true)
  })

  it('accepts any-tool choice pools', () => {
    expect(
      toolProficiencyChoiceFormSchema.safeParse({
        itemKind: 'choice',
        choose: 2,
        poolSource: 'any',
      }).success,
    ).toBe(true)
  })

  it('rejects explicit armor pools without slugs', () => {
    expect(
      armorTrainingChoiceFormSchema.safeParse({
        itemKind: 'choice',
        choose: 1,
        poolSource: 'explicit',
      }).success,
    ).toBe(false)
  })
})

describe('weaponProficiencyItemFormSchema', () => {
  it('parses fixed and choice rows', () => {
    expect(
      weaponProficiencyItemFormSchema.parse({
        itemKind: 'fixed',
        weaponProficiencyCategories: ['simple'],
      }),
    ).toMatchObject({ itemKind: 'fixed', weaponProficiencyCategories: ['simple'] })
  })
})
