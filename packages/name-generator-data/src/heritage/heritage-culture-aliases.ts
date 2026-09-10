import type { HeritageCultureAlias } from '@rpg/contracts/name-generator'

import { HERITAGE_NAMING_CULTURES } from './heritage-naming-cultures'

/** Flattened (species, heritage) → culture routing derived from the registry. */
export const HERITAGE_CULTURE_ALIASES: readonly HeritageCultureAlias[] =
  HERITAGE_NAMING_CULTURES.flatMap((culture) =>
    culture.heritageIds.map((heritageId) => ({
      speciesSlug: culture.speciesSlug,
      heritageId,
      targetCultureId: culture.id,
    })),
  )
