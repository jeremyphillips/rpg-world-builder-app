import type { FieldValues, UseFormReturn } from 'react-hook-form'
import type {
  ContentCampaignAccessPatch,
  ContentTypeKey,
  ResolvedContentCampaignAccess,
} from '@rpg/contracts'
import { FormItems } from '@rpg/ui/form'

import { CampaignAccessSection } from '../../campaign-access/campaign-access-section.client'
import { useContentSaveSession, type CoordinatedSaveSavedEvent } from './use-content-save-session'
import { ContentFormFooter } from './content-form-footer'
import type { AnyContentFormDef, ContentFormCtx } from '../content-form-registry'

export interface ContentFormCampaignAccessProps {
  def: AnyContentFormDef
  ctx: ContentFormCtx
  formKey?: string
  campaignId?: string
  entityId?: string
  campaignAccess?: ResolvedContentCampaignAccess
  onCampaignAccessDraftChange?: (patch: ContentCampaignAccessPatch) => void
  onCampaignAccessPersisted?: (access: ResolvedContentCampaignAccess) => void
}

export function ContentFormHeader({
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

export interface ContentFormFooterShellProps<TFormValues extends FieldValues = FieldValues> {
  formMode: 'create' | 'edit'
  backHref?: string
  submitLabel: string
  submitPending: boolean
  onSaveDraft?: (values: TFormValues, form: UseFormReturn<TFormValues>) => void | Promise<void>
  saveDraftPending?: boolean
  onSubmit: (values: TFormValues, form: UseFormReturn<TFormValues>) => Promise<void>
  onSaved?: (event: CoordinatedSaveSavedEvent) => void
}

export function ContentFormSaveFooter<TFormValues extends FieldValues>({
  form,
  formMode,
  backHref,
  submitLabel,
  submitPending,
  onSaveDraft,
  saveDraftPending,
  onSubmit,
  onSaved,
}: ContentFormFooterShellProps<TFormValues> & { form: UseFormReturn<TFormValues> }) {
  const actionState = useContentSaveSession({
    mode: formMode,
    pending: submitPending,
    form,
    onSubmit,
    onSaved,
  })

  return (
    <ContentFormFooter
      mode={formMode}
      form={form}
      backHref={backHref}
      submitLabel={submitLabel}
      pending={submitPending || form.formState.isSubmitting}
      onSaveDraft={onSaveDraft}
      saveDraftPending={saveDraftPending}
      actionState={formMode === 'edit' ? actionState : undefined}
      guardHasUnsavedEdits={formMode === 'create' ? actionState.hasUnsavedEdits : false}
    />
  )
}
