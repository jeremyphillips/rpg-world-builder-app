import { z } from 'zod'
import {
  ARMOR_CATEGORIES,
  ARMOR_CATEGORY_ENTRIES,
  defineMessage,
  TOOL_CATEGORIES,
  TOOL_CATEGORY_ENTRIES,
  WEAPON_CATEGORIES,
  WEAPON_CATEGORY_ENTRIES,
  armorCategorySchema,
  toolCategorySchema,
  weaponCategorySchema,
  skillSchema,
  getProficiencyDomainCompactLabel,
} from '@rpg/contracts'
import {
  combineFieldVisibilityAll,
  toOptions,
  type FieldVisibility,
  type FormItem,
} from '@rpg/ui/form'

import type { ContentFormCtx } from '../content-form-registry'
import {
  referenceArmorFieldOptions,
  referenceSkillFieldOptions,
  referenceToolFieldOptions,
  referenceWeaponFieldOptions,
} from '../../form-options/content-field-option.lib'
import { refineToolProficiencyPoolFormRow } from '../tool-proficiency-pool-form-validation'
import {
  GRANT_TOOL_PROFICIENCY_POOL_FIELD_NAMES,
  toolProficiencyPoolFormFields,
} from '../tool-proficiency-pool-form-fields'
import {
  ARMOR_TRAINING_POOL_KIND_LABELS,
  ARMOR_TRAINING_SOURCE_LABELS,
  SKILL_PROFICIENCY_POOL_KIND_LABELS,
  SKILL_PROFICIENCY_SOURCE_LABELS,
  TOOL_PROFICIENCY_SOURCE_LABELS,
  WEAPON_PROFICIENCY_POOL_KIND_LABELS,
  WEAPON_PROFICIENCY_SOURCE_LABELS,
} from './proficiency-grant-form-labels'

/** Sentinel for “any category” in filtered pool fields (Radix Select rejects `''`). */
export const PROFICIENCY_POOL_CATEGORY_ANY = '__any__' as const

/** React keys for co-located pool inline sentences (outer `name`; segments still bind `choose`). */
export const WEAPON_PROFICIENCY_POOL_SENTENCE_FIELD_NAME = 'weaponProficiencyPoolSentence' as const
export const TOOL_PROFICIENCY_POOL_SENTENCE_FIELD_NAME = 'toolProficiencyPoolSentence' as const
export const SKILL_PROFICIENCY_POOL_SENTENCE_FIELD_NAME = 'skillProficiencyPoolSentence' as const
export const ARMOR_TRAINING_POOL_SENTENCE_FIELD_NAME = 'armorTrainingPoolSentence' as const

export const WEAPON_PROFICIENCY_SOURCES = ['specific', 'category', 'pool'] as const
export const TOOL_PROFICIENCY_SOURCES = ['specific', 'category', 'pool'] as const
export const SKILL_PROFICIENCY_SOURCES = ['specific', 'pool'] as const
export const ARMOR_TRAINING_SOURCES = ['specific', 'category', 'pool'] as const

export const WEAPON_PROFICIENCY_POOL_SOURCES = ['explicit', 'filtered'] as const
export const TOOL_PROFICIENCY_POOL_SOURCES = ['explicit', 'filtered', 'any'] as const
export const SKILL_PROFICIENCY_POOL_SOURCES = ['explicit', 'any'] as const
export const ARMOR_TRAINING_POOL_SOURCES = ['explicit', 'filtered'] as const

/** Proficiency grant validation messages (tier 3 form overrides). */
export const proficiencyGrantValidationMessages = {
  explicitPoolSlugsRequired: defineMessage(
    'validation.proficiencyGrant.explicitPoolSlugsRequired',
    () => 'Specific lists require at least one item.',
    () => 'Missing pool items',
  ),
  filteredPoolCategoriesRequired: defineMessage(
    'validation.proficiencyGrant.filteredPoolCategoriesRequired',
    () => 'Filtered pools require at least one category or specific tool.',
    () => 'Missing pool categories',
  ),
  explicitSkillPoolRequired: defineMessage(
    'validation.proficiencyGrant.explicitSkillPoolRequired',
    () => 'Selected skill lists require at least one skill.',
    () => 'Missing skills',
  ),
}

