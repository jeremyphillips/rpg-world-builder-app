'use client'

import { useId } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'

import { ApiError } from '@rpg/contracts'
import { getCharacterImportErrorAlert } from '@rpg/contracts/character-import'
import { Alert, Button, Input, Text } from '@rpg/ui'

import { useCharacterImportPreview } from '../hooks/use-character-import-preview'
import { CHARACTER_IMPORT_DEFAULT_CHARACTER_ID } from '../model/character-import-defaults'
import {
  characterImportFormSchema,
  type CharacterImportFormValues,
} from '../model/character-import-form-schema'
import { CharacterImportPreview } from './character-import-preview.client'

export type CharacterImportFormProps = {
  initialInput?: string
}

function CharacterImportFormAlerts({ error }: { error: unknown }) {
  const importError = error instanceof ApiError ? getCharacterImportErrorAlert(error.code) : null
  const genericError = error && !importError ? 'Could not preview the D&D Beyond character.' : null

  if (!importError && !genericError) return null

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
    </>
  )
}

export function CharacterImportForm({
  initialInput = CHARACTER_IMPORT_DEFAULT_CHARACTER_ID,
}: CharacterImportFormProps) {
  const inputId = useId()
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    watch,
  } = useForm<CharacterImportFormValues>({
    resolver: zodResolver(characterImportFormSchema),
    defaultValues: { input: initialInput },
    mode: 'onChange',
  })

  const { mutate, data, error, isPending, reset } = useCharacterImportPreview()
  const currentInput = watch('input')

  const onSubmit = handleSubmit((values) => {
    mutate(values.input)
  })

  return (
    <div className="flex flex-col gap-6">
      <Alert
        variant="default"
        title="Experimental import"
        description="This preview fetches a public D&D Beyond character and shows what can be extracted. Characters are not saved from this screen."
      />

      <form className="flex flex-col gap-4" onSubmit={onSubmit} noValidate>
        <div className="flex flex-col gap-2">
          <label htmlFor={inputId}>
            <Text variant="emphasis">Character ID or URL</Text>
          </label>
          <Input
            id={inputId}
            {...register('input')}
            placeholder={`${CHARACTER_IMPORT_DEFAULT_CHARACTER_ID} or https://www.dndbeyond.com/characters/…`}
            disabled={isPending}
            aria-invalid={errors.input ? true : undefined}
          />
          {errors.input ? (
            <Text variant="destructive" role="alert">
              {errors.input.message}
            </Text>
          ) : null}
        </div>

        <div className="flex flex-wrap gap-2">
          <Button type="submit" disabled={isPending || !isValid}>
            {isPending ? 'Loading preview…' : 'Preview import'}
          </Button>
          {data ? (
            <Button type="button" variant="outline" disabled={isPending} onClick={() => reset()}>
              Load another character
            </Button>
          ) : null}
        </div>
      </form>

      <CharacterImportFormAlerts error={error} />

      {data ? <CharacterImportPreview result={data} key={currentInput} /> : null}
    </div>
  )
}
