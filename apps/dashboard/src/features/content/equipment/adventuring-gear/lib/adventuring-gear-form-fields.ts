import {
  GEAR_KINDS,
  GEAR_KIND_ENTRIES,
  HOLY_SYMBOL_USAGES,
  HOLY_SYMBOL_USAGE_ENTRIES,
  SPELLCASTING_GEAR_KINDS,
  SPELLCASTING_GEAR_KIND_ENTRIES,
} from '@rpg/contracts'
import { toOptions, type FieldVisibility, type FormItem } from '@rpg/ui/form'

import { labelsFromEntries } from '../../lib/equipment-form-field-helpers'

const gearKindOptions = toOptions(GEAR_KINDS, labelsFromEntries(GEAR_KIND_ENTRIES))
const spellcastingGearKindOptions = toOptions(
  SPELLCASTING_GEAR_KINDS,
  labelsFromEntries(SPELLCASTING_GEAR_KIND_ENTRIES),
)
const holySymbolUsageOptions = toOptions(
  HOLY_SYMBOL_USAGES,
  labelsFromEntries(HOLY_SYMBOL_USAGE_ENTRIES),
)

const visibleWhenSpellcastingGear: FieldVisibility = {
  dependsOn: ['gearKind'],
  visibleWhen: (values) => values.gearKind === 'spellcasting',
}

const visibleWhenHolySymbol: FieldVisibility = {
  dependsOn: ['spellcastingGearKind'],
  visibleWhen: (values) => values.spellcastingGearKind === 'holy_symbol',
}

const visibleWhenFocusStaff: FieldVisibility = {
  dependsOn: ['spellcastingGearKind'],
  visibleWhen: (values) =>
    values.spellcastingGearKind === 'arcane_focus' ||
    values.spellcastingGearKind === 'druidic_focus',
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
        type: 'select',
        name: 'spellcastingGearKind',
        label: 'Spellcasting kind',
        options: spellcastingGearKindOptions,
        required: true,
        visibility: visibleWhenSpellcastingGear,
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
