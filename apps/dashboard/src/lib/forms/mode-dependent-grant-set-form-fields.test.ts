import {
  proficiencyDomainFieldNoun,
  resolveChoicePlaceholder,
  resolveSearchPlaceholder,
} from '@rpg/contracts'
import { describe, expect, it } from 'vitest'
import { isContainer, type ComboboxFieldConfig, type DependentConfig } from '@rpg/ui/form'

import { armorProficiencyGrantSetField } from './grant-sets/armor-proficiency-grant-field'
import { levelZeroArmorProficiencyGrantSetField } from './grant-sets/level-zero-armor-proficiency-grant-field'
import { weaponProficiencyGrantSetField } from './grant-sets/weapon-proficiency-grant-field'
import { modeDependentGrantSetField } from './mode-dependent-grant-set-form-fields'

function expectDependentField(
  item: ReturnType<typeof modeDependentGrantSetField>,
): DependentConfig {
  if (!isContainer(item) || item.kind !== 'dependent') {
    throw new Error('Expected dependent container')
  }
  return item
}

describe('modeDependentGrantSetField', () => {
  it('returns a dependent field with inset rail dependents and no panel chrome on chips', () => {
    const item = expectDependentField(
      modeDependentGrantSetField({
        modeFieldName: 'weaponProficiencyMode',
        modes: ['categories', 'specific'],
        modeLabels: { categories: 'Categories', specific: 'Specific' },
        categoriesPath: 'proficiencies.weapons.categories',
        itemsPath: 'proficiencies.weapons.items',
        label: 'Weapon proficiency mode',
        categoryOptions: [],
        itemOptions: [],
        categoryMode: 'categories',
        specificMode: 'specific',
      }),
    )

    expect(item).toMatchObject({
      kind: 'dependent',
      controller: {
        type: 'radio',
        name: 'weaponProficiencyMode',
      },
    })
    expect(item.dependents).not.toHaveProperty('inset')
    expect(item.dependents).not.toHaveProperty('chrome')
    expect(item.dependents).not.toHaveProperty('panel')

    const chips = item.dependents.fields[0]
    expect(chips).toMatchObject({ type: 'chips' })
    expect(chips).not.toHaveProperty('chrome')
    expect(item.controller).not.toHaveProperty('separator')

    const combobox = item.dependents.fields[1]
    expect(combobox).toMatchObject({ type: 'combobox', width: 'full' })
  })

  it('threads itemsNoun into the items combobox for generated copy', () => {
    const item = expectDependentField(
      modeDependentGrantSetField({
        modeFieldName: 'weaponProficiencyMode',
        modes: ['categories', 'specific'],
        modeLabels: { categories: 'Categories', specific: 'Specific' },
        categoriesPath: 'proficiencies.weapons.categories',
        itemsPath: 'proficiencies.weapons.items',
        label: 'Weapon proficiency mode',
        categoryOptions: [],
        itemOptions: [],
        categoryMode: 'categories',
        specificMode: 'specific',
        itemsLabel: 'Weapon choices',
        itemsNoun: proficiencyDomainFieldNoun('weapon'),
      }),
    )

    const combobox = item.dependents.fields[1] as ComboboxFieldConfig
    expect(combobox.noun).toEqual(proficiencyDomainFieldNoun('weapon'))
    expect(resolveChoicePlaceholder(combobox.noun!, true)).toBe('Choose weapons…')
    expect(resolveSearchPlaceholder(combobox.noun!)).toBe('Search weapons…')
  })
})

describe('proficiency grant-set field factories', () => {
  it('defaults weapon items combobox nouns while preserving contextual labels', () => {
    const item = expectDependentField(
      weaponProficiencyGrantSetField({
        modeFieldName: 'weaponProficiencyMode',
        categoriesPath: 'proficiencies.weapons.categories',
        itemsPath: 'proficiencies.weapons.items',
        label: 'Weapon proficiency mode',
        categoryOptions: [],
        itemOptions: [],
        itemsLabel: 'Weapon choices',
      }),
    )
    const combobox = item.dependents.fields[1] as ComboboxFieldConfig
    expect(combobox.label).toBe('Weapon choices')
    expect(combobox.noun).toEqual(proficiencyDomainFieldNoun('weapon'))
  })

  it('defaults armor items combobox nouns', () => {
    const item = expectDependentField(
      armorProficiencyGrantSetField({
        modeFieldName: 'armorProficiencyMode',
        modes: ['categories', 'specific'],
        modeLabels: { categories: 'Categories', specific: 'Specific' },
        categoriesPath: 'proficiencies.armor.categories',
        itemsPath: 'proficiencies.armor.items',
        label: 'Armor proficiency mode',
        categoryOptions: [],
        itemOptions: [],
        categoryMode: 'categories',
        specificMode: 'specific',
        itemsLabel: 'Specific armor',
      }),
    )
    const combobox = item.dependents.fields[1] as ComboboxFieldConfig
    expect(combobox.noun).toEqual(proficiencyDomainFieldNoun('armor'))
  })
})

describe('levelZeroArmorProficiencyGrantSetField', () => {
  it('hides dependents when mode is none', () => {
    const item = expectDependentField(
      levelZeroArmorProficiencyGrantSetField({
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
    expect(item.dependents.visibility!.visibleWhen({ levelZeroArmorGrantMode: 'categories' })).toBe(
      true,
    )
  })
})
