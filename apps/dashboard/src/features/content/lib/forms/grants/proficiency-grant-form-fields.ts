import { z } from 'zod'
import {
  ARMOR_CATEGORIES,
  ARMOR_CATEGORY_ENTRIES,
  defineMessage,
  PROFICIENCY_GRANT_KINDS,
  SKILL_IDS,
  SKILLS,
  TOOL_CATEGORIES,
  TOOL_CATEGORY_ENTRIES,
  WEAPON_CATEGORIES,
  WEAPON_CATEGORY_ENTRIES,
  armorCategorySchema,
  toolCategorySchema,
  weaponCategorySchema,
  skillSchema,
} from '@rpg/contracts'
import {
  combineFieldVisibilityAll,
  toOptions,
  type FieldVisibility,
  type FormItem,
} from '@rpg/ui/form'

import type { ContentFormCtx } from '../content-form-registry'
import {
  ARMOR_TRAINING_POOL_SOURCE_LABELS,
  PROFICIENCY_GRANT_KIND_LABELS,
  SKILL_PROFICIENCY_POOL_SOURCE_LABELS,
  TOOL_PROFICIENCY_POOL_SOURCE_LABELS,
  WEAPON_PROFICIENCY_POOL_SOURCE_LABELS,
} from './proficiency-grant-form-labels'

/** Sentinel for “any category” in filtered pool fields (Radix Select rejects `''`). */
export const PROFICIENCY_POOL_CATEGORY_ANY = '__any__' as const

export const WEAPON_PROFICIENCY_POOL_SOURCES = ['explicit', 'filtered'] as const

export const TOOL_PROFICIENCY_POOL_SOURCES = ['explicit', 'filtered', 'any'] as const

export const SKILL_PROFICIENCY_POOL_SOURCES = ['explicit', 'any'] as const

export const ARMOR_TRAINING_POOL_SOURCES = ['explicit', 'filtered'] as const

/** Proficiency grant validation messages (tier 3 form overrides). */
export const proficiencyGrantValidationMessages = {
  fixedSlugsOrCategoriesRequired: defineMessage(
    'validation.proficiencyGrant.fixedSlugsOrCategoriesRequired',
    () => 'Fixed grants require at least one specific item or category',
    () => 'Missing proficiency',
  ),
  explicitPoolSlugsRequired: defineMessage(
    'validation.proficiencyGrant.explicitPoolSlugsRequired',
    () => 'Specific lists require at least one item',
    () => 'Missing pool items',
  ),
  explicitSkillPoolRequired: defineMessage(
    'validation.proficiencyGrant.explicitSkillPoolRequired',
    () => 'Selected skill lists require at least one skill',
    () => 'Missing skills',
  ),
  fixedSkillIdsRequired: defineMessage(
    'validation.proficiencyGrant.fixedSkillIdsRequired',
    () => 'Specific skill grants require at least one skill',
    () => 'Missing skills',
  ),
}

const proficiencyKindOptions = toOptions(PROFICIENCY_GRANT_KINDS, PROFICIENCY_GRANT_KIND_LABELS)

const weaponPoolSourceOptions = toOptions(
  WEAPON_PROFICIENCY_POOL_SOURCES,
  WEAPON_PROFICIENCY_POOL_SOURCE_LABELS,
)

const toolPoolSourceOptions = toOptions(
  TOOL_PROFICIENCY_POOL_SOURCES,
  TOOL_PROFICIENCY_POOL_SOURCE_LABELS,
)

const skillPoolSourceOptions = toOptions(
  SKILL_PROFICIENCY_POOL_SOURCES,
  SKILL_PROFICIENCY_POOL_SOURCE_LABELS,
)

const armorPoolSourceOptions = toOptions(
  ARMOR_TRAINING_POOL_SOURCES,
  ARMOR_TRAINING_POOL_SOURCE_LABELS,
)

const skillOptions = toOptions(SKILL_IDS, SKILLS as Record<(typeof SKILL_IDS)[number], string>)

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

function refineFixedSlugsOrCategories(
  row: { slugs?: string[]; categories?: string[] },
  ctx: z.RefinementCtx,
  slugPath: string,
): void {
  const hasSlugs = (row.slugs?.length ?? 0) > 0
  const hasCategories = (row.categories?.length ?? 0) > 0
  if (!hasSlugs && !hasCategories) {
    ctx.addIssue({
      code: 'custom',
      message: proficiencyGrantValidationMessages.fixedSlugsOrCategoriesRequired(),
      path: [slugPath],
    })
  }
}

function withGuard(
  visibility: FieldVisibility | undefined,
  guard?: FieldVisibility,
): FieldVisibility | undefined {
  if (!guard) return visibility
  if (!visibility) return guard
  return combineFieldVisibilityAll(guard, visibility)
}

