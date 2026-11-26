import type { ContentValidationIntent } from '@rpg/contracts'
import type { FieldValues, UseFormReturn } from 'react-hook-form'
import type { FormItem, FormSubmitHandler, MapFormError } from '@rpg/ui/form'

import type { AnyContentFormDef, ContentFormCtx } from '../../registry/content-form-registry'
import type { ContentPreparedWrite } from '../../submit/content-prepared-write.types'

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
  /** Snapshot stamp for the current form values; bump on authored changes. Defaults to 0. */
  snapshotStamp?: number
  persist: FormSubmitHandler<TValues>
}
