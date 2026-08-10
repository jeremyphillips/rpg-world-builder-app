import type { Species } from '@rpg/contracts'
import { indexCharacterBuildCatalog, type CharacterBuildContext } from '@rpg/contracts'
import { generateName, recommendConventions } from '@rpg/name-generator-core'
import {
  CULTURE_CONVENTION_BINDINGS,
  getConvention,
  HERITAGE_CULTURE_ALIASES,
  listStaticConventions,
  loadNameCollection,
  STANDALONE_NAMING_CULTURES,
} from '@rpg/name-generator-data'
import {
  resolveCampaignConventions,
  resolveStandaloneConventions,
  type SpeciesCultureInput,
} from '@rpg/name-generator-integrations'

export const QUICK_NPC_GENERATE_NAME_LABEL = 'Generate' as const
export const QUICK_NPC_NAME_GENERATION_FAILED =
  'Could not generate a name for this species.' as const

function toSpeciesCultureInput(species: Species): SpeciesCultureInput {
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

/**
 * Species-aware, user-triggered name generation for Quick NPC authoring.
 * Independent of automatic build determinism.
 */
export async function generateQuickNpcName(args: {
  speciesId: string
  context: CharacterBuildContext
}): Promise<string | undefined> {
  const catalogIndex = indexCharacterBuildCatalog(args.context.catalog)
  const species = catalogIndex.species.get(args.speciesId)
  if (!species) return undefined

  const speciesInput = toSpeciesCultureInput(species)
  const staticConventions = listStaticConventions()
  const campaignConventions = resolveCampaignConventions({
    species: [speciesInput],
    bindings: CULTURE_CONVENTION_BINDINGS,
    heritageAliases: HERITAGE_CULTURE_ALIASES,
  })
  const standaloneConventions = resolveStandaloneConventions({
    cultures: STANDALONE_NAMING_CULTURES,
    bindings: CULTURE_CONVENTION_BINDINGS,
  })
  const conventions = [...campaignConventions, ...standaloneConventions, ...staticConventions]
  const eligible = conventions.filter((convention) => convention.subjectKinds.includes('person'))
  const matches = recommendConventions(
    { subjectKind: 'person', speciesIds: [args.speciesId] },
    eligible,
  ).filter((match) =>
    match.reasons.some(
      (reason) => reason.kind === 'species' && reason.speciesId === args.speciesId,
    ),
  )

  if (matches.length === 0) return undefined

  const convention = getConvention(matches[0]!.conventionId)
  if (!convention) return undefined

  try {
    const collections = new Map<string, Awaited<ReturnType<typeof loadNameCollection>>>()
    for (const collectionId of convention.collectionIds) {
      collections.set(collectionId, await loadNameCollection(collectionId))
    }

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

    return generated.value
  } catch {
    return undefined
  }
}
