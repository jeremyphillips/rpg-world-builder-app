import { useState } from 'react'

import {
  finalizeCharacterImport,
  finalizeNpcCharacterImport,
  type CharacterImportResult,
} from '@rpg/contracts/character-import'

import { useCreateCharacter } from '@/features/character/hooks/use-create-character'
import { useCreateNpc } from '@/features/character/npc/hooks/use-create-npc'

import { formatCharacterImportFinalizationError } from '../model/character-import-save.lib'
import type { CharacterImportSaveTarget } from '../model/character-import-target.lib'

function toFinalizeOptions(saveTarget: CharacterImportSaveTarget) {
  return {
    rulesetId: saveTarget.rulesetId,
    catalogIndex: saveTarget.catalogIndex,
    defaultAlignment: saveTarget.defaultAlignment,
  }
}

export function useCharacterImportSave(
  saveTarget: CharacterImportSaveTarget | null,
  onSaveSuccess?: (entityId: string) => void,
) {
  const [saveError, setSaveError] = useState<string | null>(null)
  const createCharacter = useCreateCharacter()
  const createNpc = useCreateNpc()
  const isSaving = createCharacter.isPending || createNpc.isPending

  const saveImport = async (result: CharacterImportResult) => {
    if (!saveTarget || !onSaveSuccess) return

    setSaveError(null)
    const options = toFinalizeOptions(saveTarget)

    try {
      if (saveTarget.characterKind === 'npc') {
        if (!saveTarget.campaignId) {
          setSaveError('Campaign context is required to save an imported NPC.')
          return
        }

        const input = finalizeNpcCharacterImport(result, options)
        const npc = await createNpc.mutateAsync({
          campaignId: saveTarget.campaignId,
          input,
        })
        onSaveSuccess(npc.character.id)
        return
      }

      const input = finalizeCharacterImport(result, options)
      const character = await createCharacter.mutateAsync(input)
      onSaveSuccess(character.id)
    } catch (caught) {
      setSaveError(
        formatCharacterImportFinalizationError(caught) ??
          saveTarget.saveErrorDefault ??
          'Could not save the imported character.',
      )
    }
  }

  return {
    saveError,
    setSaveError,
    isSaving,
    saveImport,
  }
}