const weaponSourceOptions = toOptions(WEAPON_PROFICIENCY_SOURCES, WEAPON_PROFICIENCY_SOURCE_LABELS)
const toolSourceOptions = toOptions(TOOL_PROFICIENCY_SOURCES, TOOL_PROFICIENCY_SOURCE_LABELS)
const skillSourceOptions = toOptions(SKILL_PROFICIENCY_SOURCES, SKILL_PROFICIENCY_SOURCE_LABELS)
const armorSourceOptions = toOptions(ARMOR_TRAINING_SOURCES, ARMOR_TRAINING_SOURCE_LABELS)

const weaponPoolKindOptions = toOptions(
  WEAPON_PROFICIENCY_POOL_SOURCES,
  WEAPON_PROFICIENCY_POOL_KIND_LABELS,
)
const skillPoolKindOptions = toOptions(
  SKILL_PROFICIENCY_POOL_SOURCES,
  SKILL_PROFICIENCY_POOL_KIND_LABELS,
)
const armorPoolKindOptions = toOptions(ARMOR_TRAINING_POOL_SOURCES, ARMOR_TRAINING_POOL_KIND_LABELS)

const weaponCategoryOptions = toOptions(
  WEAPON_CATEGORIES,
  Object.fromEntries(
    WEAPON_CATEGORIES.map((category) => [category, WEAPON_CATEGORY_ENTRIES[category].label]),
  ) as Record<(typeof WEAPON_CATEGORIES)[number], string>,
)

const toolCategoryOptions = toOptions(
  TOOL_CATEGORIES,
  Object.fromEntries(
    TOOL_CATEGORIES.map((category) => [category, TOOL_CATEGORY_ENTRIES[category].label]),
  ) as Record<(typeof TOOL_CATEGORIES)[number], string>,
)

const armorCategoryOptions = toOptions(
  ARMOR_CATEGORIES,
  Object.fromEntries(
    ARMOR_CATEGORIES.map((category) => [category, ARMOR_CATEGORY_ENTRIES[category].label]),
  ) as Record<(typeof ARMOR_CATEGORIES)[number], string>,
)

function categoryOptionsWithAny(options: { value: string; label: string }[]) {
  return [{ value: PROFICIENCY_POOL_CATEGORY_ANY, label: 'Any' }, ...options]
}

function withGuard(
  visibility: FieldVisibility | undefined,
  guard?: FieldVisibility,
): FieldVisibility | undefined {
  if (!guard) return visibility
  if (!visibility) return guard
  return combineFieldVisibilityAll(guard, visibility)
}

function visibleForProficiencySource(source: string, guard?: FieldVisibility): FieldVisibility {
  return withGuard(
    {
      dependsOn: ['proficiencySource'],
      visibleWhen: (watched) => watched['proficiencySource'] === source,
    },
    guard,
  )!
}

function visibleForPoolSource(poolSource: string, guard?: FieldVisibility): FieldVisibility {
  return withGuard(
    {
      dependsOn: ['proficiencySource', 'poolSource'],
      visibleWhen: (watched) =>
        watched['proficiencySource'] === 'pool' && watched['poolSource'] === poolSource,
    },
    guard,
  )!
}

function proficiencySourceField(
  options: { value: string; label: string }[],
  guard?: FieldVisibility,
): FormItem {
  return {
    type: 'select',
    name: 'proficiencySource',
    label: 'Proficiency source',
    options,
    required: true,
    defaultValue: 'specific',
    visibility: guard,
    width: '1/2',
  }
}

// --- Weapon -----------------------------------------------------------------

export const weaponProficiencySpecificFormSchema = z.object({
  proficiencySource: z.literal('specific'),
  weaponProficiencySlugs: z.array(z.string().min(1)).min(1),
})

