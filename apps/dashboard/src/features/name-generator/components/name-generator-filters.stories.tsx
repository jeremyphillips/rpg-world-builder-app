import type { Meta, StoryObj } from '@storybook/react-vite'

import { listConventions } from '@rpg/name-generator-data'

import { deriveFilterOptions, deriveVisibleFilters } from '../model/derive-filter-options'
import { resetNameGeneratorFilters } from '../model/sanitize-filters-on-change'
import { NameGeneratorFilters } from './name-generator-filters.client'

const conventions = listConventions()
const defaultFilters = resetNameGeneratorFilters()

const meta = {
  title: 'Dashboard/Name Generator/Filters',
  component: NameGeneratorFilters,
  args: {
    filters: defaultFilters,
    filterOptions: deriveFilterOptions(defaultFilters, conventions),
    visibleFilters: deriveVisibleFilters(defaultFilters, conventions),
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
      cultureId: 'high-elf',
      speciesId: 'srd-cc-5.2.1:elf',
      genderStyle: 'feminine',
    },
    filterOptions: deriveFilterOptions(
      {
        subjectKind: 'person',
        languageId: 'elvish',
        cultureId: 'high-elf',
        speciesId: 'srd-cc-5.2.1:elf',
        genderStyle: 'feminine',
      },
      conventions,
    ),
    visibleFilters: deriveVisibleFilters(
      {
        subjectKind: 'person',
        languageId: 'elvish',
        cultureId: 'high-elf',
        speciesId: 'srd-cc-5.2.1:elf',
        genderStyle: 'feminine',
      },
      conventions,
    ),
  },
}

export const SettlementSubject: Story = {
  args: {
    filters: { subjectKind: 'settlement' },
    filterOptions: deriveFilterOptions({ subjectKind: 'settlement' }, conventions),
    visibleFilters: deriveVisibleFilters({ subjectKind: 'settlement' }, conventions),
  },
}
