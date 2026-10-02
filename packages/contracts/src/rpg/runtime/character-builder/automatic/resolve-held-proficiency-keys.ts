import { assembleCharacterProficiencies } from '../assembly/assemble-proficiencies'
import type { ChoiceSet } from '../choice-set'
import { indexCharacterBuildCatalog, type CharacterBuildContext } from '../context'
import type { CharacterBuilderDraft } from '../draft/draft'
import { addOptionIdentityKeys } from '../option-identity'

/**
 * Proficiency ids the builder already treats as granted.
 * Derived from finalize-equivalent assembly so later picks skip them
 * without counting them toward a required choice.
 */
export function resolveHeldProficiencyKeys(
  draft: CharacterBuilderDraft,
  context: CharacterBuildContext,
  choiceSets: readonly ChoiceSet[],
  options?: { excludeChoiceSetId?: string },
): Set<string> {
  const excludeChoiceSetId = options?.excludeChoiceSetId
  const assemblyDraft = excludeChoiceSetId
    ? {
        ...draft,
        choiceSelections: {
          ...draft.choiceSelections,
          [excludeChoiceSetId]: [],
        },
      }
    : draft
  const catalogIndex = indexCharacterBuildCatalog(context.catalog)
  const characterClass = assemblyDraft.class.classId
    ? catalogIndex.classes.get(assemblyDraft.class.classId)
    : undefined
  const proficiencies = assembleCharacterProficiencies(
    assemblyDraft,
    catalogIndex,
    choiceSets,
    characterClass,
    context,
  )
  const keys = new Set<string>()

  for (const entry of proficiencies.skills) addOptionIdentityKeys(keys, entry.skill)
  for (const entry of proficiencies.tools) {
    if (entry.toolId) addOptionIdentityKeys(keys, entry.toolId)
  }
  for (const entry of proficiencies.languages) addOptionIdentityKeys(keys, entry.language)

  return keys
}
