import * as React from 'react'
import type { DefaultValues, FieldValues, UseFormReturn } from 'react-hook-form'
import type { ZodType } from 'zod'
import {
  Form,
  TabbedForm,
  type FormItem,
  type FormValueSync,
  type TabbedFormTab,
} from '@rpg/ui/form'

import { CampaignAccessFormProvider } from '../../campaign-access/campaign-access-form-context.client'
import { ContentEditPublishBridge } from './content-edit-publish-bridge.client'
import type { ContentFormCampaignAccessProps } from './content-form-shell-layout.lib'
import {
  ContentFormHeader,
  ContentFormSaveFooter,
  type ContentFormFooterShellProps,
} from './content-form-shell-layout.lib'

interface ContentSchemaFormShellProps<
  TFormValues extends FieldValues,
> extends ContentFormFooterShellProps<TFormValues> {
  schema: ZodType<TFormValues>
  defaultValues?: DefaultValues<TFormValues>
  formKey?: string
  formError: string | null
  onSubmit: (values: TFormValues, form: UseFormReturn<TFormValues>) => Promise<void>
  valueSyncs?: FormValueSync[]
  beforeSubmit?: (
    values: TFormValues,
    form: UseFormReturn<TFormValues>,
  ) => boolean | Promise<boolean>
  submitConfirmDialog?: React.ReactNode
  publishSchema?: ZodType<TFormValues>
  onPublish?: () => Promise<void>
  headerProps: ContentFormCampaignAccessProps
  fields?: FormItem[]
  tabs?: TabbedFormTab[]
}

function useContentSchemaSubmitHandler<TFormValues extends FieldValues>(
  onSubmit: (values: TFormValues, form: UseFormReturn<TFormValues>) => Promise<void>,
  beforeSubmit?: (
    values: TFormValues,
    form: UseFormReturn<TFormValues>,
  ) => boolean | Promise<boolean>,
) {
  return React.useCallback(
    async (values: TFormValues, form: UseFormReturn<TFormValues>) => {
      if (beforeSubmit) {
        const proceed = await beforeSubmit(values, form)
        if (!proceed) return
      }
      await onSubmit(values, form)
    },
    [beforeSubmit, onSubmit],
  )
}

function ContentSchemaFormFooter<TFormValues extends FieldValues>({
  form,
  publishSchema,
  onPublish,
  formKey,
  publishFields,
  footerShellProps,
}: {
  form: UseFormReturn<TFormValues>
  publishSchema?: ZodType<TFormValues>
  onPublish?: () => Promise<void>
  formKey?: string
  publishFields: FormItem[]
  footerShellProps: ContentFormFooterShellProps<TFormValues>
}) {
  return (
    <>
      {publishSchema && onPublish && formKey ? (
        <ContentEditPublishBridge
          publishSchema={publishSchema}
          fields={publishFields}
          formId={formKey}
          onPublish={onPublish}
        />
      ) : null}
      <ContentFormSaveFooter form={form} {...footerShellProps} />
    </>
  )
}

export function ContentSchemaFormShell<TFormValues extends FieldValues>({
  schema,
  defaultValues,
  formKey,
  formError,
  onSubmit,
  valueSyncs,
  beforeSubmit,
  submitConfirmDialog,
  publishSchema,
  onPublish,
  headerProps,
  fields,
  tabs,
  formMode,
  backHref,
  submitLabel,
  submitPending,
  onSaveDraft,
  saveDraftPending,
  onSaved,
}: ContentSchemaFormShellProps<TFormValues>) {
  const handleSubmit = useContentSchemaSubmitHandler(onSubmit, beforeSubmit)
  const footerShellProps: ContentFormFooterShellProps<TFormValues> = {
    formMode,
    backHref,
    submitLabel,
    submitPending,
    onSaveDraft,
    saveDraftPending,
    onSubmit,
    onSaved,
  }
  const publishFields = React.useMemo(
    () => (tabs ? tabs.flatMap((tab) => tab.fields) : (fields ?? [])),
    [fields, tabs],
  )
  const header = () => <ContentFormHeader {...headerProps} formKey={formKey} />
  const footer = (form: UseFormReturn<TFormValues>) => (
    <ContentSchemaFormFooter
      form={form}
      publishSchema={publishSchema}
      onPublish={onPublish}
      formKey={formKey}
      publishFields={publishFields}
      footerShellProps={footerShellProps}
    />
  )

  return (
    <CampaignAccessFormProvider>
      {tabs ? (
        <TabbedForm<TFormValues>
          key={formKey}
          id={formKey}
          uiStateKey={formKey}
          schema={schema}
          tabs={tabs}
          defaultValues={defaultValues}
          valueSyncs={valueSyncs}
          onSubmit={handleSubmit}
          formError={formError}
          header={header}
          footer={footer}
        />
      ) : (
        <Form<TFormValues>
          key={formKey}
          id={formKey}
          uiStateKey={formKey}
          schema={schema}
          fields={fields ?? []}
          defaultValues={defaultValues}
          onSubmit={handleSubmit}
          formError={formError}
          valueSyncs={valueSyncs}
          stickyFooter
          header={header}
          footer={footer}
        />
      )}
      {submitConfirmDialog}
    </CampaignAccessFormProvider>
  )
}
