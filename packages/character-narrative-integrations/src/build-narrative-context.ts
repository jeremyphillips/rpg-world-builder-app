import type { Location } from '@rpg/contracts/rpg/content'
import {
  indexCharacterBuildCatalog,
  resolvePlayableBuilderContent,
  type CharacterBuildContext,
  type CharacterBuilderDraft,
} from '@rpg/contracts/rpg/runtime'
import {
  narrativeGenerationContextSchema,
  narrativeRelationshipFactsSchema,
  type NarrativeGenerationContext,
  type NarrativeOrganizationFact,
} from '@rpg/contracts/character-narrative'

import {
  buildNarrativeRelationshipFacts,
  resolveOmittedRelationshipReferenceIds,
  type NarrativeCharacterReference,
} from './resolve-narrative-relationship-facts'

function resolveSpeciesContext(
  draft: CharacterBuilderDraft,
  index: ReturnType<typeof indexCharacterBuildCatalog>,
  available: ReturnType<typeof resolvePlayableBuilderContent>,
) {
  const tokens: NarrativeGenerationContext['tokens'] = {}
  const affinities: string[] = []
  const species = index.species.get(draft.species.speciesId ?? '')
  if (!species || !available.species.some(({ id }) => id === species.id) || !('name' in species)) {
    return { tokens, affinities }
  }
  tokens['species.name'] = species.name
  affinities.push(`species:${species.slug}`)
  if (species.culture?.name) tokens['culture.name'] = species.culture.name
  if (species.culture?.id) affinities.push(`culture:${species.culture.id}`)
  const heritage = species.heritage?.options.find(({ id }) => id === draft.species.heritageId)
  if (heritage && 'name' in heritage) {
    tokens['heritage.name'] = heritage.name
    affinities.push(`heritage:${heritage.id}`)
  }
  return { tokens, affinities }
}

function resolveClassContext(
  draft: CharacterBuilderDraft,
  index: ReturnType<typeof indexCharacterBuildCatalog>,
  available: ReturnType<typeof resolvePlayableBuilderContent>,
) {
  const tokens: NarrativeGenerationContext['tokens'] = {}
  const affinities: string[] = []
  const selectedClass =
    draft.class.level > 0 ? index.classes.get(draft.class.classId ?? '') : undefined
  if (!selectedClass || !available.classes.some(({ id }) => id === selectedClass.id)) {
    return { tokens, affinities }
  }
  tokens['class.name'] = selectedClass.name
  affinities.push(`class:${selectedClass.slug}`)
  return { tokens, affinities }
}

function resolveOrganizations(
  draft: CharacterBuilderDraft,
  context: CharacterBuildContext,
): NarrativeOrganizationFact[] {
  const available = new Map(
    resolvePlayableBuilderContent(context).organizations.map((row) => [row.id, row]),
  )
  return draft.relationshipEdges
    .filter((edge) => edge.kind === 'organizationMembership')
    .flatMap((edge) => {
      const organization = available.get(edge.organizationId)
      if (!organization) return []
      const title = edge.details?.title
      const lifecycle = edge.details?.lifecycle ?? 'current'
      return [
        {
          id: organization.id,
          name: organization.name,
          ...(title !== undefined ? { title } : {}),
          lifecycle,
          affinities: [
            `organization:${organization.organizationDomain}`,
            `organizationMembership:${lifecycle}`,
            ...organization.functions.map((value) => `function:${value}`),
            ...organization.practices.map((value) => `practice:${value}`),
          ],
          provenance: { source: 'draft', draftEdgeId: edge.id },
        },
      ]
    })
}

/** Callers supply locations and characters from existing authorized campaign queries. */
export function buildNarrativeContext({
  draft,
  context,
  locations = [],
  characters = [],
}: {
  draft: CharacterBuilderDraft
  context: CharacterBuildContext
  locations?: readonly Location[]
  characters?: readonly NarrativeCharacterReference[]
}): NarrativeGenerationContext {
  const index = indexCharacterBuildCatalog(context.catalog)
  const available = resolvePlayableBuilderContent(context)
  const speciesContext = resolveSpeciesContext(draft, index, available)
  const classContext = resolveClassContext(draft, index, available)
  const organizations = resolveOrganizations(draft, context)
  const relationshipFacts = buildNarrativeRelationshipFacts({
    draft,
    organizations,
    locations,
    characters,
  })

  return narrativeGenerationContextSchema.parse({
    alignment: draft.identity.alignment,
    characterKind: context.characterKind,
    level: draft.class.level,
    tokens: { ...speciesContext.tokens, ...classContext.tokens },
    affinities: [...speciesContext.affinities, ...classContext.affinities],
    organizations: relationshipFacts.organizations,
    residences: relationshipFacts.residences,
    people: relationshipFacts.people,
    places: relationshipFacts.places,
    relationshipFacts: narrativeRelationshipFactsSchema.parse(relationshipFacts),
    omittedReferenceIds: resolveOmittedRelationshipReferenceIds({
      draft,
      organizations: relationshipFacts.organizations,
      residences: relationshipFacts.residences,
      places: relationshipFacts.places,
      people: relationshipFacts.people,
    }),
  })
}
