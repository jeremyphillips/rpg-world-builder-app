import type { ContentSource, SpeciesCultureConfig } from '@rpg/contracts'

import { deriveSlugForCreate } from '../../lib/forms/content-form-key-helpers'
import type { SpeciesCultureFormValues } from './species-culture-form-fields'

function buildPersistedNaming(
  culture: SpeciesCultureFormValues,
  entitySource: ContentSource,
): SpeciesCultureConfig['naming'] {
  if (entitySource === 'homebrew') {
    return { supported: false }
  }

  if (culture.naming.supported !== true) {
    return { supported: false }
  }

  return {
    supported: true,
    ...(culture.naming.personalNameComponents && culture.naming.personalNameComponents.length > 0
      ? { personalNameComponents: culture.naming.personalNameComponents }
      : {}),
  }
}

export function normalizeSpeciesCultureForPersist({
  slug,
  culture,
  existingCultureId,
  entitySource = 'homebrew',
}: {
  slug: string
  culture: SpeciesCultureFormValues
  existingCultureId?: string
  entitySource?: ContentSource
}): SpeciesCultureConfig {
  const naming = buildPersistedNaming(culture, entitySource)

  if (culture.useOverride !== true) {
    return { naming }
  }

  const trimmedName = culture.name?.trim()
  if (trimmedName === undefined || trimmedName === '') {
    return { naming }
  }

  const cultureId = existingCultureId ?? culture.id ?? deriveSlugForCreate(trimmedName)
  if (cultureId === slug) {
    return { naming }
  }

  return {
    id: cultureId,
    name: trimmedName,
    naming,
  }
}

export function cultureFromFormValues(
  culture: SpeciesCultureFormValues | undefined,
  {
    slug,
    existingCultureId,
    entitySource = 'homebrew',
  }: {
    slug: string
    existingCultureId?: string
    entitySource?: ContentSource
  },
): SpeciesCultureConfig | undefined {
  if (culture === undefined) {
    return undefined
  }

  return normalizeSpeciesCultureForPersist({ slug, culture, existingCultureId, entitySource })
}
