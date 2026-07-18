import type { Meta, StoryObj } from '@storybook/react-vite'

import type { GeneratedName } from '@rpg/contracts/name-generator'

import {
  composeNameGeneratorConventions,
  type SpeciesCultureInput,
} from '../model/compose-name-generator-conventions'
import { deriveFilterOptions, deriveVisibleFilters } from '../model/derive-filter-options'
import { formatMatchCountLabel } from '../model/format-results-summary'
import { resetNameGeneratorFilters } from '../model/sanitize-filters-on-change'
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
const defaultFilters = resetNameGeneratorFilters()
const defaultFilterOptions = deriveFilterOptions(defaultFilters, conventions, filterContext)
const defaultVisibleFilters = deriveVisibleFilters(defaultFilters, conventions, filterContext)
const noop = () => undefined

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
      filterOptions={defaultFilterOptions}
      visibleFilters={defaultVisibleFilters}
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
  render: () => (
    <NameGeneratorPageView
      filters={{ subjectKind: 'person', languageId: 'elvish', genderStyle: 'feminine' }}
      filterOptions={deriveFilterOptions(
        { subjectKind: 'person', languageId: 'elvish', genderStyle: 'feminine' },
        conventions,
        filterContext,
      )}
      visibleFilters={deriveVisibleFilters(
        { subjectKind: 'person', languageId: 'elvish', genderStyle: 'feminine' },
        conventions,
        filterContext,
      )}
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
  ),
}

export const NoMatch: Story = {
  render: () => (
    <NameGeneratorPageView
      filters={{ subjectKind: 'ship' }}
      filterOptions={deriveFilterOptions({ subjectKind: 'ship' }, conventions, filterContext)}
      visibleFilters={deriveVisibleFilters({ subjectKind: 'ship' }, conventions, filterContext)}
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
  ),
}

export const Loading: Story = {
  render: () => (
    <NameGeneratorPageView
      filters={defaultFilters}
      filterOptions={defaultFilterOptions}
      visibleFilters={defaultVisibleFilters}
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
      filterOptions={defaultFilterOptions}
      visibleFilters={defaultVisibleFilters}
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
