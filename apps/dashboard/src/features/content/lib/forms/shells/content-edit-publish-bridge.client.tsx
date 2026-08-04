'use client'

import { useContext, useEffect } from 'react'
import { useFormContext, type FieldValues } from 'react-hook-form'
import type { ZodType } from 'zod'
import { getApiValidationIssues } from '@rpg/contracts'
import {
  FormUiContext,
  navigateInvalidSubmit,
  navigateTabbedFormInvalidSubmit,
  useTabbedFormChrome,
  type FormItem,
  type FormUiContextValue,
} from '@rpg/ui/form'

import {
  applyValidationIssuesToForm,
  validateContentPublishValues,
} from '../content-publish-validation.lib'
import { useContentEditPublishRequest } from './content-edit-publish-context.client'

type ContentEditPublishBridgeProps = {
  publishSchema: ZodType<FieldValues>
  fields: FormItem[]
  formId: string
  onPublish: () => Promise<void>
}

function presentPublishValidationErrors<TFieldValues extends FieldValues>(
  form: ReturnType<typeof useFormContext<TFieldValues>>,
  fields: FormItem[],
  formId: string,
  tabbedChrome: ReturnType<typeof useTabbedFormChrome>,
  ui: FormUiContextValue,
): void {
  const errors = form.formState.errors

  if (tabbedChrome) {
    navigateTabbedFormInvalidSubmit(
      form,
      fields,
      formId,
      tabbedChrome.tabs,
      ui,
      errors,
      tabbedChrome.setActiveTabId,
    )
    return
  }

  navigateInvalidSubmit(form, fields, formId, ui, errors)
}

export function ContentEditPublishBridge({
  publishSchema,
  fields,
  formId,
  onPublish,
}: ContentEditPublishBridgeProps) {
  const publishRequest = useContentEditPublishRequest()
  const form = useFormContext<FieldValues>()
  const tabbedChrome = useTabbedFormChrome()
  const ui = useContext(FormUiContext)

  useEffect(() => {
    if (!publishRequest) return

    publishRequest.setPublishRequest(async () => {
      const values = form.getValues()
      const isValid = validateContentPublishValues(form, publishSchema, values)
      if (!isValid) {
        presentPublishValidationErrors(form, fields, formId, tabbedChrome, ui)
        return
      }

      try {
        await onPublish()
      } catch (err) {
        const issues = getApiValidationIssues(err)
        if (!issues) throw err

        form.clearErrors()
        applyValidationIssuesToForm(form, issues)
        presentPublishValidationErrors(form, fields, formId, tabbedChrome, ui)
      }
    })

    return () => publishRequest.setPublishRequest(null)
  }, [fields, form, formId, onPublish, publishRequest, publishSchema, tabbedChrome, ui])

  return null
}
