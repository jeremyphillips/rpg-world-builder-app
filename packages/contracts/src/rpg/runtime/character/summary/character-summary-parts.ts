import type { CharacterSummaryParts } from './character-summary-format'
import type { Character } from '../sheet'

export type CharacterSummaryLabelLookup = {
  speciesName: (speciesId: string) => string | undefined
  heritageName?: (speciesId: string, heritageId: string) => string | undefined
  className: (classId: string) => string | undefined
  subclassName?: (subclassId: string) => string | undefined
}

export function resolveSpeciesSummaryPart(
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
  const species = resolveSpeciesSummaryPart(
    character.species.id,
    character.species.heritageId,
    lookup,
  )

  return {
    ...(species ? { species } : {}),
    ...(character.classes.length === 0 ? { classlessLevel: 0 } : {}),
    classes: resolveClassParts(character.classes, lookup),
  }
}
