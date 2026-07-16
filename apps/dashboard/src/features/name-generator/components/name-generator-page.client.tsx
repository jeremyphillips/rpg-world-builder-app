'use client'

import { Button } from '@rpg/ui'

import { GENERATE_COUNT } from '../model/name-generator.constants'
import { useNameGeneratorPage } from '../hooks/use-name-generator-page'
import { NameGeneratorFilters } from './name-generator-filters.client'
import { NameGeneratorMatchSummary } from './name-generator-match-summary.client'
import { NameGeneratorResults } from './name-generator-results.client'
import { nameGeneratorActionRowClasses } from './name-generator-toolbar.variants'

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
    <div className="flex flex-col gap-6">
      <NameGeneratorFilters
        filters={filters}
        filterOptions={filterOptions}
        visibleFilters={visibleFilters}
        onFilterChange={setFilter}
        onResetFilters={resetFilters}
      />

      <div className={nameGeneratorActionRowClasses}>
        <NameGeneratorMatchSummary matchCount={matchCount} matchCountLabel={matchCountLabel} />
        <Button
          type="button"
          disabled={isGenerateDisabled}
          onClick={() => {
            void generate()
          }}
        >
          Generate {GENERATE_COUNT}
        </Button>
      </div>

      <NameGeneratorResults
        status={status}
        results={results}
        resultsSummary={resultsSummary}
        error={error}
        seed={seed}
        onRegenerate={() => {
          void regenerate()
        }}
      />
    </div>
  )
}
