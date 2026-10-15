import { describe, expect, it } from 'vitest'

import { buildContentPurposeSelectors } from '@rpg/contracts'

import { referenceArmorComboboxFieldOptions } from '@/features/content/lib/form-options/content-field-option.lib'
import { pickArmor, pickEquipment } from '@/test/fixtures/pick'

import { buildArmorProficiencyGrantComboboxFilters } from './armor-proficiency-combobox-filters.lib'
import { buildWeaponProficiencyGrantComboboxFilters } from './weapon-proficiency-combobox-filters.lib'
import { assertComboboxOptionsMatchFilterDimensions } from './combobox-filter-option-metadata.lib'
import { equipmentProficiencyGrantComboboxConfig } from './equipment-proficiency-grant-combobox-config.lib'

describe('assertComboboxOptionsMatchFilterDimensions', () => {
  it('passes when armor combobox options include every armor filter dimension', () => {
    const selectors = buildContentPurposeSelectors([pickArmor('leather-armor')])
    const options = referenceArmorComboboxFieldOptions(selectors)
    const filterSelects = buildArmorProficiencyGrantComboboxFilters()

    expect(() => assertComboboxOptionsMatchFilterDimensions(options, filterSelects)).not.toThrow()
  })

  it('passes for bundled weapon grant combobox config', () => {
    const club = pickEquipment('club')
    if (club.kind !== 'weapon') throw new Error('Expected club weapon fixture')
    const selectors = buildContentPurposeSelectors([club])
    const { itemOptions, itemsCombobox } = equipmentProficiencyGrantComboboxConfig(
      selectors,
      'weapon',
    )
    const filterSelects =
      itemsCombobox.filterSelects ?? buildWeaponProficiencyGrantComboboxFilters()

    expect(() =>
      assertComboboxOptionsMatchFilterDimensions(itemOptions, filterSelects),
    ).not.toThrow()
  })

  it('throws when a filter dimension is missing on an option', () => {
    expect(() =>
      assertComboboxOptionsMatchFilterDimensions(
        [{ value: 'x', label: 'X', filterValues: { category: 'light' } }],
        buildArmorProficiencyGrantComboboxFilters(),
      ),
    ).toThrow(/filterValues\.stealth/)
  })
})
