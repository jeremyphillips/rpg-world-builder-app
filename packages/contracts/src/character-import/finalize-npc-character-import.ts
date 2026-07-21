import {
  createNpcRequestInputSchema,
  type CreateNpcRequestInput,
} from '../rpg/runtime/character/create-npc-input'
import type { CharacterImportResult } from './adapter/character-import-result.schema'
import {
  assembleImportCreateCharacterInput,
  type CharacterImportFinalizeOptions,
} from './assemble-import-create-input'

/**
 * Maps an adapted `CharacterImportResult` to a campaign NPC create request.
 * Sheet assembly matches PC import; ownership fields are omitted for the wire shape.
 */
export function finalizeNpcCharacterImport(
  result: CharacterImportResult,
  options: CharacterImportFinalizeOptions,
): CreateNpcRequestInput {
  const pcInput = assembleImportCreateCharacterInput(result, options)
  const { characterType: _characterType, campaignId: _campaignId, ...request } = pcInput
  return createNpcRequestInputSchema.parse(request)
}
