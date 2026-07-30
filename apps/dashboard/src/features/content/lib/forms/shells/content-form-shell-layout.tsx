import * as React from 'react'
import type { DefaultValues, FieldValues, UseFormReturn } from 'react-hook-form'
import type { ZodType } from 'zod'
import type {
  ContentCampaignAccessPatch,
  ContentTypeKey,
  ResolvedContentCampaignAccess,
} from '@rpg/contracts'
import { Heading, InsetPanel } from '@rpg/ui'

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
import { useAdvisoryFormSubmit, type AdvisoryFormSubmitOptions } from './use-advisory-form-submit'
import type { CoordinatedSaveSavedEvent } from './use-content-save-session'
import { ContentSchemaFormShell } from './content-schema-form-shell'

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
  publishSuccess?: boolean
  publishSchema?: ZodType<TFormValues>
  onPublish?: () => Promise<void>
  campaignId: string
  entityId?: string
  campaignAccess?: ResolvedContentCampaignAccess
  onCampaignAccessDraftChange?: (patch: ContentCampaignAccessPatch) => void
  onCampaignAccessPersisted?: (access: ResolvedContentCampaignAccess) => void
  onSaved?: (event: CoordinatedSaveSavedEvent) => void
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
  publishSuccess,
  publishSchema,
  onPublish,
  campaignId,
  entityId,
  campaignAccess,
  onCampaignAccessDraftChange,
  onCampaignAccessPersisted,
  onSaved,
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
      publishSuccess={publishSuccess}
      onSaved={onSaved}
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
      }}
    />
  )
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