export const weaponProficiencyCategoryFormSchema = z.object({
  proficiencySource: z.literal('category'),
  weaponProficiencyCategories: z.array(weaponCategorySchema).min(1),
})

export const weaponProficiencyPoolFormSchema = z
  .object({
    proficiencySource: z.literal('pool'),
    choose: z.coerce.number().int().min(1).default(1),
    poolSource: z.enum(WEAPON_PROFICIENCY_POOL_SOURCES).default('filtered'),
    weaponProficiencyPoolSlugs: z.array(z.string().min(1)).optional(),
    weaponProficiencyPoolCategory: z
      .union([weaponCategorySchema, z.literal(PROFICIENCY_POOL_CATEGORY_ANY)])
      .optional(),
  })
  .superRefine((row, ctx) => {
    if (row.poolSource === 'explicit' && !row.weaponProficiencyPoolSlugs?.length) {
      ctx.addIssue({
        code: 'custom',
        message: proficiencyGrantValidationMessages.explicitPoolSlugsRequired(),
        path: ['weaponProficiencyPoolSlugs'],
      })
    }
  })

export const weaponProficiencyItemFormSchema = z.discriminatedUnion('proficiencySource', [
  weaponProficiencySpecificFormSchema,
  weaponProficiencyCategoryFormSchema,
  weaponProficiencyPoolFormSchema,
])

export type WeaponProficiencyItemForm = z.infer<typeof weaponProficiencyItemFormSchema>

function weaponProficiencyPoolFields(ctx: ContentFormCtx, guard?: FieldVisibility): FormItem[] {
  const weaponOptions = referenceWeaponFieldOptions(ctx.options?.equipment)

  return [
    {
      type: 'inlineSentence',
      name: WEAPON_PROFICIENCY_POOL_SENTENCE_FIELD_NAME,
      label: 'Weapon proficiency pool choice',
      labelVisibility: 'srOnly',
      visibility: visibleForProficiencySource('pool', guard),
      segments: [
        { kind: 'text', value: 'Character chooses', tone: 'label' },
        {
          kind: 'number',
          name: 'choose',
          min: 1,
          digits: 1,
          defaultValue: 1,
        },
        { kind: 'text', value: 'proficiency from', tone: 'label' },
        {
          kind: 'select',
          name: 'poolSource',
          options: weaponPoolKindOptions,
          width: 'lg',
          defaultValue: 'filtered',
          ariaLabel: 'Pool kind',
        },
      ],
    },
    {
      type: 'combobox',
      name: 'weaponProficiencyPoolSlugs',
      label: 'Weapons',
      multiple: true,
      options: weaponOptions,
      placeholder: 'Choose weapons…',
      required: true,
      visibility: visibleForPoolSource('explicit', guard),
    },
    {
      type: 'select',
      name: 'weaponProficiencyPoolCategory',
      label: 'Weapon category',
      options: categoryOptionsWithAny(weaponCategoryOptions),
      defaultValue: PROFICIENCY_POOL_CATEGORY_ANY,
      visibility: visibleForPoolSource('filtered', guard),
      width: 'lg',
    },
  ]
}

export function weaponProficiencyGrantItemFields(
  ctx: ContentFormCtx,
  opts: ProficiencyGrantItemFieldsOptions = {},
): FormItem[] {
  const guard = opts.guardVisibility
  const weaponOptions = referenceWeaponFieldOptions(ctx.options?.equipment)

  return [
    proficiencySourceField(weaponSourceOptions, guard),
    {
      type: 'combobox',
      name: 'weaponProficiencySlugs',
      label: 'Weapons',
      multiple: true,
      options: weaponOptions,
      placeholder: 'Choose weapons…',
      required: true,
      visibility: visibleForProficiencySource('specific', guard),
      width: 'full',
    },
    {
      type: 'chips',
      name: 'weaponProficiencyCategories',
      label: 'Weapon categories',
      options: weaponCategoryOptions,
      required: true,
      visibility: visibleForProficiencySource('category', guard),
    },
    ...weaponProficiencyPoolFields(ctx, guard),
  ]
}

