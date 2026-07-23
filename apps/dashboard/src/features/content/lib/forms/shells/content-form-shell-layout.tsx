import * as React from 'react'
import type { DefaultValues, FieldValues, UseFormReturn } from 'react-hook-form'
import type { ZodType } from 'zod'
import type { ContentTypeKey, ResolvedContentCampaignAccess } from '@rpg/contracts'
import { Heading, InsetPanel } from '@rpg/ui'
import {
  Form,
  TabbedForm,
  FormItems,
  type FormItem,
  type FormValueSync,
  type TabbedFormTab,
} from '@rpg/ui/form'

import { NarrowPage } from '@/components/layout/narrow-page'
import { weaponAdvisorySubmitOptions, weaponFormValueSyncs } from '../../../equipment/weapons'
import { resolutionFormValueSyncs } from '../../../spells/resolution/lib/form/resolution-form-sync'
import { useContentFormOptions } from '../../form-options/content-form-options'
import type { AnyContentFormDef, ContentFormCtx } from '../content-form-registry'
import { contentFormFields } from '../content-form-registry'
import {
  CONTENT_CATALOG_OPTIONS_ERROR,
  ContentFormShellResolver,
} from './content-form-shell-resolver'
import { ContentFormFooter } from './content-form-footer'
import { useAdvisoryFormSubmit, type AdvisoryFormSubmitOptions } from './use-advisory-form-submit'
import { ContentEditPublishBridge } from './content-edit-publish-bridge.client'
import { CampaignAccessSection } from '../../campaign-access/campaign-access-section.client'
import { CampaignAccessFormProvider } from '../../campaign-access/campaign-access-form-context.client'
import { useContentSaveSession } from './use-content-save-session'
import type { ContentCampaignAccessPatch } from '@rpg/contracts'

export function ContentFormComingSoon() {
  return (
    <InsetPanel borderStyle="dashed" surface={{}} size="lg" align="center">
      <InsetPanel.Text>Form coming soon.</InsetPanel.Text>
    </InsetPanel>
  )
}

export function ContentFormNotRegistered({ heading = 'Edit' }: { heading?: string }) {
  return (
    <NarrowPage spacing="relaxed" className="pb-10">
      <Heading variant="page" as="h1">
        {heading}
      </Heading>
      <ContentFormComingSoon />
    </NarrowPage>
  )
}

interface ContentFormCampaignAccessProps {
  def: AnyContentFormDef
  ctx: ContentFormCtx
  formKey?: string
  campaignId?: string
  entityId?: string
  campaignAccess?: ResolvedContentCampaignAccess
  onCampaignAccessDraftChange?: (patch: ContentCampaignAccessPatch) => void
  onCampaignAccessPersisted?: (access: ResolvedContentCampaignAccess) => void
}

function ContentFormHeader({
  def,
  ctx,
  formKey,
  campaignId,
  entityId,
  campaignAccess,
  onCampaignAccessDraftChange,
  onCampaignAccessPersisted,
}: ContentFormCampaignAccessProps) {
  const idPrefix = formKey ?? 'content-form'

  return (
    <div className="flex flex-col gap-6">
      <FormItems items={[def.nameField(ctx)]} idPrefix={idPrefix} />
      {campaignId ? (
        <CampaignAccessSection
          campaignId={campaignId}
          targetType={def.routeKey as ContentTypeKey}
          entityId={entityId}
          initialAccess={campaignAccess}
          onDraftChange={onCampaignAccessDraftChange}
          onPersistedChange={onCampaignAccessPersisted}
        />
      ) : null}
    </div>
  )
}

interface ContentFormFooterShellProps<TFormValues extends FieldValues = FieldValues> {
  formMode: 'create' | 'edit'
  backHref?: string
  submitLabel: string
  submitPending: boolean
  submitSuccess?: boolean
  onSaveDraft?: (values: TFormValues, form: UseFormReturn<TFormValues>) => void | Promise<void>
  saveDraftPending?: boolean
  publishSuccess?: boolean
  onSubmit: (values: TFormValues, form: UseFormReturn<TFormValues>) => Promise<void>
}

function ContentFormSaveFooter<TFormValues extends FieldValues>({
  form,
  formMode,
  backHref,
  submitLabel,
  submitPending,
  submitSuccess = false,
  onSaveDraft,
  saveDraftPending,
  publishSuccess,
  onSubmit,
}: ContentFormFooterShellProps<TFormValues> & { form: UseFormReturn<TFormValues> }) {
  const actionState = useContentSaveSession({
    mode: formMode,
    pending: submitPending,
    form,
    onSubmit,
  })

  return (
    <ContentFormFooter
      mode={formMode}
      form={form}
      backHref={backHref}
      submitLabel={submitLabel}
      pending={submitPending || form.formState.isSubmitting}
      isSuccess={submitSuccess}
      onSaveDraft={onSaveDraft}
      saveDraftPending={saveDraftPending}
      publishSuccess={publishSuccess}
      actionState={formMode === 'edit' ? actionState : undefined}
      guardHasUnsavedEdits={formMode === 'create' ? actionState.hasUnsavedEdits : false}
    />
  )
}

