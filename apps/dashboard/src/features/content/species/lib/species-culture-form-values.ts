import type { SpeciesCultureConfig } from '@rpg/contracts'

import { deriveSlugForCreate } from '../../lib/forms/content-form-key-helpers'
import type { SpeciesCultureFormValues } from './species-culture-form-fields'

export function normalizeSpeciesCultureForPersist({
  slug,
  culture,
  existingCultureId,
}: {
  slug: string
  culture: SpeciesCultureFormValues
  existingCultureId?: string
}): SpeciesCultureConfig {
  const naming =
    culture.naming.supported === true
      ? {
          supported: true as const,
          ...(culture.naming.subjectKinds && culture.naming.subjectKinds.length > 0
            ? { subjectKinds: culture.naming.subjectKinds }
            : {}),
        }
      : { supported: false as const }

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
  }: {
    slug: string
    existingCultureId?: string
  },
): SpeciesCultureConfig | undefined {
  if (culture === undefined) {
    return undefined
  }

  return normalizeSpeciesCultureForPersist({ slug, culture, existingCultureId })
}
