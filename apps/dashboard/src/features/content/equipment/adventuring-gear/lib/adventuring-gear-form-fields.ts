import {
  GEAR_KINDS,
  GEAR_KIND_ENTRIES,
  HOLY_SYMBOL_USAGES,
  HOLY_SYMBOL_USAGE_ENTRIES,
} from '@rpg/contracts'
import { toOptions, type FieldVisibility, type FormItem } from '@rpg/ui/form'

import { labelsFromEntries } from '../../lib/equipment-form-field-helpers'

const gearKindOptions = toOptions(GEAR_KINDS, labelsFromEntries(GEAR_KIND_ENTRIES))
const holySymbolUsageOptions = toOptions(
  HOLY_SYMBOL_USAGES,
  labelsFromEntries(HOLY_SYMBOL_USAGE_ENTRIES),
)

const visibleWhenHolySymbol: FieldVisibility = {
  dependsOn: ['gearKind'],
  visibleWhen: (values) => values.gearKind === 'holy_symbol',
}

const visibleWhenFocusStaff: FieldVisibility = {
  dependsOn: ['gearKind'],
  visibleWhen: (values) =>
    values.gearKind === 'arcane_focus' || values.gearKind === 'druidic_focus',
}

/** Adventuring gear-specific form field group for the unified equipment form. */
export function adventuringGearFormFieldGroup(): FormItem {
  return {
    kind: 'group',
    legend: 'Adventuring Gear',
    fields: [
      {
        type: 'select',
        name: 'gearKind',
        label: 'Gear kind',
        options: gearKindOptions,
        required: true,
      },
      {
        type: 'combobox',
        name: 'holySymbolUsage',
        label: 'Holy symbol usage',
        options: holySymbolUsageOptions,
        multiple: true,
        required: true,
        visibility: visibleWhenHolySymbol,
      },
      {
        type: 'text',
        name: 'alsoWeaponSlug',
        label: 'Also weapon slug',
        hint: 'Weapon slug when this focus also counts as a weapon (e.g. quarterstaff).',
        visibility: visibleWhenFocusStaff,
      },
      {
        kind: 'row',
        fields: [
          {
            type: 'number',
            name: 'bundleSize',
            label: 'Bundle size',
            min: 1,
          },
          {
            type: 'text',
            name: 'storage',
            label: 'Storage',
          },
        ],
      },
      {
        type: 'textarea',
        name: 'propertiesText',
        label: 'Properties',
        hint: 'One mechanical note per line',
      },
      {
        type: 'text',
        name: 'capacity',
        label: 'Capacity',
      },
    ],
  }
}
