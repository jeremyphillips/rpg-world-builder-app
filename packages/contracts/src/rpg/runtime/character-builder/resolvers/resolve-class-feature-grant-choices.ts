import type { ChoiceSet } from '../choice-set'
import type { CharacterBuildCatalogIndex } from '../context'
import type { CharacterBuilderDraft } from '../draft'
import type { ChoiceSourceResolver } from './choice-source-resolver'
import { unlockedGrantChoiceSets } from './unlocked-grant-choice-sets'

export function resolveClassFeatureGrantChoices(
  draft: CharacterBuilderDraft,
  _context: Parameters<ChoiceSourceResolver>[1],
  catalogIndex: CharacterBuildCatalogIndex,
): ChoiceSet[] {
  const classId = draft.class.classId
  if (!classId) return []

  const characterClass = catalogIndex.classes.get(classId)
  if (!characterClass) return []

  return characterClass.features.flatMap((feature) => {
    if (feature.level !== 1) return []

    return unlockedGrantChoiceSets(
      feature,
      catalogIndex,
      {
        sourceType: 'class',
        sourceId: characterClass.id,
        slot: `feature:${feature.id}`,
      },
      {
        parentLevel: feature.level,
        parentUnlock: { level: feature.level },
        grantSlot: (grant) => `feature:${feature.id}:${grant.kind}`,
      },
    )
  })
}
