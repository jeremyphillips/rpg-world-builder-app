import type { ContentValidationIntent } from '@rpg/contracts'
import type { FieldValues, UseFormReturn } from 'react-hook-form'
import type { FormItem, MapFormError } from '@rpg/ui/form'

import type { AnyContentFormDef, ContentFormCtx } from '../../registry/content-form-registry'
import type { ContentPreparedWrite } from '../../submit/content-prepared-write.types'
import type { ContentFormSubmitProducerBinding } from './content-form-submit-producer-binding.client'

/** Internal sentinel — commit validation failed after field errors were applied. */
export class ContentFormSubmitValidationFailed extends Error {
  constructor() {
    super('Content form commit validation failed.')
    this.name = 'ContentFormSubmitValidationFailed'
  }
}

/** Internal sentinel — a newer attempt or snapshot made this submit stale; show nothing. */
export class ContentFormSubmitSuperseded extends Error {
  constructor() {
    super('Content form submit was superseded.')
    this.name = 'ContentFormSubmitSuperseded'
  }
}

export type ContentFormInvalidPresentation = {
  resolverFields: FormItem[]
  formId: string
  resolveViewForPath?: (path: string) => string | undefined
  activateView?: (viewId: string) => void
}

/** Passed to content persist handlers so baseline sync can refuse stale attempts. */
export type ContentFormPersistMeta = {
  isAttemptCurrent: () => boolean
}

export type ContentFormPersistHandler<TValues extends FieldValues> = (
  values: TValues,
  form: UseFormReturn<TValues>,
  meta?: ContentFormPersistMeta,
) => Promise<void>

export type UseContentFormSubmitOptions<TValues extends FieldValues> = {
  def: AnyContentFormDef
  ctx: ContentFormCtx
  commitValidationIntent?: ContentValidationIntent
  fallbackMessage: string
  mapError?: MapFormError
  invalidPresentation?: ContentFormInvalidPresentation
  prepareCommitValues?: (values: TValues) => TValues
  writeSchema?: import('zod').ZodType<unknown>
  prepareWrite?: (values: TValues, form: UseFormReturn<TValues>) => ContentPreparedWrite<unknown>
  persist: ContentFormPersistHandler<TValues>
  /** Share one producer session between publish and draft submit hooks on create. */
  producerBinding?: ContentFormSubmitProducerBinding
  /**
   * When false, this hook does not mount stamp watch or producer chrome (use the primary hook's
   * {@link UseContentFormSubmitResult.ProducerBoundary}).
   */
  mountProducerChrome?: boolean
}
