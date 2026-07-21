import type { CreateCharacterInput } from '../rpg/runtime/character/create-input'
import type { CharacterImportResult } from './adapter/character-import-result.schema'
import {
  assembleImportCreateCharacterInput,
  type CharacterImportFinalizeOptions,
} from './assemble-import-create-input'

/**
 * Maps an adapted `CharacterImportResult` to a standalone PC create input.
 * Does not persist — callers POST to `/api/characters`.
 */
export function finalizeCharacterImport(
  result: CharacterImportResult,
  options: CharacterImportFinalizeOptions,
): CreateCharacterInput {
  return assembleImportCreateCharacterInput(result, options)
}
