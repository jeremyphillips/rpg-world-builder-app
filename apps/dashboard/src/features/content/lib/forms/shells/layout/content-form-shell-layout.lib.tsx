import type { FieldValues, UseFormReturn } from 'react-hook-form'
import type {
  ContentCampaignAccessPatch,
  ContentTypeKey,
  ResolvedContentCampaignAccess,
} from '@rpg/contracts'
import { cn, fieldStackRhythmVariants } from '@rpg/ui'
import { FormItems, resolveFormDensity, useFormSectionContext, type FormItem } from '@rpg/ui/form'

import type { UnsavedChangesConfirmController } from '@/lib/form-unsaved-changes-guard'
import type { CampaignAvailabilityPresentation } from '@/lib/campaign-availability/campaign-availability-form-fields'

import { useCampaignAccessForm } from '../../../campaign-access/campaign-access-form-context'
import { buildContentAvailabilitySlotItem } from '../../fields/content-availability-slot.lib'
import {
  useContentSaveSession,
  type CoordinatedSaveSavedEvent,
} from '../session/use-content-save-session'
import { ContentFormFooter } from './content-form-footer'
import type { AnyContentFormDef, ContentFormCtx } from '../../registry/content-form-registry'
import {
  buildContentIdentityFields,
  type ContentIdentityLayout,
} from '../../fields/content-identity-form-fields'

export interface ContentFormCampaignAccessProps {
  def: AnyContentFormDef
  ctx: ContentFormCtx
  formKey?: string
  campaignId?: string
  entityId?: string
  campaignAccess?: ResolvedContentCampaignAccess
  onCampaignAccessDraftChange?: (patch: ContentCampaignAccessPatch) => void
  onCampaignAccessPersisted?: (access: ResolvedContentCampaignAccess) => void
  identityLayout?: ContentIdentityLayout
  availabilityPresentation?: CampaignAvailabilityPresentation
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
  identityLayout = 'stacked',
  availabilityPresentation = 'disclosure',
}: ContentFormCampaignAccessProps) {
  const { density } = useFormSectionContext()
  const { rhythm } = resolveFormDensity(density)
  const idPrefix = formKey ?? 'content-form'
  const nameItem = def.nameField(ctx)
  const availabilityItem: FormItem | undefined = campaignId
    ? buildContentAvailabilitySlotItem({
        campaignId,
        targetType: def.routeKey as ContentTypeKey,
        entityId,
        density,
        presentation: availabilityPresentation,
        initialAccess: campaignAccess,
        onDraftChange: onCampaignAccessDraftChange,
        onPersistedChange: onCampaignAccessPersisted,
      })
    : undefined

  const items = availabilityItem
    ? buildContentIdentityFields({
        layout: identityLayout,
        nameItem,
        availabilityItem,
      })
    : [nameItem]

  return (
    <div className={cn(fieldStackRhythmVariants({ rhythm }))}>
      <FormItems items={items} idPrefix={idPrefix} />
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
  onLeaveGuardReady?: (guard: Pick<UnsavedChangesConfirmController, 'runTrusted'>) => void
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
  onLeaveGuardReady,
}: ContentFormFooterShellProps<TFormValues> & { form: UseFormReturn<TFormValues> }) {
  const campaignAccess = useCampaignAccessForm()
  const actionState = useContentSaveSession({
    mode: formMode,
    pending: submitPending,
    form,
    onSubmit,
    onSaved,
  })
  const extraUnsavedEdits =
    formMode === 'create' ? actionState.hasUnsavedEdits : campaignAccess.isDirty

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
      extraUnsavedEdits={extraUnsavedEdits}
      onLeaveGuardReady={onLeaveGuardReady}
    />
  )
}
