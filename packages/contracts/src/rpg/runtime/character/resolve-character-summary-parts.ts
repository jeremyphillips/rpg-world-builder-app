import type {
  CharacterBuilderDraftClass,
  CharacterBuilderDraftSpecies,
} from '../character-builder/draft/draft'

import type { CharacterSummaryParts } from './character-summary-format'
import type { Character } from './sheet'

export type CharacterSummaryLabelLookup = {
  speciesName: (speciesId: string) => string | undefined
  heritageName?: (speciesId: string, heritageId: string) => string | undefined
  className: (classId: string) => string | undefined
  subclassName?: (subclassId: string) => string | undefined
}

function resolveSpeciesPart(
  speciesId: string,
  heritageId: string | undefined,
  lookup: CharacterSummaryLabelLookup,
): CharacterSummaryParts['species'] | undefined {
  const name = lookup.speciesName(speciesId)
  if (!name) {
    return undefined
  }

  const heritageName =
    heritageId && lookup.heritageName ? lookup.heritageName(speciesId, heritageId) : undefined

  return heritageName ? { name, heritageName } : { name }
}

function resolveClassParts(
  classes: Character['classes'],
  lookup: CharacterSummaryLabelLookup,
): CharacterSummaryParts['classes'] {
  return classes.flatMap((entry) => {
    const name = lookup.className(entry.classId)
    if (!name) {
      return []
    }

    const subclassName =
      entry.subclassId && lookup.subclassName ? lookup.subclassName(entry.subclassId) : undefined

    return [
      {
        name,
        level: entry.level,
        ...(subclassName ? { subclassName } : {}),
      },
    ]
  })
}

export function resolveCharacterSummaryParts(
  character: Pick<Character, 'classes' | 'species'>,
  lookup: CharacterSummaryLabelLookup,
): CharacterSummaryParts {
  const species = resolveSpeciesPart(character.species.id, character.species.heritageId, lookup)

  return {
    ...(species ? { species } : {}),
    ...(character.classes.length === 0 ? { classlessLevel: 0 } : {}),
    classes: resolveClassParts(character.classes, lookup),
  }
}

export function resolveBuilderCharacterSummaryParts(
  draft: {
    species: Pick<CharacterBuilderDraftSpecies, 'speciesId' | 'heritageId'>
    class: Pick<CharacterBuilderDraftClass, 'classId' | 'level'>
  },
  lookup: CharacterSummaryLabelLookup,
): CharacterSummaryParts {
  const species = draft.species.speciesId
    ? resolveSpeciesPart(draft.species.speciesId, draft.species.heritageId, lookup)
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
