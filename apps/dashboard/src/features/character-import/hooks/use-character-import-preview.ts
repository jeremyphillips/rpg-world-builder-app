import { useMutation } from '@tanstack/react-query'

import { previewDndBeyondCharacterImport } from '../api/character-import-client'

export const characterImportPreviewMutationKey = [
  'character-import',
  'dnd-beyond',
  'preview',
] as const

export function useCharacterImportPreview() {
  return useMutation({
    mutationKey: characterImportPreviewMutationKey,
    mutationFn: previewDndBeyondCharacterImport,
  })
}
