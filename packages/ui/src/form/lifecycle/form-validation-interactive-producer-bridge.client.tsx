'use client'

import { useEffect } from 'react'
import { useFormState, useWatch } from 'react-hook-form'

import { useFormUiContext } from '../context/form-ui.context'
import { prepareFormIssues } from '../errors/resolve-invalid-submit-navigation'
import type { FormItem } from '../field-config'
import { useFormValidationProducerContext } from './form-validation-producer-context.client'

/**
 * Publishes the interactive producer slot after explicit submit or publish interaction.
 * Quiet validity and publish-readiness paths do not set attempt flags, so they stay out.
 */
export function FormValidationInteractiveProducerBridge({ fields }: { fields: FormItem[] }) {
  const producer = useFormValidationProducerContext()
  const { hasAttemptedSubmit, hasAttemptedPublish } = useFormUiContext()
  const { errors } = useFormState()
  const formValues = (useWatch() ?? {}) as Record<string, unknown>

  useEffect(() => {
    if (!producer?.replaceSlot) return
    if (!hasAttemptedSubmit && !hasAttemptedPublish) return
    const issues = prepareFormIssues(errors, fields, formValues)
    producer.replaceSlot('interactive', issues)
  }, [errors, fields, formValues, hasAttemptedPublish, hasAttemptedSubmit, producer])

  return null
}
