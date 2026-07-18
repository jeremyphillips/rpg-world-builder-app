import {
  isNameGeneratorError,
  MAX_DUPLICATE_ATTEMPTS,
  type GeneratedName,
  type NameCollection,
  type NamingConvention,
  type NamingRecommendation,
} from '@rpg/contracts/name-generator'
import { generateName } from '@rpg/name-generator-core'
import { getConvention, listStaticConventions, loadNameCollection } from '@rpg/name-generator-data'

import { allocateNameCounts, buildWeightedRoundRobinOrder } from './allocate-name-counts'
import { buildNamingContext } from './build-naming-context'
import { GENERATE_COUNT } from './name-generator.constants'
import type { NameGeneratorFilters, NameGeneratorPageError } from './name-generator-filters'
import { loadConventionCollections, type LoadNameCollectionFn } from './load-convention-collections'
import { recommendNameGeneratorMatches } from './recommend-name-generator-matches'

export type GenerateNameBatchResult = {
  results: GeneratedName[]
  seed: string
  matches: NamingRecommendation[]
  partialCount?: { generated: number; requested: number }
}

export type GenerateNameBatchDeps = {
  conventions?: readonly NamingConvention[]
  getConvention?: (conventionId: string) => NamingConvention | undefined
  loadCollection?: LoadNameCollectionFn
}

function createBatchSeed(): string {
  return crypto.randomUUID()
}

export function mapNameGeneratorError(error: unknown): NameGeneratorPageError {
  if (isNameGeneratorError(error)) {
    switch (error.code) {
      case 'unknown-collection':
      case 'missing-collection':
        return {
          kind: 'collection-load',
          title: 'Names could not be generated',
          description:
            'A required naming collection could not be loaded. Try again or adjust the filters.',
        }
      case 'invalid-asset':
      case 'unsupported-version':
      case 'empty-pool':
        return {
          kind: 'invalid-collection',
          title: 'This naming collection is unavailable',
          description: 'Its data does not match the supported generator format.',
        }
      default:
        break
    }
  }

  return {
    kind: 'generation',
    title: 'Names could not be generated',
    description: 'Something went wrong while generating names. Try again or adjust the filters.',
  }
}

function createNoMatchesError(): NameGeneratorPageError {
  return {
    kind: 'no-matches',
    title: 'No naming conventions match these filters',
    description: 'Remove a filter or reset the view.',
  }
}

async function generateNameForSlot(
  convention: NamingConvention,
  collections: ReadonlyMap<string, NameCollection>,
  seed: string,
  genderStyle: NameGeneratorFilters['genderStyle'],
  slotIndex: number,
  seen: Set<string>,
): Promise<GeneratedName | undefined> {
  for (let attempt = 0; attempt < MAX_DUPLICATE_ATTEMPTS; attempt += 1) {
    try {
      const candidate = generateName(
        convention,
        collections,
        {
          conventionId: convention.id,
          count: 1,
          seed,
          genderStyle,
        },
        slotIndex * MAX_DUPLICATE_ATTEMPTS + attempt,
        seen,
      )

      if (!seen.has(candidate.value)) {
        return candidate
      }
    } catch (error) {
      if (isNameGeneratorError(error) && error.code === 'generation-exhausted') {
        return undefined
      }
      throw error
    }
  }

  return undefined
}

function resolveMatchedConventions(
  matches: readonly NamingRecommendation[],
  getConventionById: typeof getConvention,
): NamingConvention[] {
  return matches
    .map((match) => getConventionById(match.conventionId))
    .filter((convention): convention is NamingConvention => convention !== undefined)
}

async function collectBatchResults(
  emitOrder: readonly string[],
  getConventionById: typeof getConvention,
  collections: ReadonlyMap<string, NameCollection>,
  seed: string,
  genderStyle: NameGeneratorFilters['genderStyle'],
): Promise<GeneratedName[]> {
  const results: GeneratedName[] = []
  const seen = new Set<string>()

  for (const [slotIndex, conventionId] of emitOrder.entries()) {
    const convention = getConventionById(conventionId)
    if (convention === undefined) {
      continue
    }

    const generated = await generateNameForSlot(
      convention,
      collections,
      seed,
      genderStyle,
      slotIndex,
      seen,
    )

    if (generated === undefined) {
      break
    }

    seen.add(generated.value)
    results.push({ ...generated, seed })
  }

  return results
}

export async function generateNameBatch(
  filters: NameGeneratorFilters,
  options?: {
    seed?: string
    count?: number
  },
  deps: GenerateNameBatchDeps = {},
): Promise<GenerateNameBatchResult> {
  const conventions = deps.conventions ?? listStaticConventions()
  const getConventionById = deps.getConvention ?? getConvention
  const loadCollection = deps.loadCollection ?? loadNameCollection

  const context = buildNamingContext(filters)
  const matches = recommendNameGeneratorMatches(context, conventions, filters)

  if (matches.length === 0) {
    throw createNoMatchesError()
  }

  const requestedCount = options?.count ?? GENERATE_COUNT
  const seed = options?.seed ?? createBatchSeed()
  const emitOrder = buildWeightedRoundRobinOrder(
    matches,
    allocateNameCounts(matches, requestedCount),
  )
  const matchedConventions = resolveMatchedConventions(matches, getConventionById)
  const collections = await loadConventionCollections(matchedConventions, loadCollection)
  const results = await collectBatchResults(
    emitOrder,
    getConventionById,
    collections,
    seed,
    filters.genderStyle,
  )

  return {
    results,
    seed,
    matches,
    ...(results.length < requestedCount
      ? { partialCount: { generated: results.length, requested: requestedCount } }
      : {}),
  }
}