// --- Tool -------------------------------------------------------------------

export const toolProficiencySpecificFormSchema = z.object({
  proficiencySource: z.literal('specific'),
  toolProficiencySlugs: z.array(z.string().min(1)).min(1),
})

export const toolProficiencyCategoryFormSchema = z.object({
  proficiencySource: z.literal('category'),
  toolProficiencyCategories: z.array(toolCategorySchema).min(1),
})

export const toolProficiencyPoolFormSchema = z
  .object({
    proficiencySource: z.literal('pool'),
    choose: z.coerce.number().int().min(1).default(1),
    poolSource: z.enum(TOOL_PROFICIENCY_POOL_SOURCES).default('filtered'),
    toolProficiencyPoolSlugs: z.array(z.string().min(1)).optional(),
    toolProficiencyPoolCategories: z.array(toolCategorySchema).optional(),
    toolProficiencyPoolFilteredToolSlugs: z.array(z.string().min(1)).optional(),
  })
  .superRefine((row, ctx) => {
    refineToolProficiencyPoolFormRow(row, ctx, {
      slugPath: 'toolProficiencyPoolSlugs',
      categoriesPath: 'toolProficiencyPoolCategories',
      filteredSlugsPath: 'toolProficiencyPoolFilteredToolSlugs',
    })
  })

export const toolProficiencyItemFormSchema = z.discriminatedUnion('proficiencySource', [
  toolProficiencySpecificFormSchema,
  toolProficiencyCategoryFormSchema,
  toolProficiencyPoolFormSchema,
])

export type ToolProficiencyItemForm = z.infer<typeof toolProficiencyItemFormSchema>

function toolProficiencyPoolFields(ctx: ContentFormCtx, guard?: FieldVisibility): FormItem[] {
  return toolProficiencyPoolFormFields(ctx, {
    names: GRANT_TOOL_PROFICIENCY_POOL_FIELD_NAMES,
    guard,
    proficiencySourceGuard: visibleForProficiencySource('pool', guard),
    sentenceName: TOOL_PROFICIENCY_POOL_SENTENCE_FIELD_NAME,
  })
}

export function toolProficiencyGrantItemFields(
  ctx: ContentFormCtx,
  opts: ProficiencyGrantItemFieldsOptions = {},
): FormItem[] {
  const guard = opts.guardVisibility
  const toolOptions = referenceToolFieldOptions(ctx.options?.equipment)

  return [
    proficiencySourceField(toolSourceOptions, guard),
    {
      type: 'combobox',
      name: 'toolProficiencySlugs',
      label: 'Tools',
      multiple: true,
      options: toolOptions,
      placeholder: 'Choose tools…',
      required: true,
      visibility: visibleForProficiencySource('specific', guard),
      width: 'full',
    },
    {
      type: 'chips',
      name: 'toolProficiencyCategories',
      label: 'Tool categories',
      options: toolCategoryOptions,
      required: true,
      visibility: visibleForProficiencySource('category', guard),
    },
    ...toolProficiencyPoolFields(ctx, guard),
  ]
}

// --- Skill ------------------------------------------------------------------

export const skillProficiencySpecificFormSchema = z.object({
  proficiencySource: z.literal('specific'),
  skillProficiencyIds: z.array(skillSchema).min(1),
})

export const skillProficiencyPoolFormSchema = z
  .object({
    proficiencySource: z.literal('pool'),
    choose: z.coerce.number().int().min(1).default(1),
    poolSource: z.enum(SKILL_PROFICIENCY_POOL_SOURCES).default('explicit'),
    skillProficiencyPoolIds: z.array(skillSchema).optional(),
  })
  .superRefine((row, ctx) => {
    if (row.poolSource === 'explicit' && !row.skillProficiencyPoolIds?.length) {
      ctx.addIssue({
        code: 'custom',
        message: proficiencyGrantValidationMessages.explicitSkillPoolRequired(),
        path: ['skillProficiencyPoolIds'],
      })
    }
  })

