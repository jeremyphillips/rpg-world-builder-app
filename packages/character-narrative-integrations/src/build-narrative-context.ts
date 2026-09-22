import { resolveLocationConnectionEligibility, type Location } from '@rpg/contracts/rpg/content'
import {
  indexCharacterBuildCatalog,
  resolvePlayableBuilderContent,
  type CharacterBuildContext,
  type CharacterBuilderDraft,
} from '@rpg/contracts/rpg/runtime'
import {
  narrativeGenerationContextSchema,
  type NarrativeGenerationContext,
} from '@rpg/contracts/character-narrative'

function resolveResidences(draft: CharacterBuilderDraft, locations: readonly Location[]) {
  const byId = new Map(locations.map((location) => [location.id, location]))
  return draft.connections.locations
    .filter(({ kind }) => kind === 'resides_at')
    .flatMap(({ locationId }) => {
      const location = byId.get(locationId)
      if (!location || !('name' in location)) return []
      const classification =
        location.kind === 'structure'
          ? { kind: location.kind, structureType: location.structureType }
          : { kind: location.kind }
      if (
        !resolveLocationConnectionEligibility(classification).characterKinds.includes('resides_at')
      )
        return []
      return [{ id: location.id, name: location.name, affinities: [`location:${location.kind}`] }]
    })
}

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

function resolveOmittedReferenceIds(
  draft: CharacterBuilderDraft,
  organizations: NarrativeGenerationContext['organizations'],
  residences: NarrativeGenerationContext['residences'],
) {
  const resolvedIds = new Set([...organizations, ...residences].map(({ id }) => id))
  const selectedIds = [
    ...draft.connections.organizations.map(({ organizationId }) => organizationId),
    ...draft.connections.locations
      .filter(({ kind }) => kind === 'resides_at')
      .map(({ locationId }) => locationId),
  ]
  return selectedIds.filter((id) => !resolvedIds.has(id))
}

function resolveOrganizations(draft: CharacterBuilderDraft, context: CharacterBuildContext) {
  const available = new Map(
    resolvePlayableBuilderContent(context).organizations.map((row) => [row.id, row]),
  )
  return draft.connections.organizations.flatMap((connection) => {
    const organization = available.get(connection.organizationId)
    if (!organization) return []
    return [
      {
        id: organization.id,
        name: organization.name,
        title: connection.title,
        affinities: [
          `organization:${organization.organizationDomain}`,
          ...organization.functions.map((value) => `function:${value}`),
          ...organization.practices.map((value) => `practice:${value}`),
        ],
      },
    ]
  })
}

/** Callers supply locations from the existing authorized campaign query. */
export function buildNarrativeContext({
  draft,
  context,
  locations = [],
}: {
  draft: CharacterBuilderDraft
  context: CharacterBuildContext
  locations?: readonly Location[]
}): NarrativeGenerationContext {
  const index = indexCharacterBuildCatalog(context.catalog)
  const available = resolvePlayableBuilderContent(context)
  const speciesContext = resolveSpeciesContext(draft, index, available)
  const classContext = resolveClassContext(draft, index, available)
  const organizations = resolveOrganizations(draft, context)
  const residences = resolveResidences(draft, locations)
  return narrativeGenerationContextSchema.parse({
    alignment: draft.identity.alignment,
    characterKind: context.characterKind,
    level: draft.class.level,
    tokens: { ...speciesContext.tokens, ...classContext.tokens },
    affinities: [...speciesContext.affinities, ...classContext.affinities],
    organizations,
    residences,
    omittedReferenceIds: resolveOmittedReferenceIds(draft, organizations, residences),
  })
}
