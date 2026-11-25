import type { ContentValidationIntent } from '@rpg/contracts'
import type { FieldValues, UseFormReturn } from 'react-hook-form'

import {
  serializeContentFormInput,
  type ContentFormSerializeOperation,
  type SerializeContentFormInputOptions,
} from '../registry/content-form-serialize-input.lib'
import type { AnyContentFormDef, ContentFormInputCtx } from '../registry/content-form-registry'
import {
  assertContentPreparedWritePairing,
  buildIdentityPreparedWrite,
  type ContentPreparedWrite,
} from './content-prepared-write.types'

export type PrepareSerializedContentFormWriteInput<TValues extends FieldValues> = {
  def: Pick<
    AnyContentFormDef,
    'supportsManagedMedia' | 'mediaDomain' | 'routeKey' | 'toInput' | 'normalizeOverlayBody'
  >
  values: TValues
  form: UseFormReturn<TValues>
  inputCtx: ContentFormInputCtx<unknown> | undefined
  validationIntent: ContentValidationIntent
  operation: ContentFormSerializeOperation
  rulesetId?: string
  prepareFormValues?: (values: TValues) => TValues
  serializeOptions?: Omit<
    SerializeContentFormInputOptions,
    'operation' | 'dirtyFields' | 'rulesetId'
  >
}

export function prepareSerializedContentFormWrite<TValues extends FieldValues>(
  input: PrepareSerializedContentFormWriteInput<TValues>,
): ContentPreparedWrite<Record<string, unknown>> {
  const preparedValues = input.prepareFormValues?.(input.values) ?? input.values
  const payload = serializeContentFormInput(
    input.def,
    preparedValues,
    input.inputCtx,
    input.validationIntent,
    {
      operation: input.operation,
      dirtyFields: input.form.formState.dirtyFields as Record<string, unknown> | undefined,
      rulesetId: input.rulesetId,
      ...input.serializeOptions,
    },
  )

  const prepared = buildIdentityPreparedWrite(payload)
  assertContentPreparedWritePairing(prepared)
  return prepared
}
