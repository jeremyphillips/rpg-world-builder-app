import {
  formatWeaponMasteryModeHint,
  formatWeaponPropertyModeHint,
  isWeaponMasteryCompatibleWithMode,
  isWeaponPropertyCompatibleWithMode,
  PHYSICAL_DAMAGE_TYPE_IDS,
  WEAPON_CATEGORIES,
  WEAPON_CATEGORY_ENTRIES,
  WEAPON_MASTERIES,
  WEAPON_MASTERY_ENTRIES,
  WEAPON_MODES,
  WEAPON_MODE_ENTRIES,
  WEAPON_PROPERTIES,
  WEAPON_PROPERTY_ENTRIES,
  weaponFormValuesHaveRange,
  type WeaponDamage,
  type WeaponEquipment,
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

import type { EquipmentFormValues } from '../../lib/equipment-form-def'
import { labelsFromEntries } from '../../lib/equipment-form-field-helpers'

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
const damageTypeOptions = toOptions(
  PHYSICAL_DAMAGE_TYPE_IDS,
  Object.fromEntries(PHYSICAL_DAMAGE_TYPE_IDS.map((id) => [id, id])) as Record<
    (typeof PHYSICAL_DAMAGE_TYPE_IDS)[number],
    string
  >,
)
const damageKindOptions = [
  { value: 'dice', label: 'Dice' },
  { value: 'flat', label: 'Flat amount' },
  { value: 'none', label: 'None' },
]

const WEAPON_SELECT_PLACEHOLDER = 'Choose...'

function visibleWhenDealsDamage(): FieldVisibility {
  return {
    dependsOn: ['damageKind'],
    visibleWhen: (v) => v.damageKind !== 'none',
  }
}

function visibleWhenDiceDamage(): FieldVisibility {
  return {
    dependsOn: ['damageKind'],
    visibleWhen: (v) => v.damageKind === 'dice',
  }
}

function visibleWhenFlatDamage(): FieldVisibility {
  return {
    dependsOn: ['damageKind'],
    visibleWhen: (v) => v.damageKind === 'flat',
  }
}

function visibleWhenVersatile(): FieldVisibility {
  return {
    dependsOn: ['properties'],
    visibleWhen: (v) => Array.isArray(v.properties) && v.properties.includes('versatile'),
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

export function damageToForm(
  damage: WeaponDamage | undefined,
): Pick<EquipmentFormValues, 'damageKind' | 'damageDice' | 'damageAmount'> {
  if (!damage) return { damageKind: 'none' }
  if (damage.kind === 'dice') {
    return {
      damageKind: 'dice',
      damageDice: { count: damage.count, faces: damage.faces },
    }
  }
  return {
    damageKind: 'flat',
    damageAmount: damage.amount,
  }
}

/** Weapon-specific form field group for the unified equipment form. */
export function weaponFormFieldGroup(): FormItem {
  return {
    kind: 'group',
    legend: 'Weapon',
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
            dynamicHint: weaponMasteryDynamicHint,
            hintPosition: 'below-control',
          },
        ],
      },
      {
        type: 'chips',
        name: 'properties',
        label: 'Properties',
        options: weaponPropertyOptions,
        optionAvailability: weaponPropertyOptionAvailability,
        dynamicHint: weaponPropertyDynamicHint,
      },
      {
        kind: 'row',
        fields: [
          {
            type: 'select',
            name: 'damageKind',
            label: 'Damage',
            options: damageKindOptions,
            defaultValue: 'dice',
            width: 'md',
          },
          {
            type: 'select',
            name: 'damageType',
            label: 'Damage type',
            options: damageTypeOptions,
            placeholder: WEAPON_SELECT_PLACEHOLDER,
            width: 'md',
            visibility: visibleWhenDealsDamage(),
            required: true,
          },
          {
            type: 'diceFormula',
            name: 'damageDice',
            label: 'Damage',
            modifierMode: 'none',
            size: 'md',
            width: 'auto',
            countMin: 1,
            visibility: visibleWhenDiceDamage(),
            required: true,
          },
        ],
      },
      {
        kind: 'row',
        fields: [
          {
            type: 'diceFormula',
            name: 'versatileDamage',
            label: 'Versatile damage',
            modifierMode: 'none',
            size: 'md',
            width: 'auto',
            countMin: 1,
            visibility: visibleWhenVersatile(),
            required: true,
          },
        ],
      },
      {
        type: 'number',
        name: 'damageAmount',
        label: 'Flat damage',
        min: 1,
        visibility: visibleWhenFlatDamage(),
        required: true,
      },
      {
        kind: 'row',
        fields: [
          {
            type: 'number',
            name: 'rangeNormal',
            label: 'Normal range (ft.)',
            min: 0,
            visibility: visibleWhenRangeFields(),
          },
          {
            type: 'number',
            name: 'rangeLong',
            label: 'Long range (ft.)',
            min: 0,
            visibility: visibleWhenRangeFields(),
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

export function weaponFormValuesFromEntity(
  item: WeaponEquipment,
): Pick<
  EquipmentFormValues,
  | 'category'
  | 'mode'
  | 'damageKind'
  | 'damageDice'
  | 'damageAmount'
  | 'damageType'
  | 'versatileDamage'
  | 'properties'
  | 'mastery'
  | 'rangeNormal'
  | 'rangeLong'
  | 'specialRules'
> {
  return {
    category: item.category,
    mode: item.mode,
    ...damageToForm(item.damage),
    damageType: item.damageType,
    versatileDamage: item.versatileDamage
      ? { count: item.versatileDamage.count, faces: item.versatileDamage.faces }
      : undefined,
    properties: item.properties,
    mastery: item.mastery,
    rangeNormal: item.range?.normal,
    rangeLong: item.range?.long,
    specialRules: item.specialRules,
  }
}
