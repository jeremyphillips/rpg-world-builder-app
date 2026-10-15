import { describe, expect, it } from 'vitest'
import { buildContentPurposeSelectors } from '@rpg/contracts'
import { isContainer, type ComboboxFieldConfig, type DependentConfig } from '@rpg/ui/form'

import { assertComboboxOptionsMatchFilterDimensions } from '@/lib/forms/grant-sets/combobox-filter-option-metadata.lib'
import { buildArmorProficiencyGrantComboboxFilters } from '@/lib/forms/grant-sets/armor-proficiency-combobox-filters.lib'
import { referenceArmorComboboxFieldOptions } from '@/features/content/lib/form-options/content-field-option.lib'
import { pickArmor } from '@/test/fixtures/pick'

import { LEVEL_ZERO_NPCS_ENABLED, levelZeroNpcsFields } from './level-zero-npc-form-fields'

function expectAllowDependent(fields: ReturnType<typeof levelZeroNpcsFields>): DependentConfig {
  const section = fields[0]
  if (!section || !isContainer(section) || section.kind !== 'group') {
    throw new Error('Expected Level 0 NPCs group')
  }

  const dependent = section.fields[0]
  if (!dependent || !isContainer(dependent) || dependent.kind !== 'dependent') {
    throw new Error('Expected Allow dependent')
  }

  return dependent
}

describe('levelZeroNpcsFields', () => {
  it('keeps Allow dependents on the default nest at the group and dependent layers', () => {
    const allow = expectAllowDependent(
      levelZeroNpcsFields({ languageOptions: [], armorOptions: [], weaponOptions: [] }),
    )

    expect(allow.controller).toMatchObject({
      type: 'switch',
      name: LEVEL_ZERO_NPCS_ENABLED,
      label: 'Allow',
    })
    expect(allow.dependents.chrome).toBeUndefined()
    expect(allow.dependents.inset).not.toBe(false)
    expect(
      allow.dependents.fields.some(
        (field) => isContainer(field) && field.kind === 'group' && 'chrome' in field,
      ),
    ).toBe(false)
  })

  it('keeps standard array and grant-set fields flat under Allow dependents', () => {
    const allow = expectAllowDependent(
      levelZeroNpcsFields({ languageOptions: [], armorOptions: [], weaponOptions: [] }),
    )

    expect(allow.dependents.fields[0]).toMatchObject({
      kind: 'row',
      spacing: 'compact',
      heading: { label: 'Standard array' },
    })
    expect(
      allow.dependents.fields.some((field) => isContainer(field) && field.kind === 'dependent'),
    ).toBe(true)
  })

  it('includes a wealth tiers group with one purse field per tier', () => {
    const allow = expectAllowDependent(
      levelZeroNpcsFields({ languageOptions: [], armorOptions: [], weaponOptions: [] }),
    )

    const wealthGroup = allow.dependents.fields.find(
      (field) => isContainer(field) && field.kind === 'group' && field.legend === 'Wealth tiers',
    )
    expect(wealthGroup).toBeDefined()
    if (!wealthGroup || !isContainer(wealthGroup) || wealthGroup.kind !== 'group') {
      throw new Error('Expected wealth tiers group')
    }
    expect(wealthGroup.fields).toHaveLength(4)
  })

  it('pairs level-0 armor combobox filters with option metadata', () => {
    const armorOptions = referenceArmorComboboxFieldOptions(
      buildContentPurposeSelectors([pickArmor('leather-armor'), pickArmor('ring-mail')]),
    )
    const allow = expectAllowDependent(
      levelZeroNpcsFields({ languageOptions: [], armorOptions, weaponOptions: [] }),
    )

    const armorGrant = allow.dependents.fields.find((field) => {
      if (!isContainer(field) || field.kind !== 'dependent') return false
      return 'name' in field.controller && field.controller.name === 'levelZeroArmorGrantMode'
    })
    expect(armorGrant).toBeDefined()
    if (!armorGrant || !isContainer(armorGrant) || armorGrant.kind !== 'dependent') {
      throw new Error('Expected armor grant dependent')
    }

    const combobox = armorGrant.dependents.fields.find(
      (field): field is ComboboxFieldConfig =>
        !('kind' in field) && 'type' in field && field.type === 'combobox',
    )
    expect(combobox?.filterSelects).toEqual(buildArmorProficiencyGrantComboboxFilters())

    expect(() =>
      assertComboboxOptionsMatchFilterDimensions(
        armorOptions,
        combobox?.filterSelects ?? buildArmorProficiencyGrantComboboxFilters(),
      ),
    ).not.toThrow()
  })

  it('keeps nested grant-set dependents on the default nest without panel chrome', () => {
    const allow = expectAllowDependent(
      levelZeroNpcsFields({ languageOptions: [], armorOptions: [], weaponOptions: [] }),
    )

    const nestedDependents = allow.dependents.fields.filter(
      (field): field is DependentConfig => isContainer(field) && field.kind === 'dependent',
    )

    expect(nestedDependents.length).toBeGreaterThanOrEqual(2)
    for (const nested of nestedDependents) {
      expect(nested.dependents.chrome).toBeUndefined()
      expect(nested.dependents.inset).not.toBe(false)
      expect(nested.dependents).not.toHaveProperty('panel')
    }
  })
})
