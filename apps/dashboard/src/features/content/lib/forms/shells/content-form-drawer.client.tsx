'use client'

import * as React from 'react'
import type { DefaultValues, FieldValues, UseFormReturn } from 'react-hook-form'
import type { ZodType } from 'zod'
import { Button } from '@rpg/ui'
import { Form, type FormItem, type FormValueSync } from '@rpg/ui/form'

import { DrawerShell } from '@/components/drawer'

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

function ContentFormDrawerFooter({
  pending,
  submitLabel,
}: {
  pending: boolean
  submitLabel: string
}) {
  return (
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
  const handleOpenChange = React.useCallback(
    (nextOpen: boolean) => {
      if (!nextOpen && pending) return
      onOpenChange(nextOpen)
    },
    [onOpenChange, pending],
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
              onSubmit={(values, form) => {
                void onSubmit(values, form)
              }}
              footer={() => <ContentFormDrawerFooter pending={pending} submitLabel={submitLabel} />}
            />,
          )
        : null}
    </DrawerShell>
  )
}
