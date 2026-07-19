import { CharacterImportFinalizationError } from '@rpg/contracts/character-import'

export function formatCharacterImportFinalizationError(error: unknown): string | null {
  if (error instanceof CharacterImportFinalizationError) {
    return error.issues.map((issue) => issue.message).join(' ')
  }

  return null
}
