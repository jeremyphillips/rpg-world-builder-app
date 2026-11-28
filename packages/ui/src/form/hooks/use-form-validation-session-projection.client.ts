'use client'

import * as React from 'react'
import { useFormState, useWatch } from 'react-hook-form'

import { useFormUiContext } from '../context/form-ui.context'
import { useFormValidationProducerContext } from '../lifecycle/form-validation-producer-context.client'
import { projectFormValidationProducerIssues } from '../lifecycle/form-validation-producer-session.lib'
import type { FormItem } from '../field-config'
import { prepareFormIssues } from '../errors/resolve-invalid-submit-navigation'
import {
  collectInactiveFieldPaths,
  filterIssuesForPresentation,
} from '../errors/resolve-field-error-presentation.lib'

/** Canonical presentation list: producer session when mounted, otherwise routed RHF errors. */
export function useFormValidationSessionProjection(fieldsOverride?: FormItem[]) {
  const {
    fields: contextFields,
    hasAttemptedSubmit,
    hasAttemptedPublish,
    publishPresentationEnabled,
    validationPresentation,
  } = useFormUiContext()
  const fields = fieldsOverride ?? contextFields
  const formValues = (useWatch() ?? {}) as Record<string, unknown>
  const producer = useFormValidationProducerContext()
  const { errors, touchedFields } = useFormState()

  const producerIssues = React.useMemo(() => {
    if (!producer) return null
    return projectFormValidationProducerIssues(producer.session, producer.stamp, fields, formValues)
  }, [fields, formValues, producer])

  const rhfIssues = React.useMemo(
    () => prepareFormIssues(errors, fields, formValues),
    [errors, fields, formValues],
  )

  const rawIssues = producerIssues ?? rhfIssues

  const inactivePaths = React.useMemo(
    () => collectInactiveFieldPaths(fields, formValues),
    [fields, formValues],
  )

  const issues = React.useMemo(
    () => filterIssuesForPresentation(rawIssues, inactivePaths),
    [inactivePaths, rawIssues],
  )

  return {
    fields,
    issues,
    inactivePaths,
    hasAttemptedSubmit,
    hasAttemptedPublish,
    publishPresentationEnabled,
    validationPresentation,
    usesProducerSession: producer !== null,
    touchedFields,
  }
}
