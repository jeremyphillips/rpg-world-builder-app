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
  it('round-trips a category grant', () => {
    const grant = {
      kind: 'fixed' as const,
      weaponCategories: ['simple' as const],
    }
    const row = weaponProficiencyGrantToFormRow(grant)
    expect(row).toMatchObject({ proficiencySource: 'category' })
    expect(weaponProficiencyGrantFromFormRow(row)).toEqual(grant)
  })

  it('round-trips a specific weapons grant', () => {
    const grant = {
      kind: 'fixed' as const,
      weaponSlugs: ['longsword', 'shortbow'],
    }
    const row = weaponProficiencyGrantToFormRow(grant)
    expect(row).toMatchObject({
      proficiencySource: 'specific',
      weaponProficiencySlugs: ['longsword', 'shortbow'],
    })
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
      proficiencySource: 'pool',
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
    expect(row).toMatchObject({ proficiencySource: 'pool', poolSource: 'any' })
    expect(toolProficiencyGrantFromFormRow(row)).toEqual(grant)
  })
})

describe('skillProficiencyGrantToFormRow / skillProficiencyGrantFromFormRow', () => {
  it('round-trips specific skill ids', () => {
    const grant = {
      kind: 'fixed' as const,
      skillIds: ['athletics' as const, 'stealth' as const],
    }
    const row = skillProficiencyGrantToFormRow(grant)
    expect(row).toMatchObject({ proficiencySource: 'specific' })
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
  it('round-trips category armor training', () => {
    const grant = {
      kind: 'fixed' as const,
      armorCategories: ['light' as const, 'medium' as const],
    }
    const row = armorTrainingGrantToFormRow(grant)
    expect(row).toMatchObject({ proficiencySource: 'category' })
    expect(armorTrainingGrantFromFormRow(row)).toEqual(grant)
  })
})

describe('weaponProficiencyPoolToFormRow / weaponProficiencyPoolFromFormRow', () => {
  it('maps empty category form values to undefined pool categories', () => {
    const pool = weaponProficiencyPoolFromFormRow({
      proficiencySource: 'pool',
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
      weaponProficiencyPoolFromFormRow({ proficiencySource: 'pool', choose: 1, ...formFields }),
    ).toEqual(pool)
  })
})

describe('toolProficiencyPoolToFormRow / toolProficiencyPoolFromFormRow', () => {
  it('maps filtered tool pools without a category', () => {
    const pool = toolProficiencyPoolFromFormRow({
      proficiencySource: 'pool',
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
      toolProficiencyPoolFromFormRow({ proficiencySource: 'pool', choose: 1, ...formFields }),
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
    expect(
      armorTrainingPoolFromFormRow({ proficiencySource: 'pool', choose: 1, ...formFields }),
    ).toEqual(pool)
  })
})

describe('proficiency grant titles and summaries', () => {
  const weaponOptions = [
    { value: 'longsword', label: 'Longsword' },
    { value: 'shortbow', label: 'Shortbow' },
    { value: 'rapier', label: 'Rapier' },
  ]

  it('formats specific weapon titles and summaries from mocks', () => {
    const row: WeaponProficiencyItemForm = {
      proficiencySource: 'specific',
      weaponProficiencySlugs: ['longsword', 'shortbow'],
    }
    expect(weaponProficiencyGrantTitle(row, 0, weaponOptions)).toBe(
      'Weapon proficiency — Longsword and Shortbow',
    )
    expect(weaponProficiencyGrantSummary(row, weaponOptions)).toBe(
      'Character gains proficiency with Longsword and Shortbow.',
    )
  })

  it('formats category weapon titles and summaries from mocks', () => {
    const row: WeaponProficiencyItemForm = {
      proficiencySource: 'category',
      weaponProficiencyCategories: ['simple'],
    }
    expect(weaponProficiencyGrantTitle(row, 0)).toBe('Weapon proficiency — Simple Weapon')
    expect(weaponProficiencyGrantSummary(row)).toBe(
      'Character gains proficiency with all simple weapons.',
    )
  })

  it('formats pool weapon titles and summaries from mocks', () => {
    const row: WeaponProficiencyItemForm = {
      proficiencySource: 'pool',
      choose: 2,
      poolSource: 'filtered',
      weaponProficiencyPoolCategory: 'simple',
    }
    expect(weaponProficiencyGrantTitle(row, 0)).toBe(
      'Weapon proficiency — choose 2 weapon proficiencies from simple weapons',
    )
    expect(weaponProficiencyGrantSummary(row)).toBe(
      'Character chooses 2 weapon proficiencies from simple weapons.',
    )
  })

  it('truncates explicit pool titles when more than two items are listed', () => {
    expect(
      weaponProficiencyGrantTitle(
        {
          proficiencySource: 'pool',
          choose: 1,
          poolSource: 'explicit',
          weaponProficiencyPoolSlugs: ['longsword', 'rapier', 'shortbow'],
        },
        0,
        weaponOptions,
      ),
    ).toBe('Weapon proficiency — choose 1 from selected weapons')
  })

  it('returns an empty summary for incomplete specific rows', () => {
    expect(
      weaponProficiencyGrantSummary(
        { proficiencySource: 'specific' } as WeaponProficiencyItemForm,
        [],
      ),
    ).toBe('')
  })

  it('formats tool pool titles', () => {
    expect(
      toolProficiencyGrantTitle({ proficiencySource: 'pool', choose: 3, poolSource: 'any' }, 0),
    ).toBe('Tool proficiency — choose 3 from any tools')
  })

  it('formats skill specific titles from skill labels', () => {
    expect(
      skillProficiencyGrantTitle(
        { proficiencySource: 'specific', skillProficiencyIds: ['athletics', 'stealth'] },
        0,
      ),
    ).toBe('Skill proficiency — Athletics and Stealth')
  })

  it('formats armor training pool summaries', () => {
    expect(
      armorTrainingGrantSummary(
        {
          proficiencySource: 'pool',
          choose: 1,
          poolSource: 'filtered',
          armorTrainingPoolCategory: 'heavy',
        },
        [],
      ),
    ).toBe('Character chooses 1 armor training from heavy armor.')
  })

  it('formats armor training pool titles', () => {
    expect(
      armorTrainingGrantTitle(
        {
          proficiencySource: 'pool',
          choose: 1,
          poolSource: 'filtered',
          armorTrainingPoolCategory: 'heavy',
        },
        0,
      ),
    ).toBe('Armor training — choose 1 armor training from heavy armor')
  })
})

describe('weaponProficiencyGrantItemFields', () => {
  it('uses Proficiency source for the mode select', () => {
    const fields = weaponProficiencyGrantItemFields({ options: { weapons: [] } })
    const proficiencySource = fields.find(
      (field) => 'name' in field && field.name === 'proficiencySource',
    )
    expect(proficiencySource).toMatchObject({ label: 'Proficiency source' })
  })

  it('embeds pool kind in the choice inline sentence', () => {
    const fields = weaponProficiencyGrantItemFields({ options: { weapons: [] } })
    const chooseField = fields.find((field) => 'name' in field && field.name === 'choose')
    expect(chooseField).toMatchObject({
      type: 'inlineSentence',
      segments: expect.arrayContaining([
        { kind: 'text', value: 'Character chooses', tone: 'label' },
        { kind: 'text', value: 'proficiency from', tone: 'label' },
        expect.objectContaining({
          kind: 'select',
          name: 'poolSource',
          defaultValue: 'filtered',
          ariaLabel: 'Pool kind',
        }),
      ]),
    })
  })

  it('shows only weapon slug combobox in specific mode', () => {
    const fields = weaponProficiencyGrantItemFields({
      options: { weapons: [{ value: 'longsword', label: 'Longsword' }] },
    })
    const slugField = fields.find(
      (field) => 'name' in field && field.name === 'weaponProficiencySlugs',
    )
    const categoryField = fields.find(
      (field) => 'name' in field && field.name === 'weaponProficiencyCategories',
    )
    expect(slugField).toMatchObject({ type: 'combobox', required: true })
    expect(categoryField).toMatchObject({
      type: 'chips',
      name: 'weaponProficiencyCategories',
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

  it('uses chips for skill proficiency fields in specific mode', () => {
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
        proficiencySource: 'pool',
        choose: 1,
        poolSource: 'explicit',
      }).success,
    ).toBe(false)
  })

  it('rejects explicit skill pools without skill ids', () => {
    expect(
      skillProficiencyChoiceFormSchema.safeParse({
        proficiencySource: 'pool',
        choose: 1,
        poolSource: 'explicit',
      }).success,
    ).toBe(false)
  })

  it('accepts filtered weapon pools with optional category', () => {
    expect(
      weaponProficiencyChoiceFormSchema.safeParse({
        proficiencySource: 'pool',
        choose: 1,
        poolSource: 'filtered',
        weaponProficiencyPoolCategory: PROFICIENCY_POOL_CATEGORY_ANY,
      }).success,
    ).toBe(true)
  })

  it('accepts any-tool choice pools', () => {
    expect(
      toolProficiencyChoiceFormSchema.safeParse({
        proficiencySource: 'pool',
        choose: 2,
        poolSource: 'any',
      }).success,
    ).toBe(true)
  })

  it('rejects explicit armor pools without slugs', () => {
    expect(
      armorTrainingChoiceFormSchema.safeParse({
        proficiencySource: 'pool',
        choose: 1,
        poolSource: 'explicit',
      }).success,
    ).toBe(false)
  })
})

describe('weaponProficiencyItemFormSchema', () => {
  it('parses specific, category, and pool rows', () => {
    expect(
      weaponProficiencyItemFormSchema.parse({
        proficiencySource: 'category',
        weaponProficiencyCategories: ['simple'],
      }),
    ).toMatchObject({ proficiencySource: 'category', weaponProficiencyCategories: ['simple'] })

    expect(
      weaponProficiencyItemFormSchema.parse({
        proficiencySource: 'specific',
        weaponProficiencySlugs: ['longsword'],
      }),
    ).toMatchObject({ proficiencySource: 'specific' })
  })
})
