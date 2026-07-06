import type { ChoiceSet } from '../choice-set'
import type { CharacterBuildCatalogIndex, CharacterBuildContext } from '../context'
import type { CharacterBuilderDraft } from '../draft'

/** Uniform signature for internal choice-source modules in {@link CHOICE_SOURCE_RESOLVERS}. */
export type ChoiceSourceResolver = (
  draft: CharacterBuilderDraft,
  context: CharacterBuildContext,
  catalogIndex: CharacterBuildCatalogIndex,
) => ChoiceSet[]
