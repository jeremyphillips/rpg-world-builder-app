import React, { useEffect, useRef, useState, type RefObject } from 'react'
import { useForm } from 'react-hook-form'
import { FormUiProvider, makeResolver } from '@rpg/ui/form'
import { useRunnerFormSubmit } from '@/lib/runner-form-submit.lib'
import {
  ContentFormSubmitSuperseded,
  ContentFormSubmitValidationFailed,
} from '../../lib/forms/shells/submit/content-form-submit-types.lib'
import type { ContentCampaignAccessPatch, ResolvedSubclass } from '@rpg/contracts'
import { DEFAULT_CONTENT_CAMPAIGN_ACCESS } from '@rpg/contracts'

import { useCampaignAccessForm } from '../../lib/campaign-access/campaign-access-form-state'
import type { ContentFormCtx } from '../../lib/forms/registry/content-form-registry'
import {
  buildSubclassFields,
  type SubclassFormValues,
} from '../lib/subclasses/subclass-form-fields'
import { isSubclassFormValuesLike } from '../lib/subclasses/subclass-form-value-snapshot'
import { isDraftSubclassId } from '../lib/subclasses/subclass-editor-constants'
import { subclassFormDef } from '../lib/subclasses/subclass-form-values'

type UseSubclassDetailEditorOptions = {
  subclassId: string
  classId: string
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
    options?: {
      campaignAccessDraft?: ContentCampaignAccessPatch | null
      accessOnly?: boolean
      overlayBaseline?: Record<string, unknown> | null
    },
  ) => Promise<void>
  overlayBaselineRef?: RefObject<Record<string, unknown> | null>
}

export function useSubclassDetailEditor({
  subclassId,
  classId,
  entity,
  defaultValues,
  overlayBaselineRef: externalOverlayBaselineRef,
  defaultFeatureLevel,
  formCtx,
  isBodyDirty = false,
  isAccessDirty = false,
  onValuesChange,
  onAvailabilityChange,
  onSave,
}: UseSubclassDetailEditorOptions) {
  const campaignAccessForm = useCampaignAccessForm()
  const fields = buildSubclassFields(formCtx, { defaultFeatureLevel })
  if (!fields[0]) {
    throw new Error('Subclass fields must include a name field.')
  }

  const internalOverlayBaselineRef = useRef<Record<string, unknown> | null>(null)
  const overlayBaselineRef = externalOverlayBaselineRef ?? internalOverlayBaselineRef

  useEffect(() => {
    if (entity?.catalogLayer !== 'system') {
      overlayBaselineRef.current = null
      return
    }
    overlayBaselineRef.current = subclassFormDef.normalizeOverlayBody!(defaultValues, classId, {
      entity,
    })
  }, [classId, defaultValues, entity, overlayBaselineRef])

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

  const { onSubmit: runSubclassSave, ProducerBoundary } = useRunnerFormSubmit<SubclassFormValues>({
    schema: subclassFormDef.schema,
    resolverFields: fields,
    formId: `subclass-editor-${subclassId}`,
    fallbackMessage: 'Could not save subclass.',
    mountProducerChrome: true,
    persist: async (values) => {
      if (isDraftSubclassId(subclassId)) {
        await onSaveRef.current(values, { campaignAccessDraft: campaignAccessDraftRef.current })
        return
      }
      await onSaveRef.current(values, { overlayBaseline: overlayBaselineRef.current })
    },
  })

  const handleSave = () => {
    if (isDraftSubclassId(subclassId)) {
      void runSubclassSave(form.getValues(), form).catch((error) => {
        if (
          error instanceof ContentFormSubmitValidationFailed ||
          error instanceof ContentFormSubmitSuperseded
        ) {
          return
        }
        throw error
      })
      return
    }

    const hasUnsavedEdits = isBodyDirty || isAccessDirty || campaignAccessForm.isDirty
    if (!hasUnsavedEdits) return

    if (isBodyDirty) {
      void runSubclassSave(form.getValues(), form).catch((error) => {
        if (
          error instanceof ContentFormSubmitValidationFailed ||
          error instanceof ContentFormSubmitSuperseded
        ) {
          return
        }
        throw error
      })
      return
    }

    void onSaveRef.current(form.getValues(), { accessOnly: true })
  }

  function SubclassEditorShell({ children }: { children: React.ReactNode }): React.ReactElement {
    return React.createElement(FormUiProvider, {
      fields,
      uiStateKey: `subclass-editor-${subclassId}`,
      children: React.createElement(ProducerBoundary, null, children),
    })
  }

  return {
    form,
    fields,
    campaignAccess,
    handleCampaignAccessDraft,
    handleCampaignAccessPersisted,
    handleSave,
    SubclassEditorShell,
  }
}
