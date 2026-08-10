import type { Species } from '@rpg/contracts'
import { indexCharacterBuildCatalog, type CharacterBuildContext } from '@rpg/contracts'
import { generateName } from '@rpg/name-generator-core'
import { loadNameCollection } from '@rpg/name-generator-data'
import {
  composeAvailableNamingConventions,
  resolveSpeciesPersonNaming,
  type SpeciesCultureInput,
} from '@rpg/name-generator-integrations'

export const QUICK_NPC_GENERATE_NAME_LABEL = 'Generate' as const
export const QUICK_NPC_NAME_GENERATION_FAILED =
  'Could not generate a name for this species.' as const

export type QuickNpcNameGenerationSupport = {
  enabled: boolean
  disabledReason?: string
}

export type QuickNpcNameGenerationResult =
  | { ok: true; name: string }
  | { ok: false; kind: 'unsupported'; reason: string }
  | { ok: false; kind: 'generation_failed' }

export function toSpeciesCultureInput(species: Species): SpeciesCultureInput {
  return {
    id: species.id,
    slug: species.slug,
    name: species.name,
    source: species.source,
    languageAffinities: species.languageAffinities,
    culture: species.culture,
    heritage:
      species.heritage === undefined
        ? undefined
        : {
            options: species.heritage.options.map((option) => ({
              id: option.id,
              name: 'name' in option ? option.name : undefined,
            })),
          },
  }
}

export function resolveQuickNpcNameGenerationSupport(args: {
  speciesId: string
  context: CharacterBuildContext
}): QuickNpcNameGenerationSupport {
  const catalogIndex = indexCharacterBuildCatalog(args.context.catalog)
  const species = catalogIndex.species.get(args.speciesId)
  if (!species) {
    return { enabled: false }
  }

  const speciesInput = toSpeciesCultureInput(species)
  const { conventions } = composeAvailableNamingConventions([speciesInput])
  const resolution = resolveSpeciesPersonNaming({ species: speciesInput, conventions })

  if (!resolution.supported) {
    return { enabled: false, disabledReason: resolution.reason }
  }

  return { enabled: true }
}

/**
 * Species-aware, user-triggered name generation for Quick NPC authoring.
 * Thin adapter over `@rpg/name-generator-integrations`.
 */
export async function generateQuickNpcName(args: {
  speciesId: string
  context: CharacterBuildContext
}): Promise<QuickNpcNameGenerationResult> {
  const catalogIndex = indexCharacterBuildCatalog(args.context.catalog)
  const species = catalogIndex.species.get(args.speciesId)
  if (!species) {
    return { ok: false, kind: 'unsupported', reason: QUICK_NPC_NAME_GENERATION_FAILED }
  }

  const speciesInput = toSpeciesCultureInput(species)
  const { conventions, getConvention } = composeAvailableNamingConventions([speciesInput])
  const resolution = resolveSpeciesPersonNaming({ species: speciesInput, conventions })

  if (!resolution.supported) {
    return { ok: false, kind: 'unsupported', reason: resolution.reason }
  }

  const convention = getConvention(resolution.conventionIds[0]!)
  if (!convention) {
    return { ok: false, kind: 'generation_failed' }
  }

  try {
    const collections = new Map(
      await Promise.all(
        convention.collectionIds.map(
          async (collectionId) => [collectionId, await loadNameCollection(collectionId)] as const,
        ),
      ),
    )

    const generated = generateName(
      convention,
      collections,
      {
        conventionId: convention.id,
        count: 1,
        seed: crypto.randomUUID(),
        genderStyle: 'neutral',
      },
      0,
      new Set<string>(),
    )

    if (!generated.value.trim()) {
      return { ok: false, kind: 'generation_failed' }
    }

    return { ok: true, name: generated.value }
  } catch {
    return { ok: false, kind: 'generation_failed' }
  }
}