interface ContentSchemaFormProps<
  TFormValues extends FieldValues,
> extends ContentFormFooterShellProps<TFormValues> {
  schema: ZodType<TFormValues>
  fields: FormItem[]
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
}

function ContentSchemaForm<TFormValues extends FieldValues>({
  schema,
  fields,
  defaultValues,
  formKey,
  formMode,
  backHref,
  submitLabel,
  submitPending,
  submitSuccess = false,
  formError,
  onSubmit,
  valueSyncs,
  beforeSubmit,
  submitConfirmDialog,
  onSaveDraft,
  saveDraftPending,
  publishSuccess,
  publishSchema,
  onPublish,
  headerProps,
}: ContentSchemaFormProps<TFormValues>) {
  const handleSubmit = React.useCallback(
    async (values: TFormValues, form: UseFormReturn<TFormValues>) => {
      if (beforeSubmit) {
        const proceed = await beforeSubmit(values, form)
        if (!proceed) return
      }
      await onSubmit(values, form)
    },
    [beforeSubmit, onSubmit],
  )

  return (
    <CampaignAccessFormProvider>
      <Form<TFormValues>
        key={formKey}
        id={formKey}
        uiStateKey={formKey}
        schema={schema}
        fields={fields}
        defaultValues={defaultValues}
        onSubmit={handleSubmit}
        formError={formError}
        valueSyncs={valueSyncs}
        stickyFooter
        header={() => <ContentFormHeader {...headerProps} formKey={formKey} />}
        footer={(form) => (
          <>
            {publishSchema && onPublish && formKey ? (
              <ContentEditPublishBridge
                publishSchema={publishSchema}
                fields={fields}
                formId={formKey}
                onPublish={onPublish}
              />
            ) : null}
            <ContentFormSaveFooter
              form={form}
              formMode={formMode}
              backHref={backHref}
              submitLabel={submitLabel}
              submitPending={submitPending}
              submitSuccess={submitSuccess}
              onSaveDraft={onSaveDraft}
              saveDraftPending={saveDraftPending}
              publishSuccess={publishSuccess}
              onSubmit={onSubmit}
            />
          </>
        )}
      />
      {submitConfirmDialog}
    </CampaignAccessFormProvider>
  )
}

interface ContentTabbedSchemaFormProps<
  TFormValues extends FieldValues,
> extends ContentFormFooterShellProps<TFormValues> {
  schema: ZodType<TFormValues>
  tabs: TabbedFormTab[]
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
}

function ContentTabbedSchemaForm<TFormValues extends FieldValues>({
  schema,
  tabs,
  defaultValues,
  formKey,
  formMode,
  backHref,
  submitLabel,
  submitPending,
  submitSuccess = false,
  formError,
  onSubmit,
  valueSyncs,
  beforeSubmit,
  submitConfirmDialog,
  onSaveDraft,
  saveDraftPending,
  publishSuccess,
  publishSchema,
  onPublish,
  headerProps,
}: ContentTabbedSchemaFormProps<TFormValues>) {
  const handleSubmit = React.useCallback(
    async (values: TFormValues, form: UseFormReturn<TFormValues>) => {
      if (beforeSubmit) {
        const proceed = await beforeSubmit(values, form)
        if (!proceed) return
      }
      await onSubmit(values, form)
    },
    [beforeSubmit, onSubmit],
  )

  const tabFields = React.useMemo(() => tabs.flatMap((tab) => tab.fields), [tabs])

  return (
    <CampaignAccessFormProvider>
      <TabbedForm<TFormValues>
        key={formKey}
        id={formKey}
        uiStateKey={formKey}
        schema={schema}
        tabs={tabs}
        defaultValues={defaultValues}
        valueSyncs={valueSyncs}
        onSubmit={(values, form) => handleSubmit(values, form)}
        formError={formError}
        header={() => <ContentFormHeader {...headerProps} formKey={formKey} />}
        footer={(form) => (
          <>
            {publishSchema && onPublish && formKey ? (
              <ContentEditPublishBridge
                publishSchema={publishSchema}
                fields={tabFields}
                formId={formKey}
                onPublish={onPublish}
              />
            ) : null}
            <ContentFormSaveFooter
              form={form}
              formMode={formMode}
              backHref={backHref}
              submitLabel={submitLabel}
              submitPending={submitPending}
              submitSuccess={submitSuccess}
              onSaveDraft={onSaveDraft}
              saveDraftPending={saveDraftPending}
              publishSuccess={publishSuccess}
              onSubmit={onSubmit}
            />
          </>
        )}
      />
      {submitConfirmDialog}
    </CampaignAccessFormProvider>
  )
}

