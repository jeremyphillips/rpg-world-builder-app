import type { CharacterSelectionSource } from '../../../character/sheet/selection-sources'
import { classifySelectionSourceMechanic } from './selection-source-mechanic'

/** Returns true when any provenance record is a resolved ChoiceSet outcome. */
export function isChoiceDerivedProficiencyGrant(
  sources: CharacterSelectionSource[] | undefined,
  choiceSetIds: ReadonlySet<string>,
): boolean {
  return (
    sources?.some(
      (source) => classifySelectionSourceMechanic(source, choiceSetIds) === 'choice-derived',
    ) ?? false
  )
}

/** Returns true when the entry is a fixed grant rather than a ChoiceSet selection outcome. */
export function isFixedProficiencyGrant(
  sources: CharacterSelectionSource[] | undefined,
  choiceSetIds: ReadonlySet<string>,
): boolean {
  return !isChoiceDerivedProficiencyGrant(sources, choiceSetIds)
}
