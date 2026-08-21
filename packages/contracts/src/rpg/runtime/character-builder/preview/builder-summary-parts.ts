import type { CharacterBuilderDraftClass, CharacterBuilderDraftSpecies } from '../draft/draft'

import type { CharacterSummaryParts } from '../../character/summary/character-summary-format'
import {
  resolveSpeciesSummaryPart,
  type CharacterSummaryLabelLookup,
} from '../../character/summary/character-summary-parts'

export type { CharacterSummaryLabelLookup } from '../../character/summary/character-summary-parts'

/** Resolves builder draft selections into shared summary parts for preview chrome. */
export function resolveBuilderCharacterSummaryParts(
  draft: {
    species: Pick<CharacterBuilderDraftSpecies, 'speciesId' | 'heritageId'>
    class: Pick<CharacterBuilderDraftClass, 'classId' | 'level'>
  },
  lookup: CharacterSummaryLabelLookup,
): CharacterSummaryParts {
  const species = draft.species.speciesId
    ? resolveSpeciesSummaryPart(draft.species.speciesId, draft.species.heritageId, lookup)
    : undefined

  const classes =
    draft.class.classId && lookup.className(draft.class.classId)
      ? [
          {
            name: lookup.className(draft.class.classId)!,
            level: draft.class.level,
          },
        ]
      : []

  return {
    ...(species ? { species } : {}),
    ...(classes.length === 0 && draft.class.level === 0 ? { classlessLevel: 0 } : {}),
    classes,
  }
}
