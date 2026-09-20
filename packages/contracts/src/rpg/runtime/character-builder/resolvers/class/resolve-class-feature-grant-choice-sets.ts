import { classFeaturesUnlockedAtLevel } from '../../../../content/classes/class-feature-availability'
import type { ChoiceSet } from '../../choice-set'
import type { CharacterBuildCatalogIndex } from '../../context'
import type { CharacterBuilderDraft } from '../../draft/draft'
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

  return classFeaturesUnlockedAtLevel(characterClass.features, draft.class.level).flatMap(
    (feature) =>
      unlockedGrantChoiceSets(
        feature,
        catalogIndex,
        {
          sourceType: 'class',
          sourceId: characterClass.id,
          slot: `feature:${feature.id}`,
          provenance: {
            ownerKind: 'class',
            ownerLabel: characterClass.name,
            featureLabel: feature.name,
          },
        },
        {
          parentLevel: feature.level,
          parentUnlock: { level: feature.level },
          grantSlot: (grant) => `feature:${feature.id}:${grant.kind}`,
        },
      ),
  )
}