export const skillProficiencyItemFormSchema = z.discriminatedUnion('proficiencySource', [
  skillProficiencySpecificFormSchema,
  skillProficiencyPoolFormSchema,
])

export type SkillProficiencyItemForm = z.infer<typeof skillProficiencyItemFormSchema>

function skillProficiencyPoolFields(ctx: ContentFormCtx, guard?: FieldVisibility): FormItem[] {
  const skillOptions = referenceSkillFieldOptions(ctx.options?.skills)

  return [
    {
      type: 'inlineSentence',
      name: SKILL_PROFICIENCY_POOL_SENTENCE_FIELD_NAME,
      label: 'Skill proficiency pool choice',
      labelVisibility: 'srOnly',
      visibility: visibleForProficiencySource('pool', guard),
      segments: [
        { kind: 'text', value: 'Character chooses', tone: 'label' },
        {
          kind: 'number',
          name: 'choose',
          min: 1,
          digits: 1,
          defaultValue: 1,
        },
        { kind: 'text', value: 'proficiency from', tone: 'label' },
        {
          kind: 'select',
          name: 'poolSource',
          options: skillPoolKindOptions,
          width: 'lg',
          defaultValue: 'explicit',
          ariaLabel: 'Pool kind',
        },
      ],
    },
    {
      type: 'chips',
      name: 'skillProficiencyPoolIds',
      label: getProficiencyDomainCompactLabel('skill'),
      options: skillOptions,
      required: true,
      visibility: visibleForPoolSource('explicit', guard),
    },
  ]
}

export function skillProficiencyGrantItemFields(
  ctx: ContentFormCtx,
  opts: ProficiencyGrantItemFieldsOptions = {},
): FormItem[] {
  const guard = opts.guardVisibility
  const skillOptions = referenceSkillFieldOptions(ctx.options?.skills)

  return [
    proficiencySourceField(skillSourceOptions, guard),
    {
      type: 'chips',
      name: 'skillProficiencyIds',
      label: getProficiencyDomainCompactLabel('skill'),
      options: skillOptions,
      required: true,
      visibility: visibleForProficiencySource('specific', guard),
    },
    ...skillProficiencyPoolFields(ctx, guard),
  ]
}

// --- Armor training ---------------------------------------------------------

export const armorTrainingSpecificFormSchema = z.object({
  proficiencySource: z.literal('specific'),
  armorTrainingSlugs: z.array(z.string().min(1)).min(1),
})

export const armorTrainingCategoryFormSchema = z.object({
  proficiencySource: z.literal('category'),
  armorTrainingCategories: z.array(armorCategorySchema).min(1),
})

export const armorTrainingPoolFormSchema = z
  .object({
    proficiencySource: z.literal('pool'),
    choose: z.coerce.number().int().min(1).default(1),
    poolSource: z.enum(ARMOR_TRAINING_POOL_SOURCES).default('filtered'),
    armorTrainingPoolSlugs: z.array(z.string().min(1)).optional(),
    armorTrainingPoolCategory: z
      .union([armorCategorySchema, z.literal(PROFICIENCY_POOL_CATEGORY_ANY)])
      .optional(),
  })
  .superRefine((row, ctx) => {
    if (row.poolSource === 'explicit' && !row.armorTrainingPoolSlugs?.length) {
      ctx.addIssue({
        code: 'custom',
        message: proficiencyGrantValidationMessages.explicitPoolSlugsRequired(),
        path: ['armorTrainingPoolSlugs'],
      })
    }
  })

export const armorTrainingItemFormSchema = z.discriminatedUnion('proficiencySource', [
  armorTrainingSpecificFormSchema,
  armorTrainingCategoryFormSchema,
  armorTrainingPoolFormSchema,
])

export type ArmorTrainingItemForm = z.infer<typeof armorTrainingItemFormSchema>

