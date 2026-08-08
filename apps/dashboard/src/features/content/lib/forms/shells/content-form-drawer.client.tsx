'use client'

import * as React from 'react'
import type { DefaultValues, FieldValues, UseFormReturn } from 'react-hook-form'
import { useFormState } from 'react-hook-form'
import type { ZodType } from 'zod'
import { Button } from '@rpg/ui'
import { Form, type FormItem, type FormValueSync } from '@rpg/ui/form'

import { DrawerShell } from '@/components/drawer'
import { FormUnsavedChangesGuard, useUnsavedChangesConfirm } from '@/lib/form-unsaved-changes-guard'
import { hasDirtyFields } from '@/lib/form-dirty-state'
import { useCampaignAccessForm } from '../../campaign-access/campaign-access-form-context.client'

export type ContentFormDrawerFormProps<TFormValues extends FieldValues> = {
  schema: ZodType<TFormValues>
  fields: FormItem[]
  defaultValues?: DefaultValues<TFormValues>
  header?: () => React.ReactNode
  valueSyncs?: FormValueSync[]
  formKey?: string
}

export type ContentFormDrawerProps<TFormValues extends FieldValues> = {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: React.ReactNode
  form: ContentFormDrawerFormProps<TFormValues>
  pending: boolean
  submitLabel: string
  formError?: string | null
  wrapForm?: (form: React.ReactNode) => React.ReactNode
  onSubmit: (values: TFormValues, form: UseFormReturn<TFormValues>) => void | Promise<void>
}

type ContentFormDrawerLeaveBridge = {
  requestClose: (continuation: () => void) => void
  runTrustedClose: (continuation: () => void) => void
}

function ContentFormDrawerLeaveGuard({
  bridgeRef,
  pending,
  open,
}: {
  bridgeRef: React.MutableRefObject<ContentFormDrawerLeaveBridge | null>
  pending: boolean
  open: boolean
}) {
  const { dirtyFields } = useFormState()
  const campaignAccess = useCampaignAccessForm()
  const bodyDirty = hasDirtyFields(dirtyFields)
  const isDirty = bodyDirty || campaignAccess.isDirty
  const discardGuard = useUnsavedChangesConfirm({ isDirty })

  React.useEffect(() => {
    bridgeRef.current = {
      requestClose: (continuation) => {
        if (pending) return
        discardGuard.request(continuation)
      },
      runTrustedClose: discardGuard.runTrusted,
    }
    return () => {
      bridgeRef.current = null
    }
  }, [bridgeRef, discardGuard, pending])

  return (
    <>
      {discardGuard.dialog}
      <FormUnsavedChangesGuard discardGuard={discardGuard} enabled={open} renderDialog={false} />
    </>
  )
}

function ContentFormDrawerFooter({
  pending,
  submitLabel,
  leaveBridgeRef,
  open,
}: {
  pending: boolean
  submitLabel: string
  leaveBridgeRef: React.MutableRefObject<ContentFormDrawerLeaveBridge | null>
  open: boolean
}) {
  return (
    <>
      <ContentFormDrawerLeaveGuard bridgeRef={leaveBridgeRef} pending={pending} open={open} />
      <div className="flex w-full items-center justify-end gap-2">
        <DrawerShell.Close asChild>
          <Button type="button" variant="outline" disabled={pending}>
            Cancel
          </Button>
        </DrawerShell.Close>
        <Button type="submit" disabled={pending}>
          {submitLabel}
        </Button>
      </div>
    </>
  )
}

/** Neutral form workflow for contextual create/edit drawers. */
export function ContentFormDrawer<TFormValues extends FieldValues>({
  open,
  onOpenChange,
  title,
  description,
  form,
  pending,
  submitLabel,
  formError = null,
  wrapForm = (form) => form,
  onSubmit,
}: ContentFormDrawerProps<TFormValues>) {
  const leaveBridgeRef = React.useRef<ContentFormDrawerLeaveBridge | null>(null)

  const handleOpenChange = React.useCallback(
    (nextOpen: boolean) => {
      if (nextOpen) {
        onOpenChange(true)
        return
      }
      leaveBridgeRef.current?.requestClose(() => onOpenChange(false))
    },
    [onOpenChange],
  )

  const handleSubmit = React.useCallback(
    async (values: TFormValues, formInstance: UseFormReturn<TFormValues>) => {
      await onSubmit(values, formInstance)
      leaveBridgeRef.current?.runTrustedClose(() => onOpenChange(false))
    },
    [onOpenChange, onSubmit],
  )

  const formId = form.formKey ?? 'content-form-drawer'

  return (
    <DrawerShell
      open={open}
      onOpenChange={handleOpenChange}
      title={title}
      description={description}
      bodyMode="managed"
    >
      {open
        ? wrapForm(
            <Form<TFormValues>
              key={formId}
              id={formId}
              uiStateKey={formId}
              schema={form.schema}
              fields={form.fields}
              defaultValues={form.defaultValues}
              valueSyncs={form.valueSyncs}
              contentClassName="px-6 pt-0"
              rhythm="comfortable"
              size="md"
              stickyFooter
              footerVariant="sheet"
              formError={formError}
              header={form.header}
              onSubmit={handleSubmit}
              footer={() => (
                <ContentFormDrawerFooter
                  pending={pending}
                  submitLabel={submitLabel}
                  leaveBridgeRef={leaveBridgeRef}
                  open={open}
                />
              )}
            />,
          )
        : null}
    </DrawerShell>
  )
}
