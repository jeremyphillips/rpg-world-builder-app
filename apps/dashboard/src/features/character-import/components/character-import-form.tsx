import { ApiError } from '@rpg/contracts'
import { getCharacterImportErrorAlert } from '@rpg/contracts/character-import'
import { Alert, Button, Input, Text } from '@rpg/ui'
import type { FieldErrors, UseFormRegister } from 'react-hook-form'

import { CHARACTER_IMPORT_DEFAULT_CHARACTER_ID } from '../model/character-import-defaults'
import type { CharacterImportFormValues } from '../model/character-import-form-schema'
import type { CharacterImportSaveTarget } from '../model/character-import-target.lib'
import { useCharacterImportForm } from '../hooks/use-character-import-form'
import { CharacterImportPreview } from './character-import-preview'

export type CharacterImportFormProps = {
  initialInput?: string
  saveTarget?: CharacterImportSaveTarget | null
  onSaveSuccess?: (entityId: string) => void
}

function CharacterImportFormAlerts({
  error,
  saveError,
}: {
  error: unknown
  saveError: string | null
}) {
  const importError = error instanceof ApiError ? getCharacterImportErrorAlert(error.code) : null
  const genericError = error && !importError ? 'Could not preview the D&D Beyond character.' : null

  if (!importError && !genericError && !saveError) return null

  return (
    <>
      {importError ? (
        <Alert
          variant="destructive"
          title={importError.title}
          description={importError.description}
        />
      ) : null}
      {genericError ? (
        <Alert variant="destructive" title="Import preview failed" description={genericError} />
      ) : null}
      {saveError ? (
        <Alert variant="destructive" title="Import save failed" description={saveError} />
      ) : null}
    </>
  )
}

function CharacterImportInputField({
  inputId,
  register,
  errors,
  disabled,
}: {
  inputId: string
  register: UseFormRegister<CharacterImportFormValues>
  errors: FieldErrors<CharacterImportFormValues>
  disabled: boolean
}) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={inputId}>
        <Text variant="emphasis">Character ID or URL</Text>
      </label>
      <Input
        id={inputId}
        {...register('input')}
        placeholder={`${CHARACTER_IMPORT_DEFAULT_CHARACTER_ID} or https://www.dndbeyond.com/characters/…`}
        disabled={disabled}
        aria-invalid={errors.input ? true : undefined}
      />
      {errors.input ? (
        <Text variant="destructive" role="alert">
          {errors.input.message}
        </Text>
      ) : null}
    </div>
  )
}

function CharacterImportFormActions({
  canSave,
  hasPreview,
  isBusy,
  isSaving,
  isValid,
  saveTarget,
  onSavePreview,
  onResetPreview,
  isPreviewPending,
}: {
  canSave: boolean
  hasPreview: boolean
  isBusy: boolean
  isSaving: boolean
  isValid: boolean
  saveTarget: CharacterImportSaveTarget | null
  onSavePreview: () => void
  onResetPreview: () => void
  isPreviewPending: boolean
}) {
  return (
    <div className="flex flex-wrap gap-2">
      <Button type="submit" disabled={isBusy || !isValid}>
        {isPreviewPending ? 'Loading preview…' : 'Preview import'}
      </Button>
      {canSave && saveTarget ? (
        <Button type="button" disabled={isSaving} onClick={onSavePreview}>
          {isSaving ? saveTarget.savingLabel : saveTarget.saveLabel}
        </Button>
      ) : null}
      {hasPreview ? (
        <Button type="button" variant="outline" disabled={isBusy} onClick={onResetPreview}>
          Load another character
        </Button>
      ) : null}
    </div>
  )
}

export function CharacterImportForm(props: CharacterImportFormProps) {
  const {
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
  } = useCharacterImportForm(props)

  return (
    <div className="flex flex-col gap-6">
      <Alert
        variant="default"
        title="Experimental import"
        description="This flow fetches a public D&D Beyond character, shows what can be extracted, and can save mapped fields when catalog context is available."
      />

      <form className="flex flex-col gap-4" onSubmit={onSubmit} noValidate>
        <CharacterImportInputField
          inputId={inputId}
          register={form.register}
          errors={form.formState.errors}
          disabled={isBusy}
        />
        <CharacterImportFormActions
          canSave={canSave}
          hasPreview={Boolean(preview.data)}
          isBusy={isBusy}
          isSaving={save.isSaving}
          isValid={form.formState.isValid}
          saveTarget={saveTarget}
          onSavePreview={onSavePreview}
          onResetPreview={onResetPreview}
          isPreviewPending={preview.isPending}
        />
      </form>

      <CharacterImportFormAlerts error={preview.error} saveError={save.saveError} />

      {preview.data ? <CharacterImportPreview result={preview.data} key={currentInput} /> : null}
    </div>
  )
}