function armorTrainingPoolFields(ctx: ContentFormCtx, guard?: FieldVisibility): FormItem[] {
  const armorOptions = referenceArmorFieldOptions(ctx.options?.equipment)

  return [
    {
      type: 'inlineSentence',
      name: ARMOR_TRAINING_POOL_SENTENCE_FIELD_NAME,
      label: 'Armor training pool choice',
      labelVisibility: 'srOnly',
      visibility: visibleForProficiencySource('pool', guard),
      segments: [
        { kind: 'text', value: 'Character chooses', tone: 'label' },
        {
          kind: 'number',
          name: 'choose',
          min: 1,
          digits: 1,
          defaultValue: 1,
        },
        { kind: 'text', value: 'training from', tone: 'label' },
        {
          kind: 'select',
          name: 'poolSource',
          options: armorPoolKindOptions,
          width: 'lg',
          defaultValue: 'filtered',
          ariaLabel: 'Pool kind',
        },
      ],
    },
    {
      type: 'combobox',
      name: 'armorTrainingPoolSlugs',
      label: 'Armor',
      multiple: true,
      options: armorOptions,
      placeholder: 'Choose armor…',
      required: true,
      visibility: visibleForPoolSource('explicit', guard),
    },
    {
      type: 'select',
      name: 'armorTrainingPoolCategory',
      label: 'Armor category',
      options: categoryOptionsWithAny(armorCategoryOptions),
      defaultValue: PROFICIENCY_POOL_CATEGORY_ANY,
      visibility: visibleForPoolSource('filtered', guard),
      width: 'lg',
    },
  ]
}

export function armorTrainingGrantItemFields(
  ctx: ContentFormCtx,
  opts: ProficiencyGrantItemFieldsOptions = {},
): FormItem[] {
  const guard = opts.guardVisibility
  const armorOptions = referenceArmorFieldOptions(ctx.options?.equipment)

  return [
    proficiencySourceField(armorSourceOptions, guard),
    {
      type: 'combobox',
      name: 'armorTrainingSlugs',
      label: 'Armor',
      multiple: true,
      options: armorOptions,
      placeholder: 'Choose armor…',
      required: true,
      visibility: visibleForProficiencySource('specific', guard),
      width: 'full',
    },
    {
      type: 'chips',
      name: 'armorTrainingCategories',
      label: 'Armor categories',
      options: armorCategoryOptions,
      required: true,
      visibility: visibleForProficiencySource('category', guard),
    },
    ...armorTrainingPoolFields(ctx, guard),
  ]
}

// --- Composed field builders ------------------------------------------------

export type ProficiencyGrantType =
  | 'weaponProficiency'
  | 'toolProficiency'
  | 'skillProficiency'
  | 'armorTraining'

export type ProficiencyGrantItemFieldsOptions = {
  /** AND-combined visibility guard applied to every proficiency grant field. */
  guardVisibility?: FieldVisibility
}

export function proficiencyGrantItemFields(
  grantType: ProficiencyGrantType,
  ctx: ContentFormCtx,
  opts: ProficiencyGrantItemFieldsOptions = {},
): FormItem[] {
  switch (grantType) {
    case 'weaponProficiency':
      return weaponProficiencyGrantItemFields(ctx, opts)
    case 'toolProficiency':
      return toolProficiencyGrantItemFields(ctx, opts)
    case 'skillProficiency':
      return skillProficiencyGrantItemFields(ctx, opts)
    case 'armorTraining':
      return armorTrainingGrantItemFields(ctx, opts)
  }
}

// Back-compat aliases for tests importing choice schemas by old names.
export const weaponProficiencyChoiceFormSchema = weaponProficiencyPoolFormSchema
export const toolProficiencyChoiceFormSchema = toolProficiencyPoolFormSchema
export const skillProficiencyChoiceFormSchema = skillProficiencyPoolFormSchema
export const armorTrainingChoiceFormSchema = armorTrainingPoolFormSchema
