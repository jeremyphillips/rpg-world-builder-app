import { assembleCharacterBuildSheet } from './finalize'
import type { CharacterBuildContext } from '../context'
import {
  createNpcRequestInputSchema,
  type CreateNpcRequestInput,
} from '../../character/create-npc-input'
import type { CharacterBuilderDraft } from '../draft/draft'
import type { CharacterBuildEngineOptions } from '../engine-options'

/**
 * Assembles a `CreateNpcRequestInput` after finalSubmit validation.
 * Sheet assembly matches PC build; ownership fields are omitted for the wire shape.
 */
export function finalizeNpcCharacterBuild(
  draft: CharacterBuilderDraft,
  context: CharacterBuildContext,
  options: CharacterBuildEngineOptions = {},
): CreateNpcRequestInput {
  const sheet = assembleCharacterBuildSheet(draft, context, options)
  return createNpcRequestInputSchema.parse(sheet)
}
