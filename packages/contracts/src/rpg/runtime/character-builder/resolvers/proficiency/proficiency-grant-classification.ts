import type { CharacterSelectionSource } from '../../../character/sheet/selection-sources'

/** Returns true when any provenance record ties the entry to a resolved ChoiceSet id. */
export function isChoiceDerivedProficiencyGrant(
  sources: CharacterSelectionSource[] | undefined,
  choiceSetIds: ReadonlySet<string>,
): boolean {
  return (
    sources?.some((source) => source.grantId !== undefined && choiceSetIds.has(source.grantId)) ??
    false
  )
}

/** Returns true when the entry is a fixed grant rather than a ChoiceSet selection outcome. */
export function isFixedProficiencyGrant(
  sources: CharacterSelectionSource[] | undefined,
  choiceSetIds: ReadonlySet<string>,
): boolean {
  return !isChoiceDerivedProficiencyGrant(sources, choiceSetIds)
}
