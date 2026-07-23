import {
  ABILITY_SCORE_MAX,
  ABILITY_SCORE_MIN,
  ARMOR_CATEGORIES,
  ARMOR_CATEGORY_ENTRIES,
  ARMOR_MATERIALS,
  ARMOR_MATERIAL_ENTRIES,
} from '@rpg/contracts'
import { toOptions, type FieldVisibility, type FormItem } from '@rpg/ui/form'

import { labelsFromEntries } from '../../lib/equipment-form-field-helpers'

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

function visibleWhenArmorHeavy(): FieldVisibility {
  return {
    dependsOn: ['armorCategory'],
    visibleWhen: (v) => v.armorCategory === 'heavy',
  }
}

/** Armor-specific form field group for the unified equipment form. */
export function armorFormFieldGroup(): FormItem {
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
            name: 'armorCategory',
            label: 'Category',
            options: armorCategoryOptions,
            required: true,
            width: 'lg',
          },
          {
            type: 'select',
            name: 'material',
            label: 'Material',
            options: armorMaterialOptions,
            width: 'lg',
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
        digits: 2,
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
        kind: 'row',
        fields: [
          {
            type: 'switch',
            name: 'addDexModifier',
            label: 'Add Dex modifier',
            visibility: visibleWhenArmorNotShield(),
            width: 'auto',
            labelPosition: 'above',
          },
          {
            type: 'number',
            name: 'maxDexBonus',
            label: 'Max Dex bonus',
            min: 0,
            digits: 2,
            visibility: visibleWhenArmorDexCap(),
            width: 'auto',
          },
          {
            type: 'switch',
            name: 'stealthDisadvantage',
            label: 'Stealth disadvantage',
            width: 'auto',
            labelPosition: 'above',
          },
        ],
      },
      {
        type: 'number',
        name: 'strengthRequirement',
        label: 'Strength requirement',
        min: ABILITY_SCORE_MIN,
        max: ABILITY_SCORE_MAX,
        digits: 2,
        width: 'auto',
        hint: 'Minimum Strength to avoid speed penalty (heavy armor)',
        visibility: visibleWhenArmorHeavy(),
      },
    ],
  }
}
