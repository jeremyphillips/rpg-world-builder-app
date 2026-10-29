import {
  armorBaseAcDisplayBounds,
  ABILITY_SCORE_MAX,
  ABILITY_SCORE_MIN,
  ARMOR_CATEGORIES,
  ARMOR_CATEGORY_ENTRIES,
  ARMOR_MATERIALS,
  ARMOR_MATERIAL_ENTRIES,
  formatArmorDexterityRuleHint,
  getAbilityCompactLabel,
  getAbilityLabel,
  resolveArmorDexterityRule,
  type Ability,
  type ArmorClassRules,
} from '@rpg/contracts'
import {
  toOptions,
  type FieldHintConfig,
  type FieldVisibility,
  type FormItem,
  type NumberFieldConfig,
} from '@rpg/ui/form'

import { labelsFromEntries } from '../../lib/equipment-form-field-helpers'
import {
  ARMOR_ABILITY_SCORE_REQUIREMENTS_FIELD,
  ARMOR_MINIMUM_STRENGTH_REQUIREMENT_SWITCH,
} from './armor-ability-score-requirements-form'

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

function armorBaseAcHint(category: unknown): string | undefined {
  if (category !== 'light' && category !== 'medium' && category !== 'heavy') return undefined
  return formatArmorDexterityRuleHint(resolveArmorDexterityRule(category))
}

/** Body Base AC and shield AC bonus both use the same empty stepper control. */
function armorAcStepperField(args: {
  name: 'baseAc' | 'acBonus'
  label: string
  visibility: FieldVisibility
  hint?: FieldHintConfig
  min?: number
  max?: number
}): NumberFieldConfig {
  const { name, label, visibility, hint, min, max } = args
  return {
    type: 'number',
    name,
    label,
    control: 'stepper',
    digits: 2,
    visibility,
    required: true,
    ...(min !== undefined ? { min } : {}),
    ...(max !== undefined ? { max } : {}),
    ...(hint ? { hint } : {}),
  }
}

/** Armor-specific form field group for the unified equipment form. */
export function armorFormFieldGroup(rules?: ArmorClassRules): FormItem {
  const baseBounds = rules ? armorBaseAcDisplayBounds(rules) : undefined
  return {
    kind: 'group',
    legend: '',
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
      armorAcStepperField({
        name: 'baseAc',
        label: 'Base AC',
        min: baseBounds?.min,
        max: baseBounds?.max,
        visibility: visibleWhenArmorNotShield(),
        hint: {
          position: 'below-control',
          icon: 'info',
          resolve: {
            dependsOn: ['armorCategory'],
            hintWhen: (values) => armorBaseAcHint(values.armorCategory),
          },
        },
      }),
      armorAcStepperField({
        name: 'acBonus',
        label: 'AC bonus',
        min: 0,
        visibility: visibleWhenArmorShield(),
      }),
      {
        type: 'switch',
        name: 'stealthDisadvantage',
        label: 'Stealth disadvantage',
        width: 'auto',
        labelPosition: 'above',
      },
      minimumAbilityScoreRequirementField({
        ability: 'str',
        switchName: ARMOR_MINIMUM_STRENGTH_REQUIREMENT_SWITCH,
      }),
    ],
  }
}

/**
 * Switch-gated minimum score for one ability. The switch is form-only state; the stored
 * shape is the generic `abilityScoreRequirements` map. Only Strength is authored today.
 */
function minimumAbilityScoreRequirementField(args: {
  ability: Ability
  switchName: string
}): FormItem {
  const { ability, switchName } = args
  return {
    kind: 'dependent',
    controller: {
      type: 'switch',
      name: switchName,
      label: `Minimum ${getAbilityLabel(ability)} requirement`,
      defaultValue: false,
    },
    dependents: {
      fields: [
        {
          type: 'number',
          name: `${ARMOR_ABILITY_SCORE_REQUIREMENTS_FIELD}.${ability}`,
          label: `Minimum ${getAbilityCompactLabel(ability)} score`,
          min: ABILITY_SCORE_MIN,
          max: ABILITY_SCORE_MAX,
          digits: 2,
          width: 'auto',
          required: true,
        },
      ],
    },
  }
}
