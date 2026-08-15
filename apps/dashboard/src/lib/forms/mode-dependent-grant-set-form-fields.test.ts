import { describe, expect, it } from 'vitest'
import { DEFAULT_DEPENDENT_INSET, isContainer, type DependentConfig } from '@rpg/ui/form'

import {
  modeDependentGrantSetField,
  xorProficiencyGrantSetField,
} from './mode-dependent-grant-set-form-fields'

function expectDependentField(
  item: ReturnType<typeof modeDependentGrantSetField>,
): DependentConfig {
  if (!isContainer(item) || item.kind !== 'dependent') {
    throw new Error('Expected dependent container')
  }
  return item
}

describe('modeDependentGrantSetField', () => {
  it('returns a dependent field with undecorated dependents and no panel chrome on chips', () => {
    const item = expectDependentField(
      modeDependentGrantSetField({
        modeFieldName: 'weaponProficiencyMode',
        modes: ['categories', 'individual'],
        modeLabels: { categories: 'Categories', individual: 'Individual' },
        categoriesPath: 'proficiencies.weapons.categories',
        itemsPath: 'proficiencies.weapons.items',
        label: 'Weapon proficiency mode',
        categoryOptions: [],
        itemOptions: [],
        categoryMode: 'categories',
        specificMode: 'individual',
      }),
    )

    expect(item).toMatchObject({
      kind: 'dependent',
      controller: {
        type: 'radio',
        name: 'weaponProficiencyMode',
      },
      dependents: {
        inset: DEFAULT_DEPENDENT_INSET,
        chrome: 'none',
      },
    })
    expect(item.dependents).not.toHaveProperty('panel')

    const chips = item.dependents.fields[0]
    expect(chips).toMatchObject({ type: 'chips' })
    expect(chips).not.toHaveProperty('chrome')
    expect(item.controller).not.toHaveProperty('separator')
  })
})

describe('xorProficiencyGrantSetField', () => {
  it('hides dependents when mode is none', () => {
    const item = expectDependentField(
      xorProficiencyGrantSetField({
        modeFieldName: 'levelZeroArmorGrantMode',
        categoriesPath: 'levelZeroArmorProficiencies.categories',
        itemsPath: 'levelZeroArmorProficiencies.items',
        label: 'Armor proficiencies',
        categoryOptions: [],
        itemOptions: [],
      }),
    )

    expect(item.dependents.visibility).toEqual({
      dependsOn: ['levelZeroArmorGrantMode'],
      visibleWhen: expect.any(Function),
    })
    expect(item.dependents.visibility!.visibleWhen({ levelZeroArmorGrantMode: 'none' })).toBe(false)
    expect(item.dependents.visibility!.visibleWhen({ levelZeroArmorGrantMode: 'category' })).toBe(
      true,
    )
  })
})
