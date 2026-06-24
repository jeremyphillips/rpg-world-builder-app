import {
  ARMOR_CATEGORIES,
  ARMOR_CATEGORY_ENTRIES,
  ARMOR_MATERIALS,
  ARMOR_MATERIAL_ENTRIES,
  type ArmorEquipment,
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

const armorCategoryOptions = toOptions(ARMOR_CATEGORIES, labelsFromEntries(ARMOR_CATEGORY_ENTRIES))

const armorMaterialOptions = toOptions(ARMOR_MATERIALS, labelsFromEntries(ARMOR_MATERIAL_ENTRIES))

function visibleWhenArmorNotShield(): FieldVisibility {
  return {
    dependsOn: ['armorCategory'],
    visibleWhen: (v) => v.armorCategory !== 'shields' && v.armorCategory !== undefined,
  }
}

function visibleWhenArmorShield(): FieldVisibility {
  return {
    dependsOn: ['armorCategory'],
    visibleWhen: (v) => v.armorCategory === 'shields',
  }
}

function visibleWhenArmorDexCap(): FieldVisibility {
  return {
    dependsOn: ['armorCategory', 'addDexModifier'],
    visibleWhen: (v) => v.armorCategory === 'medium' && v.addDexModifier === true,
  }
}

/** Armor-specific form field group for the unified equipment form. */
export function armorFormFieldGroup(): FormItem {
  return {
    kind: 'group',
    legend: 'Armor',
    fields: [
      {
        kind: 'row',
        fields: [
          {
            type: 'select',
            name: 'armorCategory',
            label: 'Category',
            options: armorCategoryOptions,
            required: true,
          },
          {
            type: 'select',
            name: 'material',
            label: 'Material',
            options: armorMaterialOptions,
          },
        ],
      },
      {
        type: 'number',
        name: 'baseAc',
        label: 'Base AC',
        min: 0,
        visibility: visibleWhenArmorNotShield(),
        required: true,
      },
      {
        type: 'number',
        name: 'acBonus',
        label: 'AC bonus',
        min: 0,
        visibility: visibleWhenArmorShield(),
        required: true,
      },
      {
        type: 'switch',
        name: 'addDexModifier',
        label: 'Add Dex modifier',
        visibility: visibleWhenArmorNotShield(),
      },
      {
        type: 'number',
        name: 'maxDexBonus',
        label: 'Max Dex bonus',
        min: 0,
        visibility: visibleWhenArmorDexCap(),
      },
      {
        type: 'switch',
        name: 'stealthDisadvantage',
        label: 'Stealth disadvantage',
      },
      {
        type: 'number',
        name: 'strengthRequirement',
        label: 'Strength requirement',
        min: 0,
        hint: 'Minimum Strength to avoid speed penalty (heavy armor)',
      },
    ],
  }
}

export function armorFormValuesFromEntity(
  item: ArmorEquipment,
): Pick<
  EquipmentFormValues,
  | 'armorCategory'
  | 'material'
  | 'baseAc'
  | 'acBonus'
  | 'addDexModifier'
  | 'maxDexBonus'
  | 'stealthDisadvantage'
  | 'strengthRequirement'
> {
  return {
    armorCategory: item.category,
    material: item.material,
    baseAc: item.baseAc,
    acBonus: item.acBonus,
    addDexModifier: item.addDexModifier,
    maxDexBonus: item.maxDexBonus,
    stealthDisadvantage: item.stealthDisadvantage,
    strengthRequirement: item.strengthRequirement,
  }
}
