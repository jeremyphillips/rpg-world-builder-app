import type { ContentPurposeSelectors, Equipment } from '@rpg/contracts'
import type { FieldOption } from '@rpg/ui/form'

import {
  referenceArmorComboboxFieldOptions,
  referenceToolComboboxFieldOptions,
  referenceWeaponComboboxFieldOptions,
} from '@/features/content/lib/form-options/content-field-option.lib'

import type { GrantSetItemsComboboxConfig } from '@/lib/forms/mode-dependent-grant-set-form-fields'

import { buildArmorProficiencyGrantComboboxFilters } from './armor-proficiency-combobox-filters.lib'
import { buildToolProficiencyComboboxFilters } from './tool-proficiency-combobox-filters.lib'
import { buildWeaponProficiencyGrantComboboxFilters } from './weapon-proficiency-combobox-filters.lib'

export type EquipmentProficiencyGrantKind = 'weapon' | 'armor' | 'tool'

export function equipmentProficiencyGrantComboboxConfig(
  selectors: ContentPurposeSelectors<Equipment> | undefined,
  kind: EquipmentProficiencyGrantKind,
): { itemOptions: FieldOption[]; itemsCombobox: GrantSetItemsComboboxConfig } {
  switch (kind) {
    case 'weapon':
      return {
        itemOptions: referenceWeaponComboboxFieldOptions(selectors),
        itemsCombobox: { filterSelects: buildWeaponProficiencyGrantComboboxFilters() },
      }
    case 'armor':
      return {
        itemOptions: referenceArmorComboboxFieldOptions(selectors),
        itemsCombobox: { filterSelects: buildArmorProficiencyGrantComboboxFilters() },
      }
    case 'tool':
      return {
        itemOptions: referenceToolComboboxFieldOptions(selectors),
        itemsCombobox: { filterSelects: buildToolProficiencyComboboxFilters() },
      }
  }
}
