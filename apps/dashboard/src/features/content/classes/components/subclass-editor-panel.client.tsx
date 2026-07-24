'use client'

import { useEffect, useRef, useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { Button } from '@rpg/ui'
import { FormItems, makeResolver } from '@rpg/ui/form'
import type { ContentCampaignAccessPatch, ResolvedSubclass } from '@rpg/contracts'
import { DEFAULT_CONTENT_CAMPAIGN_ACCESS } from '@rpg/contracts'

import type { ContentFormCtx } from '../../lib/forms/content-form-registry'
import { CampaignAccessSection } from '../../lib/campaign-access/campaign-access-section.client'
import { useCampaignAccessForm } from '../../lib/campaign-access/campaign-access-form-context.client'
import { ContentEditHeadingBadges } from '../../lib/campaign-access/content-edit-heading-badges.client'
import { isDraftSubclassId, isSubclassDeletable } from '../lib/subclasses/subclass-editor-constants'
import {
  buildSubclassFields,
  type SubclassFormValues,
} from '../lib/subclasses/subclass-form-fields'
import { isSubclassFormValuesLike } from '../lib/subclasses/subclass-form-value-snapshot'
import { subclassFormDef } from '../lib/subclasses/subclass-form-values'

export interface SubclassEditorPanelProps {
  subclassId: string
  classId: string
  campaignId: string
  entity?: ResolvedSubclass
  defaultValues: SubclassFormValues
  defaultFeatureLevel?: number
  formCtx: ContentFormCtx
  savePending?: boolean
  isBodyDirty?: boolean
  isAccessDirty?: boolean
  onValuesChange: (values: SubclassFormValues) => void
  onSave: (
    values: SubclassFormValues,
    options?: { campaignAccessDraft?: ContentCampaignAccessPatch | null; accessOnly?: boolean },
  ) => Promise<void>
  onDeleteRequest: () => void
}

export function SubclassEditorPanel({
  subclassId,
  classId,
  campaignId,
  entity,
  defaultValues,
  defaultFeatureLevel,
  formCtx,
  savePending = false,
  isBodyDirty = false,
  isAccessDirty = false,
  onValuesChange,
  onSave,
  onDeleteRequest,
}: SubclassEditorPanelProps) {
  const campaignAccessForm = useCampaignAccessForm()
  const source = entity?.source ?? (isDraftSubclassId(subclassId) ? 'homebrew' : 'system')
  const status = entity?.status ?? (isDraftSubclassId(subclassId) ? 'draft' : 'published')
  const deletable = isSubclassDeletable(source, subclassId)
  const fields = buildSubclassFields(formCtx, { defaultFeatureLevel })
  const nameFieldItem = fields[0]
  if (!nameFieldItem) {
    throw new Error('Subclass fields must include a name field.')
  }
  const bodyFields = fields.slice(1)
  const onSaveRef = useRef(onSave)
  const onValuesChangeRef = useRef(onValuesChange)
  const campaignAccessDraftRef = useRef<ContentCampaignAccessPatch | null>(null)
  const [campaignAccess, setCampaignAccess] = useState(
    () => entity?.campaignAccess ?? DEFAULT_CONTENT_CAMPAIGN_ACCESS,
  )

  useEffect(() => {
    onSaveRef.current = onSave
  }, [onSave])

  useEffect(() => {
    onValuesChangeRef.current = onValuesChange
  }, [onValuesChange])

  useEffect(() => {
    setCampaignAccess(entity?.campaignAccess ?? DEFAULT_CONTENT_CAMPAIGN_ACCESS)
  }, [entity?.campaignAccess, subclassId])

  const resolver = makeResolver<SubclassFormValues>(subclassFormDef.schema, fields)

  const form = useForm<SubclassFormValues>({
    resolver,
    defaultValues,
    mode: 'onSubmit',
  })

  useEffect(() => {
    const subscription = form.watch((values) => {
      if (!isSubclassFormValuesLike(values)) return
      onValuesChangeRef.current(values)
    })
    return () => subscription.unsubscribe()
  }, [form])

  const handleSave = () => {
    if (isDraftSubclassId(subclassId)) {
      void form.handleSubmit((values: SubclassFormValues) =>
        onSaveRef.current(values, { campaignAccessDraft: campaignAccessDraftRef.current }),
      )()
      return
    }

    const hasUnsavedEdits = isBodyDirty || isAccessDirty || campaignAccessForm.isDirty
    if (!hasUnsavedEdits) return

    if (isBodyDirty) {
      void form.handleSubmit((values: SubclassFormValues) => onSaveRef.current(values))()
      return
    }

    void onSaveRef.current(form.getValues(), { accessOnly: true })
  }

  return (
    <FormProvider {...form}>
      <div className="space-y-6">
        <div className="flex justify-end">
          <ContentEditHeadingBadges
            source={source}
            status={status}
            campaignAccess={campaignAccess}
          />
        </div>

        <FormItems items={[nameFieldItem]} idPrefix={`subclass-editor-${subclassId}-name`} />

        <CampaignAccessSection
          campaignId={campaignId}
          targetType="subclasses"
          classId={classId}
          entityId={isDraftSubclassId(subclassId) ? undefined : subclassId}
          initialAccess={campaignAccess}
          onDraftChange={(patch) => {
            campaignAccessDraftRef.current = patch
          }}
          onPersistedChange={setCampaignAccess}
        />

        <FormItems items={bodyFields} idPrefix={`subclass-editor-${subclassId}`} />

        <div className="flex flex-wrap items-center justify-end gap-2 border-t border-border pt-4">
          {deletable ? (
            <Button
              type="button"
              variant="outline"
              disabled={savePending}
              onClick={onDeleteRequest}
            >
              Delete subclass
            </Button>
          ) : null}
          <Button type="button" disabled={savePending} onClick={handleSave}>
            Save subclass
          </Button>
        </div>
      </div>
    </FormProvider>
  )
}
