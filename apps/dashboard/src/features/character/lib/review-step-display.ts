import {
  getAlignmentLabel,
  validateCharacterBuild,
  type CharacterBuildContext,
  type CharacterBuilderDraft,
  type CharacterBuildValidationIssue,
  type ChoiceSet,
} from '@rpg/contracts'

export function resolveReviewReadyMessage(
  draft: CharacterBuilderDraft,
  context: CharacterBuildContext,
  displayIssues: CharacterBuildValidationIssue[],
  resolvedChoiceSets: readonly ChoiceSet[],
): string | null {
  if (displayIssues.length > 0) return null

  const validation = validateCharacterBuild(draft, context, 'finalSubmit', {
    resolvedChoiceSets,
  })

  return validation.ok
    ? 'Your character is ready to create.'
    : 'Resolve the issues above before creating your character.'
}

export function formatAbilityMethodLabel(
  method: CharacterBuilderDraft['abilities']['method'],
): string {
  if (method === 'manual') return 'Manual entry'
  if (method === 'standard-array') return 'Standard array'
  return 'Not set'
}

export function resolveCatalogEntryName(
  entries: ReadonlyArray<{ id: string; name: string }>,
  entryId: string | undefined,
): string {
  return entries.find((entry) => entry.id === entryId)?.name ?? 'Not selected'
}

export function formatReviewAlignment(
  alignment: CharacterBuilderDraft['identity']['alignment'],
): string {
  return alignment ? getAlignmentLabel(alignment) : 'Not set'
}
