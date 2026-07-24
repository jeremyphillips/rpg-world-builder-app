import type { Meta, StoryObj } from '@storybook/react-vite'
import { useMemo, useState } from 'react'

import {
  composeNameGeneratorConventions,
  type SpeciesCultureInput,
} from '../model/compose-name-generator-conventions'
import { deriveFilterOptions } from '../model/derive-filter-options'
import { createNameGeneratorFilterSchema } from '../model/name-generator-filter-schema'
import { resetNameGeneratorFilters } from '../model/sanitize-filters-on-change'
import type { NameGeneratorFilters } from '../model/name-generator-filters'
import { NameGeneratorFilters as NameGeneratorFiltersPanel } from './name-generator-filters.client'

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
const cultureContexts = filterContext.cultures

function NameGeneratorFiltersStory({ initialFilters }: { initialFilters: NameGeneratorFilters }) {
  const [filters, setFilters] = useState(initialFilters)
  const filterOptions = deriveFilterOptions(filters, conventions, filterContext)
  const schema = useMemo(
    () =>
      createNameGeneratorFilterSchema({
        conventions,
        filterContext,
        cultureContexts,
        filterOptions,
      }),
    [filterOptions, filters],
  )

  return (
    <NameGeneratorFiltersPanel
      schema={schema}
      filters={filters}
      onFilterChange={setFilters}
      onResetFilters={() => setFilters(resetNameGeneratorFilters())}
    />
  )
}

const meta = {
  title: 'Dashboard/Name Generator/Filters',
  component: NameGeneratorFiltersStory,
} satisfies Meta<typeof NameGeneratorFiltersStory>

export default meta

type Story = StoryObj<typeof meta>

export const PersonDefaults: Story = {
  args: { initialFilters: resetNameGeneratorFilters() },
  render: (args) => <NameGeneratorFiltersStory initialFilters={args.initialFilters} />,
}

export const ElvishContext: Story = {
  args: {
    initialFilters: {
      subjectKind: 'person',
      languageId: 'elvish',
      cultureId: 'elven',
      speciesId: 'srd-cc-5.2.1:elf',
      genderStyle: 'feminine',
    },
  },
  render: (args) => <NameGeneratorFiltersStory initialFilters={args.initialFilters} />,
}

export const SettlementSubject: Story = {
  args: {
    initialFilters: { subjectKind: 'settlement' },
  },
  render: (args) => <NameGeneratorFiltersStory initialFilters={args.initialFilters} />,
}
