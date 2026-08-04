import type { GeneratedName, NameGenderStyle, NameSubjectKind } from '@rpg/contracts/name-generator'
import type { NamingConvention } from '@rpg/contracts/name-generator'
import { NAME_SUBJECT_KIND_ENTRIES, toVocabOptions } from '@rpg/contracts/name-generator'

import { createEqualsFilter, createFilterSchema, type FilterSchema } from '@rpg/ui/filters'

import { getContentTypeItemLabel } from '@/features/content'

import { applyNameGeneratorFilterChange } from './apply-name-generator-filter-change'
import type { NamingCultureFilterContext } from './compose-name-generator-conventions'
import {
  deriveFilterOptions,
  deriveVisibleFilters,
  isFilterValueValid,
  type NameGeneratorFilterContext,
} from './derive-filter-options'
import { DEFAULT_FILTERS } from './name-generator.constants'
import type { NameGeneratorFilterOptions, NameGeneratorFilters } from './name-generator-filters'

function stripInvalidOptionalFilters(
  filters: NameGeneratorFilters,
  conventions: readonly NamingConvention[],
  context: NameGeneratorFilterContext,
): NameGeneratorFilters {
  const options = deriveFilterOptions(filters, conventions, context)
  const next: NameGeneratorFilters = { subjectKind: filters.subjectKind }

  if (isFilterValueValid('speciesId', filters.speciesId, options)) {
    next.speciesId = filters.speciesId
  }
  if (isFilterValueValid('languageId', filters.languageId, options)) {
    next.languageId = filters.languageId
  }
  if (isFilterValueValid('cultureId', filters.cultureId, options)) {
    next.cultureId = filters.cultureId
  }
  if (isFilterValueValid('genderStyle', filters.genderStyle, options)) {
    next.genderStyle = filters.genderStyle
  }

  return next
}

export type CreateNameGeneratorFilterSchemaArgs = {
  conventions: readonly NamingConvention[]
  filterContext: NameGeneratorFilterContext
  cultureContexts: readonly NamingCultureFilterContext[]
  filterOptions: NameGeneratorFilterOptions
}

export function createNameGeneratorFilterSchema(
  args: CreateNameGeneratorFilterSchemaArgs,
): FilterSchema<GeneratedName, NameGeneratorFilters> {
  const { conventions, filterContext, cultureContexts, filterOptions } = args

  return createFilterSchema<GeneratedName, NameGeneratorFilters>(
    [
      createEqualsFilter<GeneratedName, NameGeneratorFilters, 'subjectKind', NameSubjectKind>({
        id: 'subjectKind',
        label: 'Subject',
        defaultValue: DEFAULT_FILTERS.subjectKind,
        showAllOption: false,
        options: toVocabOptions(NAME_SUBJECT_KIND_ENTRIES) as {
          value: NameSubjectKind
          label: string
        }[],
        getValue: () => DEFAULT_FILTERS.subjectKind,
      }),
      createEqualsFilter<GeneratedName, NameGeneratorFilters, 'speciesId', string>({
        id: 'speciesId',
        label: getContentTypeItemLabel('species'),
        showAllOption: true,
        options: filterOptions.speciesIds.map((option) => ({
          value: option.id,
          label: option.label,
        })),
        visible: (state) => deriveVisibleFilters(state, conventions, filterContext).species,
        getValue: () => '',
      }),
      createEqualsFilter<GeneratedName, NameGeneratorFilters, 'languageId', string>({
        id: 'languageId',
        label: 'Language',
        showAllOption: true,
        options: filterOptions.languageIds.map((option) => ({
          value: option.id,
          label: option.label,
        })),
        visible: (state) => deriveVisibleFilters(state, conventions, filterContext).language,
        getValue: () => '',
      }),
      createEqualsFilter<GeneratedName, NameGeneratorFilters, 'cultureId', string>({
        id: 'cultureId',
        label: 'Culture',
        showAllOption: true,
        options: filterOptions.cultureIds.map((option) => ({
          value: option.id,
          label: option.label,
        })),
        visible: (state) => deriveVisibleFilters(state, conventions, filterContext).culture,
        getValue: () => '',
      }),
      createEqualsFilter<GeneratedName, NameGeneratorFilters, 'genderStyle', NameGenderStyle>({
        id: 'genderStyle',
        label: 'Gender style',
        showAllOption: true,
        options: filterOptions.genderStyles.map((option) => ({
          value: option.id as NameGenderStyle,
          label: option.label,
        })),
        visible: (state) => deriveVisibleFilters(state, conventions, filterContext).genderStyle,
        getValue: () => 'neutral',
      }),
    ],
    {
      normalizeChange: (next, context) => {
        if (
          context.changedId === 'subjectKind' &&
          next.subjectKind !== context.previous.subjectKind
        ) {
          return stripInvalidOptionalFilters(
            { subjectKind: next.subjectKind },
            conventions,
            filterContext,
          )
        }

        let normalized = next
        if (context.changedId === 'speciesId' && next.speciesId) {
          normalized = applyNameGeneratorFilterChange({
            filters: context.previous,
            key: 'speciesId',
            value: next.speciesId,
            speciesNamingOptions: filterContext.speciesNamingOptions,
            conventions,
            cultureContexts,
          })
        }

        return stripInvalidOptionalFilters(normalized, conventions, filterContext)
      },
    },
  )
}
