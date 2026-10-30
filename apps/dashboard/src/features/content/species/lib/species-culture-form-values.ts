import type { CatalogLayer, SpeciesCultureConfig } from '@rpg/contracts'

import { deriveSlugForCreate } from '../../lib/forms/registry/content-form-key-helpers'
import type { SpeciesCultureFormValues } from './species-culture-form-fields'

function buildPersistedNaming(
  culture: SpeciesCultureFormValues,
  entityCatalogLayer: CatalogLayer,
): SpeciesCultureConfig['naming'] {
  if (entityCatalogLayer === 'homebrew') {
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
  entityCatalogLayer = 'homebrew',
}: {
  slug: string
  culture: SpeciesCultureFormValues
  existingCultureId?: string
  entityCatalogLayer?: CatalogLayer
}): SpeciesCultureConfig {
  const naming = buildPersistedNaming(culture, entityCatalogLayer)

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
    entityCatalogLayer = 'homebrew',
  }: {
    slug: string
    existingCultureId?: string
    entityCatalogLayer?: CatalogLayer
  },
): SpeciesCultureConfig | undefined {
  if (culture === undefined) {
    return undefined
  }

  return normalizeSpeciesCultureForPersist({ slug, culture, existingCultureId, entityCatalogLayer })
}
