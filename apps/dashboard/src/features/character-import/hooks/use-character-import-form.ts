import { useId } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'

import { CHARACTER_IMPORT_DEFAULT_CHARACTER_ID } from '../model/character-import-defaults'
import {
  characterImportFormSchema,
  type CharacterImportFormValues,
} from '../model/character-import-form-schema'
import type { CharacterImportSaveTarget } from '../model/character-import-target.lib'
import { useCharacterImportPreview } from './use-character-import-preview'
import { useCharacterImportSave } from './use-character-import-save'

export type UseCharacterImportFormOptions = {
  initialInput?: string
  saveTarget?: CharacterImportSaveTarget | null
  onSaveSuccess?: (entityId: string) => void
}

export function useCharacterImportForm({
  initialInput = CHARACTER_IMPORT_DEFAULT_CHARACTER_ID,
  saveTarget = null,
  onSaveSuccess,
}: UseCharacterImportFormOptions) {
  const inputId = useId()
  const form = useForm<CharacterImportFormValues>({
    resolver: zodResolver(characterImportFormSchema),
    defaultValues: { input: initialInput },
    mode: 'onChange',
  })
  const preview = useCharacterImportPreview()
  const save = useCharacterImportSave(saveTarget, onSaveSuccess)
  const currentInput = form.watch('input')
  const canSave = Boolean(saveTarget && preview.data && onSaveSuccess)
  const isBusy = preview.isPending || save.isSaving

  const onSubmit = form.handleSubmit((values) => {
    save.setSaveError(null)
    preview.mutate(values.input)
  })

  const onResetPreview = () => {
    save.setSaveError(null)
    preview.reset()
  }

  const onSavePreview = () => {
    if (preview.data) {
      void save.saveImport(preview.data)
    }
  }

  return {
    inputId,
    form,
    preview,
    save,
    currentInput,
    canSave,
    isBusy,
    saveTarget,
    onSubmit,
    onResetPreview,
    onSavePreview,
  }
}
