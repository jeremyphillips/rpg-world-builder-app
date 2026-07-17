'use client'

import { useCallback, useMemo, useState } from 'react'

import type { GeneratedName, NameGenderStyle, NameSubjectKind } from '@rpg/contracts/name-generator'
import { listConventions } from '@rpg/name-generator-data'

import { buildNamingContext } from '../model/build-naming-context'
import { deriveFilterOptions, deriveVisibleFilters } from '../model/derive-filter-options'
import { formatMatchCountLabel, formatResultsSummary } from '../model/format-results-summary'
import { generateNameBatch, mapNameGeneratorError } from '../model/generate-name-batch'
import type {
  NameGeneratorFilterOptions,
  NameGeneratorFilters,
  NameGeneratorPageError,
  NameGeneratorResultsSummary,
  NameGeneratorStatus,
  NameGeneratorVisibleFilters,
} from '../model/name-generator-filters'
import { GENERATE_COUNT } from '../model/name-generator.constants'
import { recommendNameGeneratorMatches } from '../model/recommend-name-generator-matches'
import {
  resetNameGeneratorFilters,
  sanitizeFiltersOnChange,
} from '../model/sanitize-filters-on-change'

function isNameGeneratorPageError(error: unknown): error is NameGeneratorPageError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'kind' in error &&
    typeof (error as NameGeneratorPageError).kind === 'string'
  )
}

export function useNameGeneratorPage() {
  const conventions = useMemo(() => listConventions(), [])
  const [filters, setFiltersState] = useState<NameGeneratorFilters>(resetNameGeneratorFilters())
  const [results, setResults] = useState<GeneratedName[]>([])
  const [seed, setSeed] = useState<string | undefined>()
  const [status, setStatus] = useState<NameGeneratorStatus>('idle')
  const [error, setError] = useState<NameGeneratorPageError | undefined>()
  const [partialCount, setPartialCount] = useState<
    { generated: number; requested: number } | undefined
  >()
  const [activeMatches, setActiveMatches] = useState<
    ReturnType<typeof recommendNameGeneratorMatches>
  >([])

  const namingContext = useMemo(() => buildNamingContext(filters), [filters])
  const matches = useMemo(
    () => recommendNameGeneratorMatches(namingContext, conventions, filters),
    [namingContext, conventions, filters],
  )
  const filterOptions: NameGeneratorFilterOptions = useMemo(
    () => deriveFilterOptions(filters, conventions),
    [filters, conventions],
  )
  const visibleFilters: NameGeneratorVisibleFilters = useMemo(
    () => deriveVisibleFilters(filters, conventions),
    [filters, conventions],
  )
  const matchCountLabel = useMemo(() => formatMatchCountLabel(matches.length), [matches.length])
  const resultsSummary: NameGeneratorResultsSummary | undefined = useMemo(() => {
    if (status !== 'success') {
      return undefined
    }

    return formatResultsSummary(filters, activeMatches, partialCount)
  }, [activeMatches, filters, partialCount, status])

  const setFilter = useCallback(
    (key: keyof NameGeneratorFilters, value: string | undefined) => {
      const next: NameGeneratorFilters = { ...filters }

      if (key === 'subjectKind') {
        next.subjectKind = (value ?? 'person') as NameSubjectKind
      } else if (value === undefined || value === '') {
        delete next[key]
      } else if (key === 'genderStyle') {
        next.genderStyle = value as NameGenderStyle
      } else if (key === 'speciesId') {
        next.speciesId = value
      } else if (key === 'languageId') {
        next.languageId = value
      } else if (key === 'cultureId') {
        next.cultureId = value
      }

      setFiltersState(sanitizeFiltersOnChange(filters, next, conventions))
    },
    [conventions, filters],
  )

  const resetFilters = useCallback(() => {
    setFiltersState(resetNameGeneratorFilters())
  }, [])

  const runGeneration = useCallback(
    async (nextSeed?: string) => {
      setStatus('loading')
      setError(undefined)
      setPartialCount(undefined)

      try {
        const batch = await generateNameBatch(filters, {
          seed: nextSeed,
          count: GENERATE_COUNT,
        })

        setResults(batch.results)
        setSeed(batch.seed)
        setActiveMatches(batch.matches)
        setPartialCount(batch.partialCount)
        setStatus('success')
      } catch (generationError) {
        setResults([])
        setActiveMatches([])

        if (isNameGeneratorPageError(generationError)) {
          setError(generationError)
        } else {
          setError(mapNameGeneratorError(generationError))
        }

        setStatus('error')
      }
    },
    [filters],
  )

  const generate = useCallback(async () => {
    await runGeneration()
  }, [runGeneration])

  const regenerate = useCallback(async () => {
    await runGeneration(crypto.randomUUID())
  }, [runGeneration])

  return {
    filters,
    filterOptions,
    visibleFilters,
    matches,
    matchCount: matches.length,
    matchCountLabel,
    results,
    seed,
    status,
    error,
    partialCount,
    resultsSummary,
    isGenerateDisabled: matches.length === 0 || status === 'loading',
    setFilter,
    resetFilters,
    generate,
    regenerate,
  }
}
