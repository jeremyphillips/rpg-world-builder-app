import * as React from 'react'
import type { DefaultValues, FieldValues, UseFormReturn } from 'react-hook-form'
import type { ZodType } from 'zod'
import {
  Form,
  TabbedForm,
  collectTabbedFormResolverItems,
  formViewportScrollBodyTopInsetClasses,
  type FormIssue,
  type FormItem,
  type FormValueSync,
  type TabbedFormTab,
} from '@rpg/ui/form'

import { CampaignAccessFormProvider } from '../../../campaign-access/campaign-access-form-context'
import { ContentEditPublishBridge } from '../edit/content-edit-publish-bridge'
import type { ContentFormCampaignAccessProps } from './content-form-shell-layout.lib'
import {
  ContentFormHeader,
  ContentFormSaveFooter,
  type ContentFormFooterShellProps,
} from './content-form-shell-layout.lib'
import { hasContentFormPreview } from '../../preview/content-form-preview.types'
import {
  ContentPreviewCompactTrigger,
  ContentPreviewRail,
} from '../../preview/content-preview-rail'
import { ContentPreviewUiProvider } from '../../preview/content-preview-ui-context'
import { resolveContentPublishSchema } from '../edit/content-edit-load'
import { ContentFormPublishValidationBridge } from '../../validation/content-form-publish-validation.client'
import { ContentCreatePublishValidationBridge } from './content-create-publish-validation-bridge.client'
import { augmentTabsWithHoistedName } from './content-schema-form-tabs.lib'

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
  headerPrefix?: React.ReactNode
  fields?: FormItem[]
  tabs?: TabbedFormTab[]
  previewDraftBadge?: boolean
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
  onPublishValidationFailed,
}: {
  form: UseFormReturn<TFormValues>
  publishSchema?: ZodType<TFormValues>
  onPublish?: () => Promise<void>
  formKey?: string
  publishFields: FormItem[]
  footerShellProps: ContentFormFooterShellProps<TFormValues>
  onPublishValidationFailed: () => void
}) {
  return (
    <>
      {publishSchema && onPublish && formKey ? (
        <ContentEditPublishBridge
          publishSchema={publishSchema}
          fields={publishFields}
          formId={formKey}
          onPublish={onPublish}
          onPublishValidationFailed={onPublishValidationFailed}
        />
      ) : null}
      <ContentFormSaveFooter form={form} {...footerShellProps} />
    </>
  )
}

export function ContentSchemaFormShell<TFormValues extends FieldValues>(
  props: ContentSchemaFormShellProps<TFormValues>,
) {
  return (
    <CampaignAccessFormProvider>
      <ContentSchemaFormShellBody<TFormValues> key={props.formKey} {...props} />
    </CampaignAccessFormProvider>
  )
}

function ContentSchemaFormShellBody<TFormValues extends FieldValues>({
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
  headerPrefix,
  fields,
  tabs,
  formMode,
  backHref,
  submitLabel,
  submitPending,
  onSaveDraft,
  saveDraftPending,
  onSaved,
  onLeaveGuardReady,
  previewDraftBadge = false,
}: ContentSchemaFormShellProps<TFormValues>) {
  const [hasAttemptedPublish, setHasAttemptedPublish] = React.useState(false)
  const [publishPresentationIssues, setPublishPresentationIssues] = React.useState<FormIssue[]>([])
  const markPublishAttempted = React.useCallback(() => {
    setHasAttemptedPublish(true)
  }, [])
  const handlePublishIssuesChange = React.useCallback(
    ({ issues }: { issues: readonly FormIssue[] }) => {
      setPublishPresentationIssues([...issues])
    },
    [],
  )

  const handleSubmit = useContentSchemaSubmitHandler(onSubmit, beforeSubmit)
  const resolvedPublishSchema = React.useMemo(
    () => publishSchema ?? resolveContentPublishSchema(headerProps.def, headerProps.ctx),
    [headerProps.ctx, headerProps.def, publishSchema],
  )
  const footerShellProps: ContentFormFooterShellProps<TFormValues> = {
    formMode,
    backHref,
    submitLabel,
    submitPending,
    onSaveDraft,
    saveDraftPending,
    onSubmit,
    onSaved,
    onLeaveGuardReady,
  }
  const tabbedFormTabs = React.useMemo(
    () =>
      tabs
        ? augmentTabsWithHoistedName(tabs, headerProps.def.nameField(headerProps.ctx))
        : undefined,
    [headerProps.ctx, headerProps.def, tabs],
  )
  const publishFields = React.useMemo(
    () => (tabbedFormTabs ? collectTabbedFormResolverItems(tabbedFormTabs) : (fields ?? [])),
    [fields, tabbedFormTabs],
  )
  const previewEnabled = hasContentFormPreview(headerProps.def) && Boolean(tabbedFormTabs)
  const header = () => (
    <>
      {headerPrefix}
      <ContentFormHeader {...headerProps} formKey={formKey} />
      {previewEnabled ? (
        <>
          <ContentFormPublishValidationBridge
            schema={resolvedPublishSchema}
            tabs={tabbedFormTabs!}
            onValidationChange={handlePublishIssuesChange}
          />
          {formMode === 'create' ? (
            <ContentCreatePublishValidationBridge
              publishSchema={resolvedPublishSchema}
              publishFields={publishFields}
              onPublishAttempted={markPublishAttempted}
              onPublishIssuesChange={handlePublishIssuesChange}
            />
          ) : null}
        </>
      ) : null}
    </>
  )
  const footer = (form: UseFormReturn<TFormValues>) => (
    <ContentSchemaFormFooter
      form={form}
      publishSchema={publishSchema}
      onPublish={onPublish}
      formKey={formKey}
      publishFields={publishFields}
      footerShellProps={footerShellProps}
      onPublishValidationFailed={markPublishAttempted}
    />
  )

  return (
    <>
      {tabbedFormTabs ? (
        <ContentPreviewUiProvider>
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
            <TabbedForm<TFormValues>
              key={formKey}
              id={formKey}
              uiStateKey={formKey}
              schema={schema}
              tabs={tabbedFormTabs}
              defaultValues={defaultValues}
              valueSyncs={valueSyncs}
              onSubmit={handleSubmit}
              formError={formError}
              header={header}
              footer={footer}
              className="flex min-h-0 flex-1 flex-col"
              scrollBodyClassName={formViewportScrollBodyTopInsetClasses}
              hasAttemptedPublish={hasAttemptedPublish}
              onMarkPublishAttempted={markPublishAttempted}
              publishPresentationIssues={publishPresentationIssues}
              publishPresentationEnabled={previewEnabled}
              aside={
                previewEnabled ? (
                  <ContentPreviewRail
                    def={headerProps.def}
                    ctx={headerProps.ctx}
                    tabs={tabbedFormTabs}
                    showDraftBadge={previewDraftBadge}
                  />
                ) : undefined
              }
              tabRowTrailing={previewEnabled ? <ContentPreviewCompactTrigger /> : undefined}
            />
          </div>
        </ContentPreviewUiProvider>
      ) : (
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
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
            className="flex min-h-0 flex-1 flex-col"
            scrollBodyClassName={formViewportScrollBodyTopInsetClasses}
            header={header}
            footer={footer}
          />
        </div>
      )}
      {submitConfirmDialog}
    </>
  )
}
