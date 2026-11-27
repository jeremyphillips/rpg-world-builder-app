'use client'

import { useMemo } from 'react'
import { useWatch } from 'react-hook-form'
import {
  projectFormValidationProducerIssues,
  useFormUiContext,
  useFormValidationProducerContext,
  type FormItem,
} from '@rpg/ui/form'

/**
 * Adopted content surfaces read the producer session only.
 * Quiet checks and React Hook Form errors do not enter this projection.
 */
export function useContentFormPresentationIssues(fieldsOverride?: FormItem[]) {
  const { fields: contextFields, hasAttemptedSubmit, hasAttemptedPublish } = useFormUiContext()
  const fields = fieldsOverride ?? contextFields
  const formValues = (useWatch() ?? {}) as Record<string, unknown>
  const producer = useFormValidationProducerContext()

  const issues = useMemo(() => {
    if (!producer) return []
    return projectFormValidationProducerIssues(producer.session, producer.stamp, fields, formValues)
  }, [fields, formValues, producer])

  return { fields, issues, hasAttemptedSubmit, hasAttemptedPublish }
}
