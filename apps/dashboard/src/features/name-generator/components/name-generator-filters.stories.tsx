import type { Meta, StoryObj } from '@storybook/react-vite'

import {
  composeNameGeneratorConventions,
  type SpeciesCultureInput,
} from '../model/compose-name-generator-conventions'
import { deriveFilterOptions, deriveVisibleFilters } from '../model/derive-filter-options'
import { resetNameGeneratorFilters } from '../model/sanitize-filters-on-change'
import { NameGeneratorFilters } from './name-generator-filters.client'

const STORY_ELF_SPECIES: SpeciesCultureInput = {
  id: 'srd-cc-5.2.1:elf',
  slug: 'elf',
  name: 'Elf',
  source: 'system',
  culture: {
    id: 'elven',
    name: 'Elven',
    naming: { supported: true, personalNameComponents: ['family'] },
  },
  languageAffinities: ['elvish'],
}

const { conventions, speciesNamingOptions } = composeNameGeneratorConventions([STORY_ELF_SPECIES])
const filterContext = {
  speciesNamingOptions,
  cultures: [
    {
      id: 'elven',
      label: 'Elven',
      languageIds: ['elvish'],
    },
  ],
}
const defaultFilters = resetNameGeneratorFilters()

const meta = {
  title: 'Dashboard/Name Generator/Filters',
  component: NameGeneratorFilters,
  args: {
    filters: defaultFilters,
    filterOptions: deriveFilterOptions(defaultFilters, conventions, filterContext),
    visibleFilters: deriveVisibleFilters(defaultFilters, conventions, filterContext),
    onFilterChange: () => undefined,
    onResetFilters: () => undefined,
  },
} satisfies Meta<typeof NameGeneratorFilters>

export default meta

type Story = StoryObj<typeof meta>

export const PersonDefaults: Story = {}

export const ElvishContext: Story = {
  args: {
    filters: {
      subjectKind: 'person',
      languageId: 'elvish',
      cultureId: 'elven',
      speciesId: 'srd-cc-5.2.1:elf',
      genderStyle: 'feminine',
    },
    filterOptions: deriveFilterOptions(
      {
        subjectKind: 'person',
        languageId: 'elvish',
        cultureId: 'elven',
        speciesId: 'srd-cc-5.2.1:elf',
        genderStyle: 'feminine',
      },
      conventions,
      filterContext,
    ),
    visibleFilters: deriveVisibleFilters(
      {
        subjectKind: 'person',
        languageId: 'elvish',
        cultureId: 'elven',
        speciesId: 'srd-cc-5.2.1:elf',
        genderStyle: 'feminine',
      },
      conventions,
      filterContext,
    ),
  },
}

export const SettlementSubject: Story = {
  args: {
    filters: { subjectKind: 'settlement' },
    filterOptions: deriveFilterOptions({ subjectKind: 'settlement' }, conventions, filterContext),
    visibleFilters: deriveVisibleFilters({ subjectKind: 'settlement' }, conventions, filterContext),
  },
}
