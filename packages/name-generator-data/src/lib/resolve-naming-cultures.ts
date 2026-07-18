import type { NamingCulture, NamingContext } from '@rpg/contracts/name-generator'

import { STANDALONE_NAMING_CULTURES } from '../cultures/standalone-cultures'

export function getNamingCulture(cultureId: string): NamingCulture | undefined {
  return STANDALONE_NAMING_CULTURES.find((culture) => culture.id === cultureId)
}

export function getConventionCultureId(
  cultureId: string,
  cultures: readonly NamingCulture[] = STANDALONE_NAMING_CULTURES,
): string {
  const culture = cultures.find((entry) => entry.id === cultureId)
  return culture?.resolvesToCultureId ?? cultureId
}

export function buildCultureContextFields(
  selectedCultureId: string,
  cultures: readonly NamingCulture[] = STANDALONE_NAMING_CULTURES,
): Pick<
  NamingContext,
  'cultureIds' | 'conventionCultureIds' | 'cultureResolutions' | 'heritageIds'
> {
  const culture = cultures.find((entry) => entry.id === selectedCultureId)
  const conventionCultureId = culture?.resolvesToCultureId ?? selectedCultureId

  return {
    cultureIds: [selectedCultureId],
    conventionCultureIds: [conventionCultureId],
    cultureResolutions: { [selectedCultureId]: conventionCultureId },
    ...(culture?.heritageIds !== undefined ? { heritageIds: [...culture.heritageIds] } : {}),
  }
}
