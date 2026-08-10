'use client'

import * as React from 'react'
import type { DefaultValues, FieldValues, UseFormReturn } from 'react-hook-form'
import { useFormState } from 'react-hook-form'
import type { ZodType } from 'zod'
import { Form, type FormItem, type FormValueSync } from '@rpg/ui/form'

import { FormUnsavedChangesGuard, useUnsavedChangesConfirm } from '@/lib/form-unsaved-changes-guard'
import { composeFormLeaveDirty } from '@/lib/form-leave-dirty'
import { useCampaignAccessForm } from '../../campaign-access/campaign-access-form-context.client'

export type ContentFormHostFormProps<TFormValues extends FieldValues> = {
  schema: ZodType<TFormValues>
  fields: FormItem[]
  defaultValues?: DefaultValues<TFormValues>
  header?: () => React.ReactNode
  valueSyncs?: FormValueSync[]
  formKey?: string
}

/** Leave-guard bridge — close chrome calls `requestClose`; submit uses `runTrustedClose`. */
export type ContentFormHostLeaveBridge = {
  requestClose: (continuation: () => void) => void
  runTrustedClose: (continuation: () => void) => void
}

export type ContentFormHostChrome = {
  contentWrapper: (content: React.ReactNode) => React.ReactNode
  footer: () => React.ReactNode
}

export type ContentFormHostProps<TFormValues extends FieldValues> = {
  /** When false, the form is unmounted. Keep true for the whole transaction when dirty must survive phase swaps. */
  mounted: boolean
  /** Forwarded to `FormUnsavedChangesGuard` (route leave). */
  leaveGuardEnabled: boolean
  pending: boolean
  formError?: string | null
  extraUnsavedEdits?: boolean
  wrapForm?: (form: React.ReactNode) => React.ReactNode
  form: ContentFormHostFormProps<TFormValues>
  leaveBridgeRef: React.MutableRefObject<ContentFormHostLeaveBridge | null>
  chrome: ContentFormHostChrome
  /** Optional class hooks matching drawer defaults when omitted. */
  formClassName?: string
  contentClassName?: string
  onSubmit: (values: TFormValues, form: UseFormReturn<TFormValues>) => void | Promise<void>
  /** Called after a successful submit via the leave bridge (trusted close). */
  onTrustedClose: () => void
}

function ContentFormHostLeaveGuard({
  bridgeRef,
  pending,
  leaveGuardEnabled,
  extraUnsavedEdits,
}: {
  bridgeRef: React.MutableRefObject<ContentFormHostLeaveBridge | null>
  pending: boolean
  leaveGuardEnabled: boolean
  extraUnsavedEdits?: boolean
}) {
  const { dirtyFields } = useFormState()
  const campaignAccess = useCampaignAccessForm()
  const isDirty = composeFormLeaveDirty({
    dirtyFields,
    extraUnsavedEdits,
    campaignAccessDirty: campaignAccess.isDirty,
  })
  const discardGuard = useUnsavedChangesConfirm({ isDirty })

  React.useEffect(() => {
    bridgeRef.current = {
      requestClose: (continuation) => {
        if (pending) return
        discardGuard.request(continuation)
      },
      runTrustedClose: (continuation) => {
        discardGuard.runTrusted(continuation, { bypassRouter: false })
      },
    }
    return () => {
      bridgeRef.current = null
    }
  }, [bridgeRef, discardGuard, pending])

  return (
    <>
      {discardGuard.dialog}
      <FormUnsavedChangesGuard
        discardGuard={discardGuard}
        enabled={leaveGuardEnabled}
        pending={pending}
        renderDialog={false}
      />
    </>
  )
}

/**
 * Chrome-agnostic content form workflow: mount, leave-guard bridge, submit → trusted close.
 * Overlay owners supply body via `chrome.contentWrapper` and render
 * `<FormShellFooterSlot />` inside shell footer chrome.
 */
export function ContentFormHost<TFormValues extends FieldValues>({
  mounted,
  leaveGuardEnabled,
  pending,
  formError = null,
  extraUnsavedEdits = false,
  wrapForm = (formNode) => formNode,
  form,
  leaveBridgeRef,
  chrome,
  formClassName = 'flex min-h-0 flex-1 flex-col',
  contentClassName,
  onSubmit,
  onTrustedClose,
}: ContentFormHostProps<TFormValues>) {
  const handleSubmit = React.useCallback(
    async (values: TFormValues, formInstance: UseFormReturn<TFormValues>) => {
      try {
        await onSubmit(values, formInstance)
        leaveBridgeRef.current?.runTrustedClose(onTrustedClose)
      } catch {
        // Rejection keeps the surface open — caller surfaces formError.
      }
    },
    [leaveBridgeRef, onSubmit, onTrustedClose],
  )

  const formId = form.formKey ?? 'content-form-host'

  if (!mounted) return null

  return wrapForm(
    <Form<TFormValues>
      key={formId}
      id={formId}
      uiStateKey={formId}
      schema={form.schema}
      fields={form.fields}
      defaultValues={form.defaultValues}
      valueSyncs={form.valueSyncs}
      className={formClassName}
      contentClassName={contentClassName}
      rhythm="comfortable"
      size="md"
      formError={formError}
      header={form.header}
      onSubmit={handleSubmit}
      externalFooter
      contentWrapper={(content) => (
        <>
          <ContentFormHostLeaveGuard
            bridgeRef={leaveBridgeRef}
            pending={pending}
            leaveGuardEnabled={leaveGuardEnabled}
            extraUnsavedEdits={extraUnsavedEdits}
          />
          {chrome.contentWrapper(content)}
        </>
      )}
      footer={chrome.footer}
    />,
  )
}
