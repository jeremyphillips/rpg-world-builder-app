import { z } from 'zod'

import { personalNameComponentSchema } from '../../name-generator/personal-name-component'
import type { PersonalNameComponent } from '../../name-generator/personal-name-component'
import type { LanguageId } from '../vocab/language'
import { vocabularyOptionIdSchema } from '../vocab/vocabulary'
import type { ContentTrait } from './lib/grants'
import { formatSlugAsLabel } from '../primitives/format-slug'

// ---------------------------------------------------------------------------
// Species culture — cultural affiliation separate from naming capability.
// ---------------------------------------------------------------------------

export const speciesNamingConfigSchema = z.discriminatedUnion('supported', [
  z.object({ supported: z.literal(false) }).strict(),
  z.object({
    supported: z.literal(true),
    personalNameComponents: z.array(personalNameComponentSchema).optional(),
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

export function getSpeciesPersonalNameComponents(species: {
  culture?: SpeciesCultureConfig
}): PersonalNameComponent[] {
  if (!isSpeciesNamingSupported(species) || species.culture?.naming.supported !== true) {
    return []
  }

  return [...(species.culture.naming.personalNameComponents ?? [])]
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
