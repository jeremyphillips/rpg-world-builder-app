'use client'

import { useEffect, useRef } from 'react'
import { useFormContext, useFormState } from 'react-hook-form'

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
  const { getValues } = useFormContext()
  const replaceSlotRef = useRef(producer?.replaceSlot)
  replaceSlotRef.current = producer?.replaceSlot

  const publishedSignatureRef = useRef<string | null>(null)

  useEffect(() => {
    const replaceSlot = replaceSlotRef.current
    if (!replaceSlot) return
    if (!hasAttemptedSubmit && !hasAttemptedPublish) return
    const formValues = getValues() as Record<string, unknown>
    const issues = prepareFormIssues(errors, fields, formValues)
    const signature = issues.map((issue) => `${issue.path}\0${issue.message}`).join('\n')
    if (signature === publishedSignatureRef.current) return
    publishedSignatureRef.current = signature
    replaceSlot('interactive', issues)
  }, [errors, fields, getValues, hasAttemptedPublish, hasAttemptedSubmit])

  return null
}
