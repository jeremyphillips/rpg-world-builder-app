import { z } from 'zod'

import { nameSubjectKindSchema, NAME_SUBJECT_KINDS } from '../../name-generator/subject-kind'
import type { NameSubjectKind } from '../../name-generator/subject-kind'
import type { LanguageId } from '../vocab/language'
import { vocabularyOptionIdSchema } from '../vocab/vocabulary'
import type { ContentTrait } from './lib/grants'
import { formatSlugAsLabel } from '../primitives/format-slug'

// ---------------------------------------------------------------------------
// Species culture — cultural affiliation separate from naming capability.
// ---------------------------------------------------------------------------

/** Additional subject kinds beyond implicit `person`. Never persist `person`. */
export const speciesNamingSubjectKindSchema = nameSubjectKindSchema.exclude(['person'])

export type SpeciesNamingSubjectKind = z.infer<typeof speciesNamingSubjectKindSchema>

export const speciesNamingConfigSchema = z.discriminatedUnion('supported', [
  z.object({ supported: z.literal(false) }).strict(),
  z.object({
    supported: z.literal(true),
    subjectKinds: z.array(speciesNamingSubjectKindSchema).optional(),
  }),
])

export type SpeciesNamingConfig = z.infer<typeof speciesNamingConfigSchema>

export const speciesCultureOverrideSchema = z
  .object({
    id: vocabularyOptionIdSchema,
    name: z.string().min(1),
  })
  .strict()

export type SpeciesCultureOverride = z.infer<typeof speciesCultureOverrideSchema>

export const speciesCultureConfigSchema = z
  .object({
    id: vocabularyOptionIdSchema.optional(),
    name: z.string().min(1).optional(),
    naming: speciesNamingConfigSchema,
  })
  .superRefine((value, ctx) => {
    const hasId = value.id !== undefined
    const hasName = value.name !== undefined
    if (hasId !== hasName) {
      ctx.addIssue({
        code: 'custom',
        message: 'Culture id and name must be provided together.',
        path: hasId ? ['name'] : ['id'],
      })
    }
  })

export type SpeciesCultureConfig = z.infer<typeof speciesCultureConfigSchema>

const PERSON_SUBJECT_KIND = 'person' as const satisfies NameSubjectKind

export type SpeciesCultureResolutionInput = {
  slug: string
  culture?: SpeciesCultureConfig
}

export function getSpeciesCulturePrimaryId({
  slug,
  culture,
}: SpeciesCultureResolutionInput): string {
  return culture?.id ?? slug
}

export function hasSpeciesCultureOverride({
  culture,
}: {
  culture?: SpeciesCultureConfig
}): boolean {
  return culture?.id !== undefined
}

export function getSpeciesCultureDisplayName({
  slug,
  culture,
  cultures,
}: SpeciesCultureResolutionInput & {
  cultures?: ReadonlyArray<{ id: string; label: string }>
}): string {
  if (culture?.name !== undefined) {
    return culture.name
  }

  const resolvedId = getSpeciesCulturePrimaryId({ slug, culture })
  const registryLabel = cultures?.find((entry) => entry.id === resolvedId)?.label
  return registryLabel ?? formatSlugAsLabel(resolvedId)
}

export function isSpeciesNamingSupported(species: { culture?: SpeciesCultureConfig }): boolean {
  return species.culture?.naming.supported === true
}

export function getSpeciesNamingSubjectKinds(species: {
  culture?: SpeciesCultureConfig
}): NameSubjectKind[] {
  if (!isSpeciesNamingSupported(species) || species.culture?.naming.supported !== true) {
    return []
  }

  const additional = species.culture.naming.subjectKinds ?? []
  const merged = new Set<NameSubjectKind>([PERSON_SUBJECT_KIND, ...additional])
  return NAME_SUBJECT_KINDS.filter((kind) => merged.has(kind))
}

export function getSpeciesLanguageAffinity(species: {
  languageAffinities?: readonly LanguageId[]
}): LanguageId[] {
  return [...(species.languageAffinities ?? [])]
}

function collectLanguageIdsFromTrait(trait: ContentTrait): LanguageId[] {
  if (trait.kind !== 'grant') {
    return []
  }

  const languageIds: LanguageId[] = []
  for (const group of trait.grantGroups) {
    for (const grant of group.grants) {
      if (grant.kind === 'languages') {
        languageIds.push(...grant.languageIds)
      }
    }
  }

  return languageIds
}

export function getHeritageLanguageAffinity(heritageOption: ContentTrait): LanguageId[] {
  return collectLanguageIdsFromTrait(heritageOption)
}

export function getEffectiveSpeciesLanguageAffinity({
  species,
  heritageOption,
}: {
  species: { languageAffinities?: readonly LanguageId[] }
  heritageOption?: ContentTrait
}): LanguageId[] {
  const heritageLanguages =
    heritageOption === undefined ? [] : getHeritageLanguageAffinity(heritageOption)
  if (heritageLanguages.length > 0) {
    return heritageLanguages
  }

  return getSpeciesLanguageAffinity(species)
}
