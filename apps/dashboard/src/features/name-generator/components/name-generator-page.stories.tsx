import type { Meta, StoryObj } from '@storybook/react-vite'

import type { GeneratedName } from '@rpg/contracts/name-generator'

import {
  composeNameGeneratorConventions,
  type SpeciesCultureInput,
} from '../model/compose-name-generator-conventions'
import { deriveFilterOptions } from '../model/derive-filter-options'
import { createNameGeneratorFilterSchema } from '../model/name-generator-filter-schema'
import { formatMatchCountLabel } from '../model/format-results-summary'
import { resetNameGeneratorFilters } from '../model/sanitize-filters-on-change'
import type { NameGeneratorFilters } from '../model/name-generator-filters'
import { NameGeneratorPage, NameGeneratorPageView } from './name-generator-page.client'

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
const defaultFilters = resetNameGeneratorFilters()
const noop = () => undefined

function storyFilterSchema(filters: NameGeneratorFilters) {
  const filterOptions = deriveFilterOptions(filters, conventions, filterContext)
  return createNameGeneratorFilterSchema({
    conventions,
    filterContext,
    cultureContexts,
    filterOptions,
  })
}

const FIXTURE_RESULTS: GeneratedName[] = [
  {
    value: 'Aelar Galanodel',
    conventionId: 'elvish-personal',
    structureId: 'full',
    parts: { given: 'Aelar', family: 'Galanodel' },
  },
  {
    value: 'Ilyrana Amastacia',
    conventionId: 'elvish-personal',
    structureId: 'full',
    parts: { given: 'Ilyrana', family: 'Amastacia' },
  },
]

const meta = {
  title: 'Dashboard/Name Generator/Page',
  component: NameGeneratorPage,
} satisfies Meta<typeof NameGeneratorPage>

export default meta

type Story = StoryObj<typeof meta>

export const Interactive: Story = {}

export const Idle: Story = {
  render: () => (
    <NameGeneratorPageView
      filters={defaultFilters}
      filterSchema={storyFilterSchema(defaultFilters)}
      matchCount={3}
      matchCountLabel={formatMatchCountLabel(3)}
      results={[]}
      status="idle"
      isGenerateDisabled={false}
      onFilterChange={noop}
      onResetFilters={noop}
      onGenerate={noop}
      onRegenerate={noop}
    />
  ),
}

export const WithResults: Story = {
  render: () => {
    const filters = {
      subjectKind: 'person' as const,
      languageId: 'elvish' as const,
      genderStyle: 'feminine' as const,
    }

    return (
      <NameGeneratorPageView
        filters={filters}
        filterSchema={storyFilterSchema(filters)}
        matchCount={1}
        matchCountLabel={formatMatchCountLabel(1)}
        results={FIXTURE_RESULTS}
        seed="story-seed"
        status="success"
        resultsSummary={{
          title: 'High Elven personal names',
          subtitle: 'Elvish · Elf · Feminine',
        }}
        isGenerateDisabled={false}
        onFilterChange={noop}
        onResetFilters={noop}
        onGenerate={noop}
        onRegenerate={noop}
      />
    )
  },
}

export const NoMatch: Story = {
  render: () => {
    const filters = { subjectKind: 'ship' as const }

    return (
      <NameGeneratorPageView
        filters={filters}
        filterSchema={storyFilterSchema(filters)}
        matchCount={0}
        matchCountLabel={formatMatchCountLabel(0)}
        results={[]}
        status="idle"
        isGenerateDisabled
        onFilterChange={noop}
        onResetFilters={noop}
        onGenerate={noop}
        onRegenerate={noop}
      />
    )
  },
}

export const Loading: Story = {
  render: () => (
    <NameGeneratorPageView
      filters={defaultFilters}
      filterSchema={storyFilterSchema(defaultFilters)}
      matchCount={3}
      matchCountLabel={formatMatchCountLabel(3)}
      results={[]}
      status="loading"
      isGenerateDisabled
      onFilterChange={noop}
      onResetFilters={noop}
      onGenerate={noop}
      onRegenerate={noop}
    />
  ),
}

export const Error: Story = {
  render: () => (
    <NameGeneratorPageView
      filters={defaultFilters}
      filterSchema={storyFilterSchema(defaultFilters)}
      matchCount={3}
      matchCountLabel={formatMatchCountLabel(3)}
      results={[]}
      status="error"
      error={{
        kind: 'collection-load',
        title: 'Names could not be generated',
        description:
          'A required naming collection could not be loaded. Try again or adjust the filters.',
      }}
      isGenerateDisabled={false}
      onFilterChange={noop}
      onResetFilters={noop}
      onGenerate={noop}
      onRegenerate={noop}
    />
  ),
}
