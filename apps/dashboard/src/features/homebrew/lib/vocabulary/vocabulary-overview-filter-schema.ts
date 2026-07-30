import type { CampaignAvailabilityFilter, VocabularyOptionSource } from '@rpg/contracts'
import type { VocabularyOptionWithUsage } from '@rpg/contracts'
import {
  createEqualsFilter,
  createFilterSchema,
  createTextFilter,
  type FilterFieldDef,
  type FilterSchema,
} from '@rpg/ui/filters'

import { createCampaignAvailabilityFilterField } from '@/lib/overview/create-campaign-availability-filter-field'

import { VOCABULARY_SOURCE_BADGE } from './labels'

export type VocabularyOverviewFilterState = {
  name?: string
  source?: VocabularyOptionSource
  campaignAvailability?: CampaignAvailabilityFilter
}

export function buildVocabularyOverviewFilterSchema(): FilterSchema<
  VocabularyOptionWithUsage,
  VocabularyOverviewFilterState
> {
  return createFilterSchema([
    createTextFilter<VocabularyOptionWithUsage, VocabularyOverviewFilterState, 'name'>({
      id: 'name',
      label: 'Name',
      placeholder: 'Search…',
      url: { key: 'q' },
      getSearchText: (row) => row.label,
    }),
    createEqualsFilter<
      VocabularyOptionWithUsage,
      VocabularyOverviewFilterState,
      'source',
      VocabularyOptionSource
    >({
      id: 'source',
      label: 'Source',
      placement: 'advanced',
      layout: 'stacked',
      width: 'md',
      options: (Object.keys(VOCABULARY_SOURCE_BADGE) as VocabularyOptionSource[]).map((value) => ({
        value,
        label: VOCABULARY_SOURCE_BADGE[value].label,
      })),
      getValue: (row) => row.source,
    }) as FilterFieldDef<VocabularyOptionWithUsage, VocabularyOverviewFilterState>,
    createCampaignAvailabilityFilterField<VocabularyOptionWithUsage, VocabularyOverviewFilterState>(
      (row) => row.status === 'active',
    ),
  ])
}

export const VOCABULARY_OVERVIEW_FILTER_SCHEMA = buildVocabularyOverviewFilterSchema()
