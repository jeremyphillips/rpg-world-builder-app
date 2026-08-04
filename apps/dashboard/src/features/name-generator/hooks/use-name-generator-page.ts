'use client'

import { useCallback, useMemo, useState } from 'react'

import type { GeneratedName } from '@rpg/contracts/name-generator'
import { useActiveCampaignId } from '@/features/campaign'
import { useSpecies } from '@/features/content'

import {
  buildCultureFilterContexts,
  composeNameGeneratorConventions,
  toSpeciesCultureInput,
} from '../model/compose-name-generator-conventions'
import { buildNamingContext } from '../model/build-naming-context'
import {
  deriveFilterOptions,
  type NameGeneratorFilterContext,
} from '../model/derive-filter-options'
import { createNameGeneratorFilterSchema } from '../model/name-generator-filter-schema'
import { formatMatchCountLabel, formatResultsSummary } from '../model/format-results-summary'
import { generateNameBatch, mapNameGeneratorError } from '../model/generate-name-batch'
import type {
  NameGeneratorFilters,
  NameGeneratorPageError,
  NameGeneratorResultsSummary,
  NameGeneratorStatus,
} from '../model/name-generator-filters'
import { GENERATE_COUNT } from '../model/name-generator.constants'
import { recommendNameGeneratorMatches } from '../model/recommend-name-generator-matches'
import { resetNameGeneratorFilters } from '../model/sanitize-filters-on-change'

function isNameGeneratorPageError(error: unknown): error is NameGeneratorPageError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'kind' in error &&
    typeof (error as NameGeneratorPageError).kind === 'string'
  )
}

export function useNameGeneratorPage() {
  const activeCampaignId = useActiveCampaignId()
  const { data: campaignSpecies = [] } = useSpecies(activeCampaignId ?? undefined)

  const speciesInputs = useMemo(
    () => campaignSpecies.map((species) => toSpeciesCultureInput(species)),
    [campaignSpecies],
  )

  const { conventions, speciesNamingOptions, getConvention } = useMemo(
    () => composeNameGeneratorConventions(speciesInputs),
    [speciesInputs],
  )

  const cultureContexts = useMemo(() => buildCultureFilterContexts(speciesInputs), [speciesInputs])

  const filterContext: NameGeneratorFilterContext = useMemo(
    () => ({
      speciesNamingOptions,
      cultures: cultureContexts,
    }),
    [cultureContexts, speciesNamingOptions],
  )

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
  const filterOptions = useMemo(
    () => deriveFilterOptions(filters, conventions, filterContext),
    [filters, conventions, filterContext],
  )
  const filterSchema = useMemo(
    () =>
      createNameGeneratorFilterSchema({
        conventions,
        filterContext,
        cultureContexts,
        filterOptions,
      }),
    [conventions, cultureContexts, filterContext, filterOptions],
  )
  const matchCountLabel = useMemo(() => formatMatchCountLabel(matches.length), [matches.length])
  const resultsSummary: NameGeneratorResultsSummary | undefined = useMemo(() => {
    if (status !== 'success') {
      return undefined
    }

    return formatResultsSummary(filters, activeMatches, partialCount, getConvention)
  }, [activeMatches, filters, getConvention, partialCount, status])

  const setFilters = useCallback((next: NameGeneratorFilters) => {
    setFiltersState(next)
  }, [])

  const resetFilters = useCallback(() => {
    setFiltersState(resetNameGeneratorFilters())
  }, [])

  const runGeneration = useCallback(
    async (nextSeed?: string) => {
      setStatus('loading')
      setError(undefined)
      setPartialCount(undefined)

      try {
        const batch = await generateNameBatch(
          filters,
          {
            seed: nextSeed,
            count: GENERATE_COUNT,
          },
          {
            conventions,
            getConvention,
          },
        )

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
    [conventions, filters, getConvention],
  )

  const generate = useCallback(async () => {
    await runGeneration()
  }, [runGeneration])

  const regenerate = useCallback(async () => {
    await runGeneration(crypto.randomUUID())
  }, [runGeneration])

  return {
    filters,
    filterSchema,
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
    setFilters,
    resetFilters,
    generate,
    regenerate,
  }
}
