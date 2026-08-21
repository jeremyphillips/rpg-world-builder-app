import type { CharacterSelectionSource } from '../../character/sheet/selection-sources'
import type { ChoiceSet, ChoiceSourceType } from '../choice-set'

function selectionKindForSourceType(
  sourceType: ChoiceSourceType,
): CharacterSelectionSource['kind'] {
  switch (sourceType) {
    case 'species':
      return 'speciesTrait'
    case 'heritage':
      return 'heritageOption'
    case 'class':
      return 'classFeature'
    case 'ruleset':
      return 'characterCreation'
    default:
      return 'classFeature'
  }
}

/** Maps a ChoiceSet's source metadata to stored proficiency provenance. */
export function selectionSourceFromChoiceSet(choiceSet: ChoiceSet): CharacterSelectionSource[] {
  return [
    {
      kind: selectionKindForSourceType(choiceSet.sourceType),
      sourceId: choiceSet.sourceId,
      grantId: choiceSet.id,
    },
  ]
}
