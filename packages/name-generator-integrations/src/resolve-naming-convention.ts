import type {
  NamingConvention,
  NamingConventionDefinition,
  NamingCultureContext,
} from '@rpg/contracts/name-generator'
import { namingConventionSchema } from '@rpg/contracts/name-generator'

import { dedupeAssociations } from './dedupe-associations'
import { getDefaultSubjectKinds } from './default-subject-kinds'
import { formatConventionDescription, formatConventionLabel } from './format-convention-label'

export function resolveNamingConvention({
  context,
  definition,
}: {
  context: NamingCultureContext
  definition: NamingConventionDefinition
}): NamingConvention {
  const subjectKinds = [...(definition.subjectKinds ?? getDefaultSubjectKinds(definition.key))]

  const resolved = {
    id: definition.id ?? `${context.cultureId}-${definition.key}`,
    label: definition.label ?? formatConventionLabel(context.cultureLabel, definition.key),
    description:
      definition.description ?? formatConventionDescription(context.cultureLabel, subjectKinds),
    subjectKinds,
    associations: dedupeAssociations([
      { kind: 'culture', cultureId: context.cultureId, strength: 'primary' },
      ...context.languageIds.map((languageId) => ({
        kind: 'language' as const,
        languageId,
        strength: 'primary' as const,
      })),
      ...(definition.associations ?? []),
    ]),
    structures: [...definition.structures],
    partBindings: [...definition.partBindings],
    collectionIds: [...definition.collectionIds],
    provenance: definition.provenance,
    ...(definition.tags !== undefined ? { tags: [...definition.tags] } : {}),
    version: definition.version,
  }

  return namingConventionSchema.parse(resolved)
}
