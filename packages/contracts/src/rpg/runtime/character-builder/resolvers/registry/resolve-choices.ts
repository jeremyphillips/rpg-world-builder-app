import { indexCharacterBuildCatalog } from '../../context'
import type { CharacterBuildContext } from '../../context'
import type { CharacterBuilderDraft } from '../../draft/draft'
import type { ChoiceSet } from '../../choice-set'
import { CHOICE_SOURCE_RESOLVERS } from './choice-sources'

/** Resolves all pending ChoiceSets for the current draft and build context. */
export function resolveAvailableChoices(
  draft: CharacterBuilderDraft,
  context: CharacterBuildContext,
): ChoiceSet[] {
  const catalogIndex = indexCharacterBuildCatalog(context.catalog)

  return CHOICE_SOURCE_RESOLVERS.flatMap((resolver) => resolver(draft, context, catalogIndex))
}
