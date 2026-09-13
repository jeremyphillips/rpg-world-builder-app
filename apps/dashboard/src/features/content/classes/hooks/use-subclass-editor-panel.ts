import { useEffect, useRef, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { makeResolver } from '@rpg/ui/form'
import type { ContentCampaignAccessPatch, ResolvedSubclass } from '@rpg/contracts'
import { DEFAULT_CONTENT_CAMPAIGN_ACCESS } from '@rpg/contracts'

import { useCampaignAccessForm } from '../../lib/campaign-access/campaign-access-form-context'
import type { ContentFormCtx } from '../../lib/forms/registry/content-form-registry'
import {
  buildSubclassFields,
  type SubclassFormValues,
} from '../lib/subclasses/subclass-form-fields'
import { isSubclassFormValuesLike } from '../lib/subclasses/subclass-form-value-snapshot'
import { isDraftSubclassId } from '../lib/subclasses/subclass-editor-constants'
import { subclassFormDef } from '../lib/subclasses/subclass-form-values'

type UseSubclassEditorPanelOptions = {
  subclassId: string
  entity?: ResolvedSubclass
  defaultValues: SubclassFormValues
  defaultFeatureLevel?: number
  formCtx: ContentFormCtx
  isBodyDirty?: boolean
  isAccessDirty?: boolean
  onValuesChange: (values: SubclassFormValues) => void
  onAvailabilityChange: (subclassId: string, isAvailable: boolean) => void
  onSave: (
    values: SubclassFormValues,
    options?: { campaignAccessDraft?: ContentCampaignAccessPatch | null; accessOnly?: boolean },
  ) => Promise<void>
}

export function useSubclassEditorPanel({
  subclassId,
  entity,
  defaultValues,
  defaultFeatureLevel,
  formCtx,
  isBodyDirty = false,
  isAccessDirty = false,
  onValuesChange,
  onAvailabilityChange,
  onSave,
}: UseSubclassEditorPanelOptions) {
  const campaignAccessForm = useCampaignAccessForm()
  const fields = buildSubclassFields(formCtx, { defaultFeatureLevel })
  const nameFieldItem = fields[0]
  if (!nameFieldItem) {
    throw new Error('Subclass fields must include a name field.')
  }

  const onSaveRef = useRef(onSave)
  const onValuesChangeRef = useRef(onValuesChange)
  const onAvailabilityChangeRef = useRef(onAvailabilityChange)
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
    onAvailabilityChangeRef.current = onAvailabilityChange
  }, [onAvailabilityChange])

  useEffect(() => {
    setCampaignAccess(entity?.campaignAccess ?? DEFAULT_CONTENT_CAMPAIGN_ACCESS)
  }, [entity?.campaignAccess, subclassId])

  const form = useForm<SubclassFormValues>({
    resolver: makeResolver<SubclassFormValues>(subclassFormDef.schema, fields),
    defaultValues,
    mode: 'onSubmit',
  })

  const watchedName = useWatch({ control: form.control, name: 'name' })

  useEffect(() => {
    const subscription = form.watch((values) => {
      if (!isSubclassFormValuesLike(values)) return
      onValuesChangeRef.current(values)
    })
    return () => subscription.unsubscribe()
  }, [form])

  const handleCampaignAccessPersisted = (access: ResolvedSubclass['campaignAccess']) => {
    setCampaignAccess(access)
    onAvailabilityChangeRef.current(subclassId, access.available)
  }

  const handleCampaignAccessDraft = (patch: ContentCampaignAccessPatch) => {
    campaignAccessDraftRef.current = patch
    onAvailabilityChangeRef.current(subclassId, patch.available)
  }

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

  return {
    form,
    nameFieldItem,
    bodyFields: fields.slice(1),
    campaignAccess,
    watchedName,
    handleCampaignAccessDraft,
    handleCampaignAccessPersisted,
    handleSave,
  }
}
