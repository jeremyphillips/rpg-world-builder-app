import type { Meta, StoryObj } from '@storybook/react-vite'
import { listConventions } from '@rpg/name-generator-data'

import type { GeneratedName } from '@rpg/contracts/name-generator'

import { deriveFilterOptions, deriveVisibleFilters } from '../model/derive-filter-options'
import { formatMatchCountLabel } from '../model/format-results-summary'
import { resetNameGeneratorFilters } from '../model/sanitize-filters-on-change'
import { NameGeneratorPage, NameGeneratorPageView } from './name-generator-page.client'

const conventions = listConventions()
const defaultFilters = resetNameGeneratorFilters()
const defaultFilterOptions = deriveFilterOptions(defaultFilters, conventions)
const defaultVisibleFilters = deriveVisibleFilters(defaultFilters, conventions)
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
      )}
      visibleFilters={deriveVisibleFilters(
        { subjectKind: 'person', languageId: 'elvish', genderStyle: 'feminine' },
        conventions,
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
      filterOptions={deriveFilterOptions({ subjectKind: 'ship' }, conventions)}
      visibleFilters={deriveVisibleFilters({ subjectKind: 'ship' }, conventions)}
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
