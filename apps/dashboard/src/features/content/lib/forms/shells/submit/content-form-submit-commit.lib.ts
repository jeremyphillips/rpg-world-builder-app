import type { ContentValidationIntent } from '@rpg/contracts'
import type { FieldValues, UseFormReturn } from 'react-hook-form'
import type { ZodType } from 'zod'
import {
  FORM_ACTION_SUPERSEDED_STAGE_ID,
  type FormActionAttempt,
  type FormIssue,
  type FormItem,
  type FormSubmitHandler,
  type FormUiContextValue,
  type FormValidationProducerSession,
  type FormValidationProducerSlot,
} from '@rpg/ui/form'

import { runContentFormCommitPipeline } from '../../submit/content-form-commit-pipeline.lib'
import type { ContentPreparedWrite } from '../../submit/content-prepared-write.types'
import { normalizeContentFormIssues } from '../../validation/normalize-content-form-issues.lib'
import {
  applyCanonicalFormIssuesToRhf,
  ingestContentFormValidationIssues,
} from '../../validation/ingest-content-form-validation.lib'
import type { ContentFormInvalidPresentation } from './content-form-submit-types.lib'
import {
  presentContentFormInvalidSubmit,
  presentPersistValidationFailure,
} from './content-form-submit-presentation.lib'

export type ContentFormCommitRunInput<TValues extends FieldValues> = {
  values: TValues
  form: UseFormReturn<TValues>
  publishSchema: ZodType<TValues>
  writeSchema?: ZodType<unknown>
  resolverFields: FormItem[]
  producerSlot: FormValidationProducerSlot
  commitValidationIntent: ContentValidationIntent
  prepareCommitValues?: (values: TValues) => TValues
  prepareWrite?: (values: TValues, form: UseFormReturn<TValues>) => ContentPreparedWrite<unknown>
  attempt: FormActionAttempt
  readCurrent: () => FormActionAttempt
  invalidPresentation?: ContentFormInvalidPresentation
  ui: Pick<
    FormUiContextValue,
    'markSubmitAttempted' | 'markPublishAttempted' | 'addValidationSessionExpandKeys'
  > | null
  producerSession: FormValidationProducerSession
  persist: FormSubmitHandler<TValues>
}

export type ContentFormCommitRunResult =
  | { kind: 'success'; session: FormValidationProducerSession }
  | { kind: 'validation-blocked'; session: FormValidationProducerSession }
  | { kind: 'superseded'; session: FormValidationProducerSession }
  | { kind: 'persist-failed'; session: FormValidationProducerSession; error: unknown }

export async function runContentFormCommitAttempt<TValues extends FieldValues>(
  input: ContentFormCommitRunInput<TValues>,
): Promise<ContentFormCommitRunResult> {
  const { attempt, readCurrent } = input
  const { stamp } = attempt
  const isCurrent = () => {
    const current = readCurrent()
    return current.stamp === attempt.stamp && current.attemptId === attempt.attemptId
  }

  const pipeline = await runContentFormCommitPipeline(
    { values: input.values, form: input.form },
    {
      attempt,
      readCurrent,
      formSchema: input.publishSchema,
      writeSchema: input.writeSchema,
      resolverFields: input.resolverFields,
      producerSlot: input.producerSlot,
      prepareCommitValues: input.prepareCommitValues,
      prepareWrite: input.prepareWrite,
    },
  )

  if (pipeline.kind === 'blocked') {
    if (pipeline.stageId === FORM_ACTION_SUPERSEDED_STAGE_ID) {
      return { kind: 'superseded', session: input.producerSession }
    }
    const session = applyCommitValidationBlocked(input, pipeline, stamp)
    return { kind: 'validation-blocked', session }
  }

  const commitValues = pipeline.prepared.payload as TValues

  try {
    await input.persist(commitValues, input.form)
    // A request already sent cannot be cancelled; its late result must not repaint a newer attempt.
    if (!isCurrent()) return { kind: 'superseded', session: input.producerSession }
    const session = ingestContentFormValidationIssues(
      input.producerSession,
      input.producerSlot,
      stamp,
      [],
    )
    return { kind: 'success', session }
  } catch (error) {
    if (!isCurrent()) return { kind: 'superseded', session: input.producerSession }
    const session = presentPersistValidationFailure(
      input.form,
      error,
      input.invalidPresentation,
      input.ui,
      input.producerSession,
      stamp,
    )
    return { kind: 'persist-failed', session, error }
  }
}

function applyCommitValidationBlocked<TValues extends FieldValues>(
  input: ContentFormCommitRunInput<TValues>,
  pipeline: { issues?: readonly FormIssue[]; message?: string },
  stamp: number,
): FormValidationProducerSession {
  if (input.commitValidationIntent === 'publish') {
    input.ui?.markPublishAttempted()
  }

  let session = input.producerSession
  const { resolverFields: fields, publishSchema, values } = input

  if (pipeline.issues?.length) {
    session = ingestContentFormValidationIssues(session, input.producerSlot, stamp, pipeline.issues)
    applyCanonicalFormIssuesToRhf(input.form, pipeline.issues)
  } else if (pipeline.message && fields.length > 0) {
    const routed = normalizeContentFormIssues(publishSchema, values, fields) ?? [
      {
        path: '',
        message: pipeline.message,
        severity: 'crossRow' as const,
      },
    ]
    session = ingestContentFormValidationIssues(session, input.producerSlot, stamp, routed)
    applyCanonicalFormIssuesToRhf(input.form, routed)
  }

  if (input.invalidPresentation) {
    presentContentFormInvalidSubmit(input.form, input.ui, input.invalidPresentation, {
      firstInvalidPath: pipeline.issues?.[0]?.path,
    })
  }

  return session
}
