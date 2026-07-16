'use client'

import { Button } from '@rpg/ui'

import type { GeneratedName } from '@rpg/contracts/name-generator'

import { GENERATE_COUNT } from '../model/name-generator.constants'
import { useNameGeneratorPage } from '../hooks/use-name-generator-page'
import type {
  NameGeneratorFilterOptions,
  NameGeneratorFilters,
  NameGeneratorPageError,
  NameGeneratorResultsSummary,
  NameGeneratorStatus,
  NameGeneratorVisibleFilters,
} from '../model/name-generator-filters'
import { NameGeneratorFilters as NameGeneratorFiltersPanel } from './name-generator-filters.client'
import { NameGeneratorMatchSummary } from './name-generator-match-summary.client'
import { NameGeneratorResults } from './name-generator-results.client'
import { nameGeneratorActionRowClasses } from './name-generator-toolbar.variants'

export type NameGeneratorPageViewProps = {
  filters: NameGeneratorFilters
  filterOptions: NameGeneratorFilterOptions
  visibleFilters: NameGeneratorVisibleFilters
  matchCount: number
  matchCountLabel: string
  results: GeneratedName[]
  seed?: string
  status: NameGeneratorStatus
  error?: NameGeneratorPageError
  resultsSummary?: NameGeneratorResultsSummary
  isGenerateDisabled: boolean
  onFilterChange: (key: keyof NameGeneratorFilters, value: string | undefined) => void
  onResetFilters: () => void
  onGenerate: () => void
  onRegenerate: () => void
}

export function NameGeneratorPageView({
  filters,
  filterOptions,
  visibleFilters,
  matchCount,
  matchCountLabel,
  results,
  seed,
  status,
  error,
  resultsSummary,
  isGenerateDisabled,
  onFilterChange,
  onResetFilters,
  onGenerate,
  onRegenerate,
}: NameGeneratorPageViewProps) {
  return (
    <div className="flex flex-col gap-6">
      <NameGeneratorFiltersPanel
        filters={filters}
        filterOptions={filterOptions}
        visibleFilters={visibleFilters}
        onFilterChange={onFilterChange}
        onResetFilters={onResetFilters}
      />

      <div className={nameGeneratorActionRowClasses}>
        <NameGeneratorMatchSummary matchCount={matchCount} matchCountLabel={matchCountLabel} />
        <Button type="button" disabled={isGenerateDisabled} onClick={onGenerate}>
          Generate {GENERATE_COUNT}
        </Button>
      </div>

      <NameGeneratorResults
        status={status}
        results={results}
        resultsSummary={resultsSummary}
        error={error}
        seed={seed}
        onRegenerate={onRegenerate}
      />
    </div>
  )
}

export function NameGeneratorPage() {
  const {
    filters,
    filterOptions,
    visibleFilters,
    matchCount,
    matchCountLabel,
    results,
    seed,
    status,
    error,
    resultsSummary,
    isGenerateDisabled,
    setFilter,
    resetFilters,
    generate,
    regenerate,
  } = useNameGeneratorPage()

  return (
    <NameGeneratorPageView
      filters={filters}
      filterOptions={filterOptions}
      visibleFilters={visibleFilters}
      matchCount={matchCount}
      matchCountLabel={matchCountLabel}
      results={results}
      seed={seed}
      status={status}
      error={error}
      resultsSummary={resultsSummary}
      isGenerateDisabled={isGenerateDisabled}
      onFilterChange={setFilter}
      onResetFilters={resetFilters}
      onGenerate={() => {
        void generate()
      }}
      onRegenerate={() => {
        void regenerate()
      }}
    />
  )
}
