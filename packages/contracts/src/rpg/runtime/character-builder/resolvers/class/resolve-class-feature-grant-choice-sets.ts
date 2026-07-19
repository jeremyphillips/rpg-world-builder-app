import type { ChoiceSet } from '../../choice-set'
import type { CharacterBuildCatalogIndex } from '../../context'
import type { CharacterBuilderDraft } from '../../draft'
import { unlockedGrantChoiceSets } from '../grants/unlocked-grant-choice-sets'

/** Builds class feature grant ChoiceSets unlocked at the draft class level. */
export function resolveClassFeatureGrantChoiceSets(
  draft: CharacterBuilderDraft,
  catalogIndex: CharacterBuildCatalogIndex,
): ChoiceSet[] {
  const classId = draft.class.classId
  if (!classId) return []

  const characterClass = catalogIndex.classes.get(classId)
  if (!characterClass) return []

  return characterClass.features.flatMap((feature) => {
    if (feature.level > draft.class.level) return []

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
