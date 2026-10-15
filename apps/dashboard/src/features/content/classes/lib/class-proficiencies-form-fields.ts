import { z, type RefinementCtx } from 'zod'
import {
  ABILITY_ENTRIES,
  ABILITY_IDS,
  ARMOR_CATEGORIES,
  ARMOR_CATEGORY_ENTRIES,
  TOOL_CATEGORIES,
  TOOL_CATEGORY_ENTRIES,
  WEAPON_CATEGORIES,
  WEAPON_CATEGORY_ENTRIES,
  abilitySchema,
  addCustomRefinementIssue,
  armorCategorySchema,
  fieldValidationMessages,
  getProficiencyDomainSentenceForm,
  skillSchema,
  toolCategorySchema,
  weaponCategorySchema,
} from '@rpg/contracts'
import { toOptions, type FormItem } from '@rpg/ui/form'

import { armorProficiencyGrantSetField } from '@/lib/forms/grant-sets/armor-proficiency-grant-field'
import { weaponProficiencyGrantSetField } from '@/lib/forms/grant-sets/weapon-proficiency-grant-field'
import type { ContentFormCtx } from '../../lib/forms/registry/content-form-registry'
import { resolveContentWeaponGrantOptionLabel } from '../../lib/forms/grants/content-weapon-grant-option-label.lib'
import {
  referenceArmorFieldOptions,
  referenceSkillFieldOptions,
  referenceToolFieldOptions,
  referenceWeaponFieldOptions,
} from '../../lib/form-options/content-field-option.lib'
import {
  ARMOR_PROFICIENCY_MODES,
  WEAPON_PROFICIENCY_MODES,
  type ArmorProficiencyMode,
  type WeaponProficiencyMode,
} from './class-form-constants'
import {
  ARMOR_PROFICIENCY_MODE_LABELS,
  INDIVIDUAL_WEAPONS_TOGGLE_HINT,
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
  armor: z.object({
    categories: z.array(armorCategorySchema),
    items: z.array(z.string()).optional(),
  }),
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

export function refineClassArmorProficiencies(
  values: {
    armorProficiencyMode: ArmorProficiencyMode
    proficiencies: z.infer<typeof proficienciesFormSchema>
  },
  ctx: RefinementCtx,
): void {
  const { armorProficiencyMode, proficiencies } = values

  if (armorProficiencyMode === 'categories') {
    if (proficiencies.armor.categories.length === 0) {
      addCustomRefinementIssue(
        ctx,
        fieldValidationMessages.minSelections({ itemLabel: 'armor training category' }),
        ['proficiencies', 'armor', 'categories'],
      )
    }
    return
  }

  if ((proficiencies.armor.items ?? []).length === 0) {
    addCustomRefinementIssue(
      ctx,
      fieldValidationMessages.minSelections({ itemLabel: 'armor choice' }),
      ['proficiencies', 'armor', 'items'],
    )
  }
}

export function refineClassWeaponProficiencies(
  values: {
    weaponProficiencyMode: WeaponProficiencyMode
    proficiencies: z.infer<typeof proficienciesFormSchema>
  },
  ctx: RefinementCtx,
): void {
  const { weaponProficiencyMode, proficiencies } = values

  if (weaponProficiencyMode === 'categories') {
    if (proficiencies.weapons.categories.length === 0) {
      addCustomRefinementIssue(
        ctx,
        fieldValidationMessages.minSelections({ itemLabel: 'weapon proficiency' }),
        ['proficiencies', 'weapons', 'categories'],
      )
    }
    return
  }

  if ((proficiencies.weapons.items ?? []).length === 0) {
    addCustomRefinementIssue(
      ctx,
      fieldValidationMessages.minSelections({ itemLabel: 'weapon choice' }),
      ['proficiencies', 'weapons', 'items'],
    )
  }
}

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
        min: 1,
        max: 2,
        required: true,
        noun: {
          singular: 'saving throw',
          plural: 'saving throws',
        },
        separator: 'subtle',
      },
      armorProficiencyGrantSetField({
        modeFieldName: 'armorProficiencyMode',
        modes: ARMOR_PROFICIENCY_MODES,
        modeLabels: ARMOR_PROFICIENCY_MODE_LABELS,
        categoriesPath: 'proficiencies.armor.categories',
        itemsPath: 'proficiencies.armor.items',
        label: 'Armor proficiency mode',
        categoryOptions: armorCategoryOptions,
        itemOptions: referenceArmorFieldOptions(ctx.options?.equipment),
        categoriesLabel: 'Armor training',
        itemsLabel: 'Specific armor',
        categoryMode: 'categories',
        specificMode: 'specific',
        labelVisibility: 'srOnly',
        categoriesRequired: true,
        itemsRequired: true,
      }),
    ],
  }

  const weaponsGroup: FormItem = {
    kind: 'group',
    legend: 'Weapons',
    fields: [
      weaponProficiencyGrantSetField({
        modeFieldName: 'weaponProficiencyMode',
        modes: WEAPON_PROFICIENCY_MODES,
        modeLabels: WEAPON_PROFICIENCY_MODE_LABELS,
        categoriesPath: 'proficiencies.weapons.categories',
        itemsPath: 'proficiencies.weapons.items',
        label: 'Weapon proficiency mode',
        hint: { text: INDIVIDUAL_WEAPONS_TOGGLE_HINT, position: 'below-control' },
        categoryOptions: weaponCategoryOptions,
        itemOptions: referenceWeaponFieldOptions(ctx.options?.equipment),
        resolveOptionLabel: (value) =>
          resolveContentWeaponGrantOptionLabel(value, ctx.options, ctx.equipmentCatalogById),
        categoriesLabel: 'Weapon proficiencies',
        itemsLabel: 'Weapon choices',
        categoriesHint: WEAPON_PROFICIENCIES_HINT,
        categoryMode: 'categories',
        specificMode: 'specific',
        labelVisibility: 'srOnly',
        categoriesRequired: true,
        itemsRequired: true,
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
        filterSelects: [
          {
            filterKey: 'category',
            ariaLabel: 'Filter by tool category',
            options: toolCategoryOptions,
            allOptionLabel: 'All categories',
          },
        ],
        width: 'full',
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
