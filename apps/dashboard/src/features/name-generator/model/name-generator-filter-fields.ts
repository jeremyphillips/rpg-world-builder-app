import type { FilterFieldConfig, FilterToolbarOption } from '@rpg/ui'

import { getContentTypeItemLabel } from '@/features/content/lib/content-type-labels'

import type {
  FilterOption,
  NameGeneratorFilterOptions,
  NameGeneratorFilters,
  NameGeneratorVisibleFilters,
} from './name-generator-filters'

export type NameGeneratorFilterFieldsCtx = {
  filterOptions: NameGeneratorFilterOptions
  visibleFilters: NameGeneratorVisibleFilters
}

function toToolbarOptions(options: FilterOption[]): FilterToolbarOption[] {
  return options.map((option) => ({ value: option.id, label: option.label }))
}

export function buildNameGeneratorFilterFields(
  ctx: NameGeneratorFilterFieldsCtx,
): FilterFieldConfig<NameGeneratorFilters>[] {
  return [
    {
      key: 'subjectKind',
      type: 'select',
      label: 'Subject',
      options: toToolbarOptions(ctx.filterOptions.subjectKinds),
      required: true,
    },
    {
      key: 'speciesId',
      type: 'select',
      label: getContentTypeItemLabel('species'),
      options: toToolbarOptions(ctx.filterOptions.speciesIds),
      allowAny: true,
      placeholder: 'Any species',
      visible: ctx.visibleFilters.species,
    },
    {
      key: 'languageId',
      type: 'select',
      label: 'Language',
      options: toToolbarOptions(ctx.filterOptions.languageIds),
      allowAny: true,
      placeholder: 'Any language',
      visible: ctx.visibleFilters.language,
    },
    {
      key: 'cultureId',
      type: 'select',
      label: 'Culture',
      options: toToolbarOptions(ctx.filterOptions.cultureIds),
      allowAny: true,
      placeholder: 'Any culture',
      visible: ctx.visibleFilters.culture,
    },
    {
      key: 'genderStyle',
      type: 'select',
      label: 'Gender style',
      options: toToolbarOptions(ctx.filterOptions.genderStyles),
      allowAny: true,
      placeholder: 'Any gender style',
      visible: ctx.visibleFilters.genderStyle,
    },
  ]
}
