import { TOOL_CATEGORIES, TOOL_CATEGORY_ENTRIES } from '@rpg/contracts'
import {
  combineFieldVisibilityAll,
  toOptions,
  type FieldVisibility,
  type FormItem,
} from '@rpg/ui/form'

import type { ContentFormCtx } from '../../registry/content-form-registry'
import { referenceToolFieldOptions } from '../../../form-options/content-field-option.lib'
import { TOOL_PROFICIENCY_POOL_KIND_LABELS } from './proficiency-grant-form-labels'

export const TOOL_PROFICIENCY_POOL_SOURCES = ['explicit', 'filtered', 'any'] as const

const toolPoolKindOptions = toOptions(
  TOOL_PROFICIENCY_POOL_SOURCES,
  TOOL_PROFICIENCY_POOL_KIND_LABELS,
)

const toolCategoryOptions = toOptions(
  TOOL_CATEGORIES,
  Object.fromEntries(
    TOOL_CATEGORIES.map((category) => [category, TOOL_CATEGORY_ENTRIES[category].label]),
  ) as Record<(typeof TOOL_CATEGORIES)[number], string>,
)

export type ToolProficiencyPoolFieldNames = {
  choose: string
  poolSource: string
  poolSlugs: string
  poolCategories: string
  poolFilteredSlugs: string
}

export const GRANT_TOOL_PROFICIENCY_POOL_FIELD_NAMES = {
  choose: 'choose',
  poolSource: 'poolSource',
  poolSlugs: 'toolProficiencyPoolSlugs',
  poolCategories: 'toolProficiencyPoolCategories',
  poolFilteredSlugs: 'toolProficiencyPoolFilteredToolSlugs',
} as const satisfies ToolProficiencyPoolFieldNames

export const CHARACTER_CREATION_TOOL_POOL_FIELD_NAMES = {
  choose: 'characterCreation.proficiencies.tools.choose',
  poolSource: 'characterCreation.proficiencies.tools.poolSource',
  poolSlugs: 'characterCreation.proficiencies.tools.poolToolSlugs',
  poolCategories: 'characterCreation.proficiencies.tools.poolToolCategories',
  poolFilteredSlugs: 'characterCreation.proficiencies.tools.poolFilteredToolSlugs',
} as const satisfies ToolProficiencyPoolFieldNames

type ToolProficiencyPoolFieldsOptions = {
  names: ToolProficiencyPoolFieldNames
  guard?: FieldVisibility
  proficiencySourceGuard?: FieldVisibility
  chooseMin?: number
  chooseDefault?: number
  chooseDigits?: 1 | 2 | 3 | 4 | 5
  sentenceName?: string
}

function withGuard(
  visibility: FieldVisibility | undefined,
  guard?: FieldVisibility,
): FieldVisibility | undefined {
  if (!guard) return visibility
  if (!visibility) return guard
  return combineFieldVisibilityAll(guard, visibility)
}

function visibleForPoolSource(
  names: ToolProficiencyPoolFieldNames,
  poolSource: string,
  guard?: FieldVisibility,
  proficiencySourceGuard?: FieldVisibility,
): FieldVisibility {
  const dependsOn = proficiencySourceGuard
    ? ['proficiencySource', names.poolSource]
    : [names.poolSource]

  return withGuard(
    {
      dependsOn,
      visibleWhen: (watched) => {
        if (proficiencySourceGuard) {
          const sourceVisible = proficiencySourceGuard.visibleWhen?.(watched) ?? true
          if (!sourceVisible) return false
        }
        return watched[names.poolSource] === poolSource
      },
    },
    guard,
  )!
}

/** Shared pool-source UI for grant and character-creation tool proficiency choices. */
export function toolProficiencyPoolFormFields(
  ctx: ContentFormCtx,
  options: ToolProficiencyPoolFieldsOptions,
): FormItem[] {
  const {
    names,
    guard,
    proficiencySourceGuard,
    chooseMin = 1,
    chooseDefault = 1,
    chooseDigits = 1,
    sentenceName = names.choose,
  } = options
  const toolOptions = referenceToolFieldOptions(ctx.options?.equipment)

  const poolVisibility = proficiencySourceGuard ? withGuard(proficiencySourceGuard, guard) : guard

  return [
    {
      type: 'inlineSentence',
      name: sentenceName,
      label: 'Tool proficiency pool choice',
      labelVisibility: 'srOnly',
      visibility: poolVisibility,
      segments: [
        { kind: 'text', value: 'Character chooses', tone: 'label' },
        {
          kind: 'number',
          name: names.choose,
          min: chooseMin,
          digits: chooseDigits,
          defaultValue: chooseDefault,
        },
        { kind: 'text', value: 'proficiency from', tone: 'label' },
        {
          kind: 'select',
          name: names.poolSource,
          options: toolPoolKindOptions,
          width: 'lg',
          defaultValue: 'filtered',
          ariaLabel: 'Pool kind',
        },
      ],
    },
    {
      type: 'combobox',
      name: names.poolSlugs,
      label: 'Tools',
      multiple: true,
      options: toolOptions,
      placeholder: 'Choose tools…',
      required: true,
      visibility: visibleForPoolSource(names, 'explicit', guard, proficiencySourceGuard),
    },
    {
      type: 'chips',
      name: names.poolCategories,
      label: 'Tool categories',
      options: toolCategoryOptions,
      required: true,
      visibility: visibleForPoolSource(names, 'filtered', guard, proficiencySourceGuard),
    },
    {
      type: 'combobox',
      name: names.poolFilteredSlugs,
      label: 'Additional tools',
      multiple: true,
      options: toolOptions,
      placeholder: 'Add specific tools…',
      visibility: visibleForPoolSource(names, 'filtered', guard, proficiencySourceGuard),
    },
  ]
}
