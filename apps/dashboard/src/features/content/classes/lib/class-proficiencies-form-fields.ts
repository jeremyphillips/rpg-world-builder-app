import { z } from 'zod'
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
  armorCategorySchema,
  skillSchema,
  toolCategorySchema,
  weaponCategorySchema,
} from '@rpg/contracts'
import { toOptions, type FieldVisibility, type FormItem } from '@rpg/ui/form'

import type { ContentFormCtx } from '../../lib/forms/content-form-registry'
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

const WEAPON_PROFICIENCY_MODE_OPTIONS = toOptions(
  WEAPON_PROFICIENCY_MODES,
  WEAPON_PROFICIENCY_MODE_LABELS,
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

function visibleWhenWeaponCategories(): FieldVisibility {
  return {
    dependsOn: ['weaponProficiencyMode'],
    visibleWhen: (watched) => watched['weaponProficiencyMode'] === 'categories',
  }
}

function visibleWhenIndividualWeapons(): FieldVisibility {
  return {
    dependsOn: ['weaponProficiencyMode'],
    visibleWhen: (watched) => watched['weaponProficiencyMode'] === 'individual',
  }
}

export function proficienciesFields(ctx: ContentFormCtx): FormItem[] {
  const skillOptions = ctx.options?.skills ?? []

  return [
    {
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
        },
        {
          type: 'chips',
          name: 'proficiencies.armor',
          label: 'Armor training',
          options: armorCategoryOptions,
        },
      ],
    },
    {
      kind: 'group',
      legend: 'Weapons',
      fields: [
        {
          type: 'radio',
          name: 'weaponProficiencyMode',
          label: 'Weapon proficiency mode',
          labelHidden: true,
          hintPosition: 'below-control',
          orientation: 'horizontal',
          options: WEAPON_PROFICIENCY_MODE_OPTIONS,
          hint: INDIVIDUAL_WEAPONS_TOGGLE_HINT,
        },
        {
          type: 'chips',
          name: 'proficiencies.weapons.categories',
          label: 'Weapon proficiencies',
          options: weaponCategoryOptions,
          hint: WEAPON_PROFICIENCIES_HINT,
          visibility: visibleWhenWeaponCategories(),
        },
        {
          type: 'combobox',
          name: 'proficiencies.weapons.items',
          label: 'Weapon choices',
          multiple: true,
          options: ctx.options?.weapons ?? [],
          placeholder: 'Choose weapons…',
          visibility: visibleWhenIndividualWeapons(),
          width: 'xl',
        },
      ],
    },
    {
      kind: 'group',
      legend: 'Granted skills & tools',
      fields: [
        {
          type: 'chips',
          name: 'proficiencies.skills.items',
          label: 'Granted skill proficiencies',
          options: skillOptions,
        },
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
          options: ctx.options?.tools ?? [],
          placeholder: 'Choose tools…',
          width: 'xl',
        },
      ],
    },
  ]
}
