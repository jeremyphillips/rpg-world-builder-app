import * as React from 'react'
import type { DefaultValues, FieldValues, UseFormReturn } from 'react-hook-form'
import type { ZodType } from 'zod'
import type {
  ContentCampaignAccessPatch,
  ContentTypeKey,
  ResolvedContentCampaignAccess,
} from '@rpg/contracts'

import { weaponAdvisorySubmitOptions } from '../../../../equipment/weapons'
import { resolveContentFormValueSyncs } from '../host/content-form-host-projection'
import { useContentFormOptions } from '../../../form-options/content-form-options'
import type { AnyContentFormDef, ContentFormCtx } from '../../registry/content-form-registry'
import { contentFormFields } from '../../registry/content-form-registry'
import {
  CONTENT_CATALOG_OPTIONS_ERROR,
  ContentFormShellResolver,
} from './content-form-shell-resolver'
import { useAdvisoryFormSubmit, type AdvisoryFormSubmitOptions } from './use-advisory-form-submit'
import type { CoordinatedSaveSavedEvent } from '../session/use-content-save-session'
import type { ContentFormScrollMode } from './content-form-layout.lib'
import { ContentSchemaFormShell } from './content-schema-form-shell'
import {
  CONTENT_FORM_AVAILABILITY_PRESENTATION_DIALOG,
  CONTENT_FORM_IDENTITY_LAYOUT_INLINE,
} from '../content-form-presentation.lib'
import type { UnsavedChangesConfirmController } from '@/lib/form-unsaved-changes-guard'

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
  formError: string | null
  onSubmit: (values: TFormValues, form: UseFormReturn<TFormValues>) => Promise<void>
  onSaveDraft?: (values: TFormValues, form: UseFormReturn<TFormValues>) => Promise<void>
  saveDraftPending?: boolean
  publishSchema?: ZodType<TFormValues>
  onPublish?: () => Promise<void>
  campaignId: string
  entityId?: string
  campaignAccess?: ResolvedContentCampaignAccess
  onCampaignAccessDraftChange?: (patch: ContentCampaignAccessPatch) => void
  onCampaignAccessPersisted?: (access: ResolvedContentCampaignAccess) => void
  onSaved?: (event: CoordinatedSaveSavedEvent) => void
  onLeaveGuardReady?: (guard: Pick<UnsavedChangesConfirmController, 'runTrusted'>) => void
  formHeaderPrefix?: React.ReactNode
  /** Wraps field chrome for adopted content submit producer sessions. */
  producerBoundary?: React.ComponentType<{ children: React.ReactNode }>
  producerStampBridge?: React.ReactNode
  previewDraftBadge?: boolean
  scrollMode: ContentFormScrollMode
  previewEnabled: boolean
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
  formError,
  onSubmit,
  onSaveDraft,
  saveDraftPending,
  publishSchema,
  onPublish,
  campaignId,
  entityId,
  campaignAccess,
  onCampaignAccessDraftChange,
  onCampaignAccessPersisted,
  onSaved,
  onLeaveGuardReady,
  formHeaderPrefix,
  producerBoundary,
  producerStampBridge,
  previewDraftBadge = false,
  scrollMode,
  previewEnabled,
}: ContentFormLayoutProps<TFormValues>) {
  const isWeaponEquipmentForm = def.routeKey === 'equipment' && ctx.equipmentKind === 'weapon'
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
  const valueSyncs = resolveContentFormValueSyncs(def, ctx)

  const tabs = def.buildTabs ? def.buildTabs(ctx) : undefined

  return (
    <ContentSchemaFormShell
      schema={schema}
      defaultValues={defaultValues}
      formKey={formKey}
      formMode={formMode}
      backHref={backHref}
      submitLabel={submitLabel}
      submitPending={submitPending}
      formError={formError}
      onSubmit={resolvedOnSubmit}
      onSaveDraft={onSaveDraft}
      saveDraftPending={saveDraftPending}
      onSaved={onSaved}
      onLeaveGuardReady={onLeaveGuardReady}
      publishSchema={publishSchema}
      onPublish={onPublish}
      valueSyncs={valueSyncs}
      submitConfirmDialog={isWeaponEquipmentForm ? confirmDialog : undefined}
      fields={tabs ? undefined : contentFormFields(def, ctx)}
      tabs={tabs}
      headerProps={{
        def,
        ctx,
        formKey,
        campaignId,
        entityId,
        campaignAccess,
        onCampaignAccessDraftChange,
        onCampaignAccessPersisted,
        entityCatalogLayer: ctx.entityCatalogLayer,
        formMode,
        identityLayout: CONTENT_FORM_IDENTITY_LAYOUT_INLINE,
        availabilityPresentation: CONTENT_FORM_AVAILABILITY_PRESENTATION_DIALOG,
      }}
      headerPrefix={
        <>
          {producerStampBridge}
          {formHeaderPrefix}
        </>
      }
      producerBoundary={producerBoundary}
      previewDraftBadge={previewDraftBadge}
      scrollMode={scrollMode}
      previewEnabled={previewEnabled}
    />
  )
}

interface ContentFormOptionsGateProps {
  campaignId: string
  children: (ctx: ContentFormCtx) => React.ReactNode
}

/**
 * Waits for campaign catalog options before rendering form content.
 * Catalog load errors show retry here; refetches only queries that failed.
 */
export function ContentFormOptionsGate({ campaignId, children }: ContentFormOptionsGateProps) {
  const { ctx, isPending, isError, isRetrying, retryFailedQueries } =
    useContentFormOptions(campaignId)

  return (
    <ContentFormShellResolver
      isPending={isPending}
      isError={isError}
      errorLabel={CONTENT_CATALOG_OPTIONS_ERROR}
      isRetrying={isRetrying}
      onRetry={() => {
        void retryFailedQueries()
      }}
    >
      {children(ctx)}
    </ContentFormShellResolver>
  )
}