function visibleForItemKind(
  itemKind: (typeof PROFICIENCY_GRANT_KINDS)[number],
  guard?: FieldVisibility,
): FieldVisibility {
  return withGuard(
    {
      dependsOn: ['itemKind'],
      visibleWhen: (watched) => watched['itemKind'] === itemKind,
    },
    guard,
  )!
}

function visibleForPoolSource(poolSource: string, guard?: FieldVisibility): FieldVisibility {
  return withGuard(
    {
      dependsOn: ['itemKind', 'poolSource'],
      visibleWhen: (watched) =>
        watched['itemKind'] === 'choice' && watched['poolSource'] === poolSource,
    },
    guard,
  )!
}

// --- Weapon -----------------------------------------------------------------

export const weaponProficiencyFixedFormSchema = z
  .object({
    itemKind: z.literal('fixed'),
    weaponProficiencySlugs: z.array(z.string().min(1)).optional(),
    weaponProficiencyCategories: z.array(weaponCategorySchema).optional(),
  })
  .superRefine((row, ctx) => {
    refineFixedSlugsOrCategories(
      { slugs: row.weaponProficiencySlugs, categories: row.weaponProficiencyCategories },
      ctx,
      'weaponProficiencySlugs',
    )
  })

export const weaponProficiencyChoiceFormSchema = z
  .object({
    itemKind: z.literal('choice'),
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

export const weaponProficiencyItemFormSchema = z.discriminatedUnion('itemKind', [
  weaponProficiencyFixedFormSchema,
  weaponProficiencyChoiceFormSchema,
])

export type WeaponProficiencyItemForm = z.infer<typeof weaponProficiencyItemFormSchema>

function fixedWeaponProficiencyFields(ctx: ContentFormCtx, guard?: FieldVisibility): FormItem[] {
  const weaponOptions = ctx.options?.weapons ?? []

  return [
    {
      type: 'combobox',
      name: 'weaponProficiencySlugs',
      label: 'Weapons',
      multiple: true,
      options: weaponOptions,
      placeholder: 'Choose weapons…',
      visibility: visibleForItemKind('fixed', guard),
      width: 'full',
    },
    {
      type: 'chips',
      name: 'weaponProficiencyCategories',
      label: 'Weapon categories',
      options: weaponCategoryOptions,
      visibility: visibleForItemKind('fixed', guard),
    },
  ]
}

function weaponProficiencyChoiceFields(ctx: ContentFormCtx, guard?: FieldVisibility): FormItem[] {
  const weaponOptions = ctx.options?.weapons ?? []

  return [
    {
      type: 'inlineSentence',
      name: 'choose',
      label: '',
      hideLabel: true,
      visibility: visibleForItemKind('choice', guard),
      segments: [
        { kind: 'text', value: 'Character chooses', tone: 'label' },
        {
          kind: 'number',
          name: 'choose',
          min: 1,
          digits: 1,
          defaultValue: 1,
        },
        { kind: 'text', value: 'from', tone: 'label' },
        {
          kind: 'select',
          name: 'poolSource',
          options: weaponPoolSourceOptions,
          width: 'lg',
          defaultValue: 'filtered',
          ariaLabel: 'Pool source',
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

// --- Tool -------------------------------------------------------------------

export const toolProficiencyFixedFormSchema = z
  .object({
    itemKind: z.literal('fixed'),
    toolProficiencySlugs: z.array(z.string().min(1)).optional(),
    toolProficiencyCategories: z.array(toolCategorySchema).optional(),
  })
  .superRefine((row, ctx) => {
    refineFixedSlugsOrCategories(
      { slugs: row.toolProficiencySlugs, categories: row.toolProficiencyCategories },
      ctx,
      'toolProficiencySlugs',
    )
  })

export const toolProficiencyChoiceFormSchema = z
  .object({
    itemKind: z.literal('choice'),
    choose: z.coerce.number().int().min(1).default(1),
    poolSource: z.enum(TOOL_PROFICIENCY_POOL_SOURCES).default('filtered'),
    toolProficiencyPoolSlugs: z.array(z.string().min(1)).optional(),
    toolProficiencyPoolCategory: z
      .union([toolCategorySchema, z.literal(PROFICIENCY_POOL_CATEGORY_ANY)])
      .optional(),
  })
  .superRefine((row, ctx) => {
    if (row.poolSource === 'explicit' && !row.toolProficiencyPoolSlugs?.length) {
      ctx.addIssue({
        code: 'custom',
        message: proficiencyGrantValidationMessages.explicitPoolSlugsRequired(),
        path: ['toolProficiencyPoolSlugs'],
      })
    }
  })

export const toolProficiencyItemFormSchema = z.discriminatedUnion('itemKind', [
  toolProficiencyFixedFormSchema,
  toolProficiencyChoiceFormSchema,
])

export type ToolProficiencyItemForm = z.infer<typeof toolProficiencyItemFormSchema>

function fixedToolProficiencyFields(ctx: ContentFormCtx, guard?: FieldVisibility): FormItem[] {
  const toolOptions = ctx.options?.tools ?? []

  return [
    {
      type: 'combobox',
      name: 'toolProficiencySlugs',
      label: 'Tools',
      multiple: true,
      options: toolOptions,
      placeholder: 'Choose tools…',
      visibility: visibleForItemKind('fixed', guard),
      width: 'full',
    },
    {
      type: 'chips',
      name: 'toolProficiencyCategories',
      label: 'Tool categories',
      options: toolCategoryOptions,
      visibility: visibleForItemKind('fixed', guard),
    },
  ]
}

function toolProficiencyChoiceFields(ctx: ContentFormCtx, guard?: FieldVisibility): FormItem[] {
  const toolOptions = ctx.options?.tools ?? []

  return [
    {
      type: 'inlineSentence',
      name: 'choose',
      label: '',
      hideLabel: true,
      visibility: visibleForItemKind('choice', guard),
      segments: [
        { kind: 'text', value: 'Character chooses', tone: 'label' },
        {
          kind: 'number',
          name: 'choose',
          min: 1,
          digits: 1,
          defaultValue: 1,
        },
        { kind: 'text', value: 'from', tone: 'label' },
        {
          kind: 'select',
          name: 'poolSource',
          options: toolPoolSourceOptions,
          width: 'lg',
          defaultValue: 'filtered',
          ariaLabel: 'Pool source',
        },
      ],
    },
    {
      type: 'combobox',
      name: 'toolProficiencyPoolSlugs',
      label: 'Tools',
      multiple: true,
      options: toolOptions,
      placeholder: 'Choose tools…',
      visibility: visibleForPoolSource('explicit', guard),
    },
    {
      type: 'select',
      name: 'toolProficiencyPoolCategory',
      label: 'Tool category',
      options: categoryOptionsWithAny(toolCategoryOptions),
      defaultValue: PROFICIENCY_POOL_CATEGORY_ANY,
      visibility: visibleForPoolSource('filtered', guard),
      width: 'lg',
    },
  ]
}

// --- Skill ------------------------------------------------------------------

export const skillProficiencyFixedFormSchema = z
  .object({
    itemKind: z.literal('fixed'),
    skillProficiencyIds: z.array(skillSchema).min(1),
  })
  .superRefine((row, ctx) => {
    if (!row.skillProficiencyIds.length) {
      ctx.addIssue({
        code: 'custom',
        message: proficiencyGrantValidationMessages.fixedSkillIdsRequired(),
        path: ['skillProficiencyIds'],
      })
    }
  })

export const skillProficiencyChoiceFormSchema = z
  .object({
    itemKind: z.literal('choice'),
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

export const skillProficiencyItemFormSchema = z.discriminatedUnion('itemKind', [
  skillProficiencyFixedFormSchema,
  skillProficiencyChoiceFormSchema,
])

export type SkillProficiencyItemForm = z.infer<typeof skillProficiencyItemFormSchema>

function fixedSkillProficiencyFields(guard?: FieldVisibility): FormItem[] {
  return [
    {
      type: 'chips',
      name: 'skillProficiencyIds',
      label: 'Skills',
      options: skillOptions,
      required: true,
      visibility: visibleForItemKind('fixed', guard),
    },
  ]
}

function skillProficiencyChoiceFields(guard?: FieldVisibility): FormItem[] {
  return [
    {
      type: 'inlineSentence',
      name: 'choose',
      label: '',
      hideLabel: true,
      visibility: visibleForItemKind('choice', guard),
      segments: [
        { kind: 'text', value: 'Character chooses', tone: 'label' },
        {
          kind: 'number',
          name: 'choose',
          min: 1,
          digits: 1,
          defaultValue: 1,
        },
        { kind: 'text', value: 'from', tone: 'label' },
        {
          kind: 'select',
          name: 'poolSource',
          options: skillPoolSourceOptions,
          width: 'lg',
          defaultValue: 'explicit',
          ariaLabel: 'Pool source',
        },
      ],
    },
    {
      type: 'chips',
      name: 'skillProficiencyPoolIds',
      label: 'Skills',
      options: skillOptions,
      visibility: visibleForPoolSource('explicit', guard),
    },
  ]
}

// --- Armor training ---------------------------------------------------------

export const armorTrainingFixedFormSchema = z
  .object({
    itemKind: z.literal('fixed'),
    armorTrainingSlugs: z.array(z.string().min(1)).optional(),
    armorTrainingCategories: z.array(armorCategorySchema).optional(),
  })
  .superRefine((row, ctx) => {
    refineFixedSlugsOrCategories(
      { slugs: row.armorTrainingSlugs, categories: row.armorTrainingCategories },
      ctx,
      'armorTrainingSlugs',
    )
  })

export const armorTrainingChoiceFormSchema = z
  .object({
    itemKind: z.literal('choice'),
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

export const armorTrainingItemFormSchema = z.discriminatedUnion('itemKind', [
  armorTrainingFixedFormSchema,
  armorTrainingChoiceFormSchema,
])

export type ArmorTrainingItemForm = z.infer<typeof armorTrainingItemFormSchema>

function fixedArmorTrainingFields(ctx: ContentFormCtx, guard?: FieldVisibility): FormItem[] {
  const armorOptions = ctx.options?.armor ?? []

  return [
    {
      type: 'combobox',
      name: 'armorTrainingSlugs',
      label: 'Armor',
      multiple: true,
      options: armorOptions,
      placeholder: 'Choose armor…',
      visibility: visibleForItemKind('fixed', guard),
      width: 'full',
    },
    {
      type: 'chips',
      name: 'armorTrainingCategories',
      label: 'Armor categories',
      options: armorCategoryOptions,
      visibility: visibleForItemKind('fixed', guard),
    },
  ]
}

function armorTrainingChoiceFields(ctx: ContentFormCtx, guard?: FieldVisibility): FormItem[] {
  const armorOptions = ctx.options?.armor ?? []

  return [
    {
      type: 'inlineSentence',
      name: 'choose',
      label: '',
      hideLabel: true,
      visibility: visibleForItemKind('choice', guard),
      segments: [
        { kind: 'text', value: 'Character chooses', tone: 'label' },
        {
          kind: 'number',
          name: 'choose',
          min: 1,
          digits: 1,
          defaultValue: 1,
        },
        { kind: 'text', value: 'from', tone: 'label' },
        {
          kind: 'select',
          name: 'poolSource',
          options: armorPoolSourceOptions,
          width: 'lg',
          defaultValue: 'filtered',
          ariaLabel: 'Pool source',
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

// --- Composed field builders ------------------------------------------------

export type ProficiencyGrantType =
  | 'weaponProficiency'
  | 'toolProficiency'
  | 'skillProficiency'
  | 'armorTraining'

export type ProficiencyGrantItemFieldsOptions = {
  /** Override the item-kind select label (e.g. when composed inside the grants array). */
  kindSelectLabel?: string
  /** AND-combined visibility guard applied to every proficiency grant field. */
  guardVisibility?: FieldVisibility
}

function proficiencyItemKindField(opts: ProficiencyGrantItemFieldsOptions): FormItem {
  return {
    type: 'select',
    name: 'itemKind',
    label: opts.kindSelectLabel ?? 'Grant type',
    options: proficiencyKindOptions,
    required: true,
    defaultValue: 'fixed',
    visibility: opts.guardVisibility,
    width: '1/2',
  }
}

export function weaponProficiencyGrantItemFields(
  ctx: ContentFormCtx,
  opts: ProficiencyGrantItemFieldsOptions = {},
): FormItem[] {
  const guard = opts.guardVisibility
  return [
    proficiencyItemKindField(opts),
    ...fixedWeaponProficiencyFields(ctx, guard),
    ...weaponProficiencyChoiceFields(ctx, guard),
  ]
}

export function toolProficiencyGrantItemFields(
  ctx: ContentFormCtx,
  opts: ProficiencyGrantItemFieldsOptions = {},
): FormItem[] {
  const guard = opts.guardVisibility
  return [
    proficiencyItemKindField(opts),
    ...fixedToolProficiencyFields(ctx, guard),
    ...toolProficiencyChoiceFields(ctx, guard),
  ]
}

export function skillProficiencyGrantItemFields(
  _ctx: ContentFormCtx,
  opts: ProficiencyGrantItemFieldsOptions = {},
): FormItem[] {
  const guard = opts.guardVisibility
  return [
    proficiencyItemKindField(opts),
    ...fixedSkillProficiencyFields(guard),
    ...skillProficiencyChoiceFields(guard),
  ]
}

export function armorTrainingGrantItemFields(
  ctx: ContentFormCtx,
  opts: ProficiencyGrantItemFieldsOptions = {},
): FormItem[] {
  const guard = opts.guardVisibility
  return [
    proficiencyItemKindField(opts),
    ...fixedArmorTrainingFields(ctx, guard),
    ...armorTrainingChoiceFields(ctx, guard),
  ]
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
