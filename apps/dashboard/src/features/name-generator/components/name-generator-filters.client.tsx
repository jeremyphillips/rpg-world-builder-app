'use client'

import { RotateCcw } from 'lucide-react'

import { Button } from '@rpg/ui'

import type {
  NameGeneratorFilterOptions,
  NameGeneratorFilters,
  NameGeneratorVisibleFilters,
} from '../model/name-generator-filters'
import { NameGeneratorFilterSelect } from './name-generator-filter-select.client'
import {
  nameGeneratorResetButtonClasses,
  nameGeneratorToolbarClasses,
} from './name-generator-toolbar.variants'

export type NameGeneratorFiltersProps = {
  filters: NameGeneratorFilters
  filterOptions: NameGeneratorFilterOptions
  visibleFilters: NameGeneratorVisibleFilters
  onFilterChange: (key: keyof NameGeneratorFilters, value: string | undefined) => void
  onResetFilters: () => void
}

export function NameGeneratorFilters({
  filters,
  filterOptions,
  visibleFilters,
  onFilterChange,
  onResetFilters,
}: NameGeneratorFiltersProps) {
  return (
    <div className={nameGeneratorToolbarClasses}>
      <NameGeneratorFilterSelect
        id="name-generator-subject"
        label="Subject"
        value={filters.subjectKind}
        options={filterOptions.subjectKinds}
        onValueChange={(value) => onFilterChange('subjectKind', value)}
      />

      {visibleFilters.species ? (
        <NameGeneratorFilterSelect
          id="name-generator-species"
          label="Species"
          value={filters.speciesId}
          options={filterOptions.speciesIds}
          onValueChange={(value) => onFilterChange('speciesId', value)}
          allowAny
        />
      ) : null}

      {visibleFilters.language ? (
        <NameGeneratorFilterSelect
          id="name-generator-language"
          label="Language"
          value={filters.languageId}
          options={filterOptions.languageIds}
          onValueChange={(value) => onFilterChange('languageId', value)}
          allowAny
        />
      ) : null}

      {visibleFilters.culture ? (
        <NameGeneratorFilterSelect
          id="name-generator-culture"
          label="Culture"
          value={filters.cultureId}
          options={filterOptions.cultureIds}
          onValueChange={(value) => onFilterChange('cultureId', value)}
          allowAny
        />
      ) : null}

      {visibleFilters.genderStyle ? (
        <NameGeneratorFilterSelect
          id="name-generator-gender-style"
          label="Gender style"
          value={filters.genderStyle}
          options={filterOptions.genderStyles}
          onValueChange={(value) => onFilterChange('genderStyle', value)}
          allowAny
        />
      ) : null}

      <Button
        type="button"
        variant="outline"
        size="sm"
        className={nameGeneratorResetButtonClasses}
        onClick={onResetFilters}
      >
        <RotateCcw aria-hidden className="size-3" />
        Reset filters
      </Button>
    </div>
  )
}
