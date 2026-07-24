'use client'

import { Button } from '@rpg/ui'

import type { GeneratedName } from '@rpg/contracts/name-generator'
import type { FilterSchema } from '@rpg/ui/filters'

import { GENERATE_COUNT } from '../model/name-generator.constants'
import { useNameGeneratorPage } from '../hooks/use-name-generator-page'
import type {
  NameGeneratorFilters,
  NameGeneratorPageError,
  NameGeneratorResultsSummary,
  NameGeneratorStatus,
} from '../model/name-generator-filters'
import { NameGeneratorFilters as NameGeneratorFiltersPanel } from './name-generator-filters.client'
import { NameGeneratorMatchSummary } from './name-generator-match-summary.client'
import { NameGeneratorResults } from './name-generator-results.client'
import { nameGeneratorActionRowClasses } from './name-generator-toolbar.variants'

export type NameGeneratorPageViewProps = {
  filters: NameGeneratorFilters
  filterSchema: FilterSchema<GeneratedName, NameGeneratorFilters>
  matchCount: number
  matchCountLabel: string
  results: GeneratedName[]
  seed?: string
  status: NameGeneratorStatus
  error?: NameGeneratorPageError
  resultsSummary?: NameGeneratorResultsSummary
  isGenerateDisabled: boolean
  onFilterChange: (filters: NameGeneratorFilters) => void
  onResetFilters: () => void
  onGenerate: () => void
  onRegenerate: () => void
}

export function NameGeneratorPageView({
  filters,
  filterSchema,
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
        schema={filterSchema}
        filters={filters}
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
    filterSchema,
    matchCount,
    matchCountLabel,
    results,
    seed,
    status,
    error,
    resultsSummary,
    isGenerateDisabled,
    setFilters,
    resetFilters,
    generate,
    regenerate,
  } = useNameGeneratorPage()

  return (
    <NameGeneratorPageView
      filters={filters}
      filterSchema={filterSchema}
      matchCount={matchCount}
      matchCountLabel={matchCountLabel}
      results={results}
      seed={seed}
      status={status}
      error={error}
      resultsSummary={resultsSummary}
      isGenerateDisabled={isGenerateDisabled}
      onFilterChange={setFilters}
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
