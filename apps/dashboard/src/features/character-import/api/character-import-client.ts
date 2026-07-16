import { postJson } from '@/lib/api-client'
import type { CharacterImportResult } from '@rpg/contracts/character-import'

export async function previewDndBeyondCharacterImport(
  input: string,
): Promise<CharacterImportResult> {
  const body = await postJson<{ result: CharacterImportResult }>(
    '/api/character-import/dnd-beyond/preview',
    { input },
    'Could not preview the D&D Beyond character.',
  )
  return body.result
}
