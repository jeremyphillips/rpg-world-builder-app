import { z } from 'zod'
import {
  ABILITY_ENTRIES,
  ABILITY_IDS,
  ARMOR_CATEGORIES,
  ARMOR_CATEGORY_ENTRIES,
  getProficiencyDomainSentenceForm,
  TOOL_CATEGORIES,
  TOOL_CATEGORY_ENTRIES,
  WEAPON_CATEGORIES,
  WEAPON_CATEGORY_ENTRIES,
  abilitySchema,
  armorCategorySchema,
  skillSchema,
  toolCategorySchema,
  weaponCategorySchema,
} from '@rpg/contracts'
import { toOptions, type FormItem } from '@rpg/ui/form'

import { modeDependentGrantSetField } from '@/lib/forms/mode-dependent-grant-set-form-fields'

import type { ContentFormCtx } from '../../lib/forms/registry/content-form-registry'
import {
  referenceSkillFieldOptions,
  referenceToolFieldOptions,
  referenceWeaponFieldOptions,
} from '../../lib/form-options/content-field-option.lib'
import { WEAPON_PROFICIENCY_MODES } from './class-form-constants'
import {
  INDIVIDUAL_WEAPONS_TOGGLE_HINT,
  SAVING_THROWS_HINT,
  WEAPON_PROFICIENCIES_HINT,
  WEAPON_PROFICIENCY_MODE_LABELS,
} from './class-form-labels'

const abilityOptions = toOptions(
  ABILITY_IDS,
  Object.fromEntries(ABILITY_IDS.map((id) => [id, ABILITY_ENTRIES[id].label])) as Record<
    (typeof ABILITY_IDS)[number],
    string
  >,
)

const armorCategoryOptions = toOptions(
  ARMOR_CATEGORIES,
  Object.fromEntries(ARMOR_CATEGORIES.map((c) => [c, ARMOR_CATEGORY_ENTRIES[c].label])) as Record<
    (typeof ARMOR_CATEGORIES)[number],
    string
  >,
)

const weaponCategoryOptions = toOptions(
  WEAPON_CATEGORIES,
  Object.fromEntries(WEAPON_CATEGORIES.map((c) => [c, WEAPON_CATEGORY_ENTRIES[c].label])) as Record<
    (typeof WEAPON_CATEGORIES)[number],
    string
  >,
)

const toolCategoryOptions = toOptions(
  TOOL_CATEGORIES,
  Object.fromEntries(TOOL_CATEGORIES.map((c) => [c, TOOL_CATEGORY_ENTRIES[c].label])) as Record<
    (typeof TOOL_CATEGORIES)[number],
    string
  >,
)

export const proficienciesFormSchema = z.object({
  savingThrows: z.array(abilitySchema).min(1).max(2),
  armor: z.array(armorCategorySchema),
  weapons: z.object({
    categories: z.array(weaponCategorySchema),
    items: z.array(z.string()).optional(),
  }),
  tools: z.object({
    categories: z.array(toolCategorySchema),
    items: z.array(z.string()).optional(),
  }),
  skills: z.object({
    items: z.array(skillSchema),
  }),
})

/** Draft proficiencies form schema — saving throws may be empty while authoring. */
export const proficienciesDraftFormSchema = proficienciesFormSchema.extend({
  savingThrows: z.array(abilitySchema).max(2).default([]),
})

const grantedSkillProficienciesLegend = `Granted ${getProficiencyDomainSentenceForm('skill', 2)}`
const grantedToolProficienciesLegend = `Granted ${getProficiencyDomainSentenceForm('tool', 2)}`

export function proficienciesFields(ctx: ContentFormCtx): FormItem[] {
  const skillOptions = referenceSkillFieldOptions(ctx.options?.skills)

  const defensesGroup: FormItem = {
    kind: 'group',
    legend: 'Defenses',
    fields: [
      {
        type: 'chips',
        name: 'proficiencies.savingThrows',
        label: 'Saving throws',
        options: abilityOptions,
        max: 2,
        required: true,
        hint: SAVING_THROWS_HINT,
        separator: 'subtle',
      },
      {
        type: 'chips',
        name: 'proficiencies.armor',
        label: 'Armor training',
        options: armorCategoryOptions,
      },
    ],
  }

  const weaponsGroup: FormItem = {
    kind: 'group',
    legend: 'Weapons',
    fields: [
      modeDependentGrantSetField({
        modeFieldName: 'weaponProficiencyMode',
        modes: WEAPON_PROFICIENCY_MODES,
        modeLabels: WEAPON_PROFICIENCY_MODE_LABELS,
        categoriesPath: 'proficiencies.weapons.categories',
        itemsPath: 'proficiencies.weapons.items',
        label: 'Weapon proficiency mode',
        hint: { text: INDIVIDUAL_WEAPONS_TOGGLE_HINT, position: 'below-control' },
        categoryOptions: weaponCategoryOptions,
        itemOptions: referenceWeaponFieldOptions(ctx.options?.equipment),
        categoriesLabel: 'Weapon proficiencies',
        itemsLabel: 'Weapon choices',
        categoriesHint: WEAPON_PROFICIENCIES_HINT,
        categoryMode: 'categories',
        specificMode: 'individual',
        labelVisibility: 'srOnly',
        dependents: { chrome: 'rail' },
      }),
    ],
  }

  const grantedSkillsGroup: FormItem = {
    kind: 'group',
    legend: grantedSkillProficienciesLegend,
    fields: [
      {
        type: 'chips',
        name: 'proficiencies.skills.items',
        label: grantedSkillProficienciesLegend,
        labelVisibility: 'srOnly',
        options: skillOptions,
      },
    ],
  }

  const grantedToolsGroup: FormItem = {
    kind: 'group',
    legend: grantedToolProficienciesLegend,
    fields: [
      {
        type: 'chips',
        name: 'proficiencies.tools.categories',
        label: 'Tool categories',
        options: toolCategoryOptions,
      },
      {
        type: 'combobox',
        name: 'proficiencies.tools.items',
        label: 'Specific tools',
        multiple: true,
        options: referenceToolFieldOptions(ctx.options?.equipment),
        placeholder: 'Choose tools…',
        width: 'xl',
      },
    ],
  }

  return [
    {
      kind: 'columns',
      collapseOrder: 'interleave',
      columns: [
        { fields: [defensesGroup, grantedSkillsGroup] },
        { fields: [weaponsGroup, grantedToolsGroup] },
      ],
    },
  ]
}
