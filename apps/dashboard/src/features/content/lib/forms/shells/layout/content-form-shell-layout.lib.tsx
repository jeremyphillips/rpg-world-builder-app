import type { FieldValues, UseFormReturn } from 'react-hook-form'
import { useState } from 'react'
import type {
  ContentCampaignAccessPatch,
  ContentTypeKey,
  ResolvedContentCampaignAccess,
} from '@rpg/contracts'
import { emptyContentMediaSchema, type ContentMediaDomain } from '@rpg/contracts'
import { Button, cn, fieldStackRhythmVariants } from '@rpg/ui'
import { FormItems, resolveFormDensity, useFormSectionContext, type FormItem } from '@rpg/ui/form'

import type { UnsavedChangesConfirmController } from '@/lib/form-unsaved-changes-guard'
import type { CampaignAvailabilityPresentation } from '@/lib/campaign-availability/campaign-availability-form-fields'
import { MediaManager, type MediaManagerSave } from '@/features/media'

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
  form?: UseFormReturn<FieldValues>
  mediaDomain?: ContentMediaDomain
}

function resolveMediaDomain(routeKey: string): ContentMediaDomain | undefined {
  const domains: Record<string, ContentMediaDomain> = {
    characters: 'character',
    classes: 'class',
    species: 'species',
    equipment: 'equipment',
    locations: 'location',
    organizations: 'organization',
  }
  return domains[routeKey]
}

function ContentMediaIdentitySlot({
  domain,
  form,
  campaignId,
}: {
  domain: ContentMediaDomain
  form: UseFormReturn<FieldValues>
  campaignId?: string
}) {
  const [open, setOpen] = useState(false)
  const media =
    (form.getValues('media') as typeof emptyContentMediaSchema | undefined) ??
    emptyContentMediaSchema
  const onSave = (change: MediaManagerSave) => {
    form.setValue('media', change.media, { shouldDirty: true, shouldTouch: true })
  }
  return (
    <>
      <Button type="button" variant="outline" onClick={() => setOpen(true)}>
        {media.images.length ? `${media.images.length} images · Manage images` : 'Add image'}
      </Button>
      <MediaManager
        open={open}
        onOpenChange={setOpen}
        domain={domain}
        value={media}
        scope={{ kind: 'campaign-content', campaignId: campaignId ?? 'draft' }}
        mode="form"
        onSave={onSave}
      />
    </>
  )
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
  form,
  mediaDomain,
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
      <div className="flex items-end justify-between gap-4">
        <div className="min-w-0 flex-1">
          <FormItems items={items} idPrefix={idPrefix} />
        </div>
        {form && (mediaDomain ?? resolveMediaDomain(def.routeKey)) ? (
          <ContentMediaIdentitySlot
            domain={mediaDomain ?? resolveMediaDomain(def.routeKey)!}
            form={form}
            campaignId={campaignId}
          />
        ) : null}
      </div>
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
