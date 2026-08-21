import {
  formatWeaponMasteryModeHint,
  formatWeaponPropertyModeHint,
  isWeaponMasteryCompatibleWithMode,
  isWeaponPropertyCompatibleWithMode,
  WEAPON_CATEGORIES,
  WEAPON_CATEGORY_ENTRIES,
  WEAPON_MASTERIES,
  WEAPON_MASTERY_ENTRIES,
  WEAPON_MODES,
  WEAPON_MODE_ENTRIES,
  WEAPON_PROPERTIES,
  WEAPON_PROPERTY_ENTRIES,
  WEAPON_PROPERTY_TERM,
  weaponFormValuesHaveRange,
  type WeaponMastery,
  type WeaponMode,
  type WeaponProperty,
} from '@rpg/contracts'
import {
  toOptions,
  type FieldDynamicHint,
  type FieldOptionAvailability,
  type FieldVisibility,
  type FormItem,
} from '@rpg/ui/form'

import { vocabularyFieldLabel } from '@/features/vocabulary'

import { labelsFromEntries } from '../../lib/equipment-form-field-helpers'
import {
  feetInputUnitField,
  SPELL_RANGE_DISTANCE_INLINE_COUNT_DIGITS,
} from '../../../lib/forms/fields/content-identity-form-fields'
import { weaponDamageFields } from '../../../lib/forms/mechanics/weapon-damage-fields'
import type { ContentFormCtx } from '../../../lib/forms/registry/content-form-registry'

const weaponCategoryOptions = toOptions(
  WEAPON_CATEGORIES,
  labelsFromEntries(WEAPON_CATEGORY_ENTRIES),
)
const weaponModeOptions = toOptions(WEAPON_MODES, labelsFromEntries(WEAPON_MODE_ENTRIES))
const weaponMasteryOptions = toOptions(WEAPON_MASTERIES, labelsFromEntries(WEAPON_MASTERY_ENTRIES))
const weaponPropertyOptions = toOptions(
  WEAPON_PROPERTIES,
  labelsFromEntries(WEAPON_PROPERTY_ENTRIES),
)

const WEAPON_SELECT_PLACEHOLDER = 'Choose...'

function visibleWhenVersatile(): FieldVisibility {
  return {
    dependsOn: ['properties', 'hasDamage'],
    visibleWhen: (v) =>
      v.hasDamage === true && Array.isArray(v.properties) && v.properties.includes('versatile'),
  }
}

function visibleWhenRangeFields(): FieldVisibility {
  return {
    dependsOn: ['mode', 'properties'],
    visibleWhen: (v) =>
      weaponFormValuesHaveRange({
        mode: v.mode as WeaponMode | undefined,
        properties: v.properties as WeaponProperty[] | undefined,
      }),
  }
}

const weaponPropertyOptionAvailability: FieldOptionAvailability = {
  dependsOn: ['mode'],
  enabledWhen: (values, optionValue) => {
    const mode = values.mode as WeaponMode | undefined
    if (!mode) return true
    return isWeaponPropertyCompatibleWithMode(optionValue as WeaponProperty, mode)
  },
}

const weaponMasteryOptionAvailability: FieldOptionAvailability = {
  dependsOn: ['mode'],
  enabledWhen: (values, optionValue) => {
    const mode = values.mode as WeaponMode | undefined
    if (!mode) return true
    return isWeaponMasteryCompatibleWithMode(optionValue as WeaponMastery, mode)
  },
}

const weaponPropertyDynamicHint: FieldDynamicHint = {
  dependsOn: ['mode'],
  hintWhen: (values) => formatWeaponPropertyModeHint(values.mode as WeaponMode | undefined),
}

const weaponMasteryDynamicHint: FieldDynamicHint = {
  dependsOn: ['mode'],
  hintWhen: (values) => formatWeaponMasteryModeHint(values.mode as WeaponMode | undefined),
}

/** Weapon-specific form field group for the unified equipment form. */
export function weaponFormFieldGroup(ctx: ContentFormCtx): FormItem {
  return {
    kind: 'group',
    legend: '',
    chrome: { variant: 'panel' },
    fields: [
      {
        kind: 'row',
        fields: [
          {
            type: 'select',
            name: 'category',
            label: 'Category',
            options: weaponCategoryOptions,
            placeholder: WEAPON_SELECT_PLACEHOLDER,
            required: true,
          },
          {
            type: 'select',
            name: 'mode',
            label: 'Mode',
            options: weaponModeOptions,
            placeholder: WEAPON_SELECT_PLACEHOLDER,
            required: true,
          },
          {
            type: 'select',
            name: 'mastery',
            label: 'Mastery',
            options: weaponMasteryOptions,
            placeholder: WEAPON_SELECT_PLACEHOLDER,
            required: true,
            optionAvailability: weaponMasteryOptionAvailability,
            hint: {
              position: 'below-control',
              resolve: weaponMasteryDynamicHint,
            },
          },
        ],
      },
      {
        type: 'chips',
        name: 'properties',
        label: vocabularyFieldLabel(WEAPON_PROPERTY_TERM, { plural: true }),
        options: weaponPropertyOptions,
        optionAvailability: weaponPropertyOptionAvailability,
        hint: { resolve: weaponPropertyDynamicHint },
      },
      {
        kind: 'group',
        legend: 'Damage',
        chrome: { variant: 'panel', elevation: 'raised' },
        fields: [
          ...weaponDamageFields({ ctx }),
          {
            kind: 'row',
            fields: [
              {
                type: 'diceFormula',
                name: 'versatileDamage',
                label: 'Versatile dice',
                modifierMode: 'none',
                width: 'auto',
                countMin: 1,
                visibility: visibleWhenVersatile(),
                required: true,
              },
            ],
          },
        ],
      },
      {
        kind: 'group',
        legend: 'Range',
        visibility: visibleWhenRangeFields(),
        fields: [
          {
            kind: 'row',
            fields: [
              feetInputUnitField('rangeNormal', 'Normal', {
                valueDigits: SPELL_RANGE_DISTANCE_INLINE_COUNT_DIGITS,
                width: 'auto',
              }),
              feetInputUnitField('rangeLong', 'Long', {
                valueDigits: SPELL_RANGE_DISTANCE_INLINE_COUNT_DIGITS,
                width: 'auto',
              }),
            ],
          },
        ],
      },
      {
        type: 'textarea',
        name: 'specialRules',
        label: 'Special rules',
        hint: 'Prose for special properties (lance, net, etc.)',
      },
    ],
  }
}
