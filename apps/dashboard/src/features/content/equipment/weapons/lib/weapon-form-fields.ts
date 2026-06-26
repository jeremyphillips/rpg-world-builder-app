import {
  PHYSICAL_DAMAGE_TYPE_IDS,
  WEAPON_CATEGORIES,
  WEAPON_CATEGORY_ENTRIES,
  WEAPON_MASTERIES,
  WEAPON_MASTERY_ENTRIES,
  WEAPON_MODES,
  WEAPON_MODE_ENTRIES,
  WEAPON_PROPERTIES,
  WEAPON_PROPERTY_ENTRIES,
  type WeaponDamage,
  type WeaponEquipment,
} from '@rpg/contracts'
import { toOptions, type FieldVisibility, type FormItem } from '@rpg/ui/form'

import type { EquipmentFormValues } from '../../lib/equipment-form-def'

function labelsFromEntries<const T extends string>(
  entries: Record<T, { label: string }>,
): Record<T, string> {
  return Object.fromEntries(
    (Object.entries(entries) as [T, { label: string }][]).map(([key, value]) => [key, value.label]),
  ) as Record<T, string>
}

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
]

const WEAPON_SELECT_PLACEHOLDER = 'Choose...'

function visibleWhenHasDamage(): FieldVisibility {
  return {
    dependsOn: ['hasDamage'],
    visibleWhen: (v) => v.hasDamage === true,
  }
}

function visibleWhenDiceDamage(): FieldVisibility {
  return {
    dependsOn: ['hasDamage', 'damageKind'],
    visibleWhen: (v) => v.hasDamage === true && v.damageKind === 'dice',
  }
}

function visibleWhenFlatDamage(): FieldVisibility {
  return {
    dependsOn: ['hasDamage', 'damageKind'],
    visibleWhen: (v) => v.hasDamage === true && v.damageKind === 'flat',
  }
}

function visibleWhenVersatile(): FieldVisibility {
  return {
    dependsOn: ['properties'],
    visibleWhen: (v) => Array.isArray(v.properties) && v.properties.includes('versatile'),
  }
}

function visibleWhenRanged(): FieldVisibility {
  return {
    dependsOn: ['mode'],
    visibleWhen: (v) => v.mode === 'ranged',
  }
}

export function damageToForm(
  damage: WeaponDamage | undefined,
): Pick<EquipmentFormValues, 'hasDamage' | 'damageKind' | 'damageDice' | 'damageAmount'> {
  if (!damage) return { hasDamage: false }
  if (damage.kind === 'dice') {
    return {
      hasDamage: true,
      damageKind: 'dice',
      damageDice: { count: damage.count, faces: damage.faces },
    }
  }
  return {
    hasDamage: true,
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
          },
        ],
      },
      {
        type: 'chips',
        name: 'properties',
        label: 'Properties',
        options: weaponPropertyOptions,
      },
      {
        type: 'switch',
        name: 'hasDamage',
        label: 'Deals damage',
        defaultValue: true,
      },
      {
        kind: 'row',
        fields: [
          {
            type: 'select',
            name: 'damageKind',
            label: 'Damage kind',
            options: damageKindOptions,
            defaultValue: 'dice',
            width: '1/2',
            visibility: visibleWhenHasDamage(),
          },
          {
            type: 'select',
            name: 'damageType',
            label: 'Damage type',
            options: damageTypeOptions,
            placeholder: WEAPON_SELECT_PLACEHOLDER,
            width: '1/2',
            visibility: visibleWhenHasDamage(),
            required: true,
          },
        ],
      },
      {
        kind: 'row',
        fields: [
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
            visibility: visibleWhenRanged(),
          },
          {
            type: 'number',
            name: 'rangeLong',
            label: 'Long range (ft.)',
            min: 0,
            visibility: visibleWhenRanged(),
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
  | 'hasDamage'
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