interface ContentFormLayoutProps<TFormValues extends FieldValues> {
  def: AnyContentFormDef
  ctx: ContentFormCtx
  schema: ZodType<TFormValues>
  defaultValues?: DefaultValues<TFormValues>
  formKey?: string
  formMode: 'create' | 'edit'
  contentTypeKey: ContentTypeKey
  backHref?: string
  submitLabel: string
  submitPending: boolean
  submitSuccess?: boolean
  formError: string | null
  onSubmit: (values: TFormValues, form: UseFormReturn<TFormValues>) => Promise<void>
  onSaveDraft?: (values: TFormValues, form: UseFormReturn<TFormValues>) => Promise<void>
  saveDraftPending?: boolean
  publishSuccess?: boolean
  publishSchema?: ZodType<TFormValues>
  onPublish?: () => Promise<void>
  campaignId: string
  entityId?: string
  campaignAccess?: ResolvedContentCampaignAccess
  onCampaignAccessDraftChange?: (patch: ContentCampaignAccessPatch) => void
  onCampaignAccessPersisted?: (access: ResolvedContentCampaignAccess) => void
}

export function ContentFormLayout<TFormValues extends FieldValues>({
  def,
  ctx,
  schema,
  defaultValues,
  formKey,
  formMode,
  contentTypeKey: _contentTypeKey,
  backHref,
  submitLabel,
  submitPending,
  submitSuccess,
  formError,
  onSubmit,
  onSaveDraft,
  saveDraftPending,
  publishSuccess,
  publishSchema,
  onPublish,
  campaignId,
  entityId,
  campaignAccess,
  onCampaignAccessDraftChange,
  onCampaignAccessPersisted,
}: ContentFormLayoutProps<TFormValues>) {
  const isWeaponEquipmentForm = def.routeKey === 'equipment' && ctx.equipmentKind === 'weapon'
  const isSpellForm = def.routeKey === 'spells'
  const weaponAdvisoryOptions = React.useMemo((): AdvisoryFormSubmitOptions<TFormValues> => {
    if (!isWeaponEquipmentForm) return { enabled: false }
    // Weapon advisories are authored for EquipmentFormValues; this layout only
    // enables them on the weapon equipment route where TFormValues matches.
    return weaponAdvisorySubmitOptions(
      ctx.equipmentKind,
    ) as unknown as AdvisoryFormSubmitOptions<TFormValues>
  }, [isWeaponEquipmentForm, ctx.equipmentKind])
  const { onSubmit: advisoryOnSubmit, confirmDialog } = useAdvisoryFormSubmit(
    onSubmit,
    weaponAdvisoryOptions,
  )
  const resolvedOnSubmit = isWeaponEquipmentForm ? advisoryOnSubmit : onSubmit
  const valueSyncs = isWeaponEquipmentForm
    ? weaponFormValueSyncs
    : isSpellForm
      ? resolutionFormValueSyncs
      : undefined

  const sharedProps = {
    schema,
    defaultValues,
    formKey,
    formMode,
    backHref,
    submitLabel,
    submitPending,
    submitSuccess,
    formError,
    onSubmit: resolvedOnSubmit,
    onSaveDraft,
    saveDraftPending,
    publishSuccess,
    publishSchema,
    onPublish,
    valueSyncs,
    submitConfirmDialog: isWeaponEquipmentForm ? confirmDialog : undefined,
    headerProps: {
      def,
      ctx,
      formKey,
      campaignId,
      entityId,
      campaignAccess,
      onCampaignAccessDraftChange,
      onCampaignAccessPersisted,
    },
  }

  if (def.buildTabs) {
    return <ContentTabbedSchemaForm tabs={def.buildTabs(ctx)} {...sharedProps} />
  }

  return <ContentSchemaForm fields={contentFormFields(def, ctx)} {...sharedProps} />
}

interface ContentFormOptionsGateProps {
  campaignId: string
  children: (ctx: ContentFormCtx) => React.ReactNode
}

/** Waits for campaign catalog options before rendering form content. */
export function ContentFormOptionsGate({ campaignId, children }: ContentFormOptionsGateProps) {
  const { ctx, isPending, isError } = useContentFormOptions(campaignId)

  return (
    <ContentFormShellResolver
      isPending={isPending}
      isError={isError}
      errorLabel={CONTENT_CATALOG_OPTIONS_ERROR}
    >
      {children(ctx)}
    </ContentFormShellResolver>
  )
}
