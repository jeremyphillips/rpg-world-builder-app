'use client'

import { useState } from 'react'
import { useWatch } from 'react-hook-form'

import type {
  ContentCampaignAccessPatch,
  ContentUsageSummaryLabels,
  ResolvedSubclass,
} from '@rpg/contracts'
import { getErrorMessage } from '@rpg/contracts'

import type { ContentFormCtx } from '../../lib/forms/registry/content-form-registry'
import { useCampaignAccessForm } from '../../lib/campaign-access/campaign-access-form-context.client'
import { useCreateSubclass, useUpdateSubclass } from './use-subclass-mutations'
import type { FeatureRowForm } from '../lib/class-feature-form-fields'
import { isSubclassChoiceFeatureRow } from '../lib/class-subclass-choice-features'
import { useSubclasses, useSubclassesUsageMeta } from './use-subclasses'
import { useSubclassEditorState, type SubclassEditorState } from './use-subclass-editor-state'
import { isDraftSubclassId } from '../lib/subclasses/subclass-editor-constants'
import type { SubclassFormValues } from '../lib/subclasses/subclass-form-fields'
import {
  resolveDefaultFeatureLevel,
  resolveSubclassTabGate,
  resolveSubclassUsageMetaQuery,
  type SubclassTabGateKind,
  type SubclassTabMode,
} from '../lib/subclasses/subclass-tab-state.lib'
import {
  reportSubclassSaveResult,
  saveDraftSubclass,
  saveExistingSubclass,
} from '../lib/subclasses/subclass-tab-save.lib'

const EMPTY_SUBCLASSES: ResolvedSubclass[] = []

export type UseClassSubclassesTabOptions = {
  campaignId?: string
  classId?: string
  mode?: SubclassTabMode
  formCtx?: ContentFormCtx
  /** Test/story override — skips the subclasses query when provided. */
  subclassesOverride?: ResolvedSubclass[]
}

export type ClassSubclassesTabGateState = {
  kind: 'gate'
  gate: SubclassTabGateKind
}

export type ClassSubclassesTabBodyState = {
  kind: 'body'
  campaignId: string
  classId: string
  formCtx: ContentFormCtx
  editor: SubclassEditorState
  defaultFeatureLevel: number
  usageSummaryLabels?: ContentUsageSummaryLabels
}

export type ClassSubclassesTabState = ClassSubclassesTabGateState | ClassSubclassesTabBodyState

function useSubclassTabData(
  mode: SubclassTabMode | undefined,
  campaignId: string | undefined,
  classId: string | undefined,
  subclassesOverride: ResolvedSubclass[] | undefined,
) {
  const queryEnabled =
    mode === 'edit' && Boolean(campaignId) && Boolean(classId) && subclassesOverride === undefined

  const query = useSubclasses(
    queryEnabled ? campaignId : undefined,
    queryEnabled ? classId : undefined,
  )

  return {
    subclasses: subclassesOverride ?? query.data ?? EMPTY_SUBCLASSES,
    isPending: subclassesOverride ? false : query.isPending,
  }
}

export function useClassSubclassesTabState(
  options: UseClassSubclassesTabOptions,
): ClassSubclassesTabState {
  const { campaignId, classId, mode = 'create', formCtx = {}, subclassesOverride } = options

  const features = useWatch({ name: 'features' }) as FeatureRowForm[] | undefined
  const subclassChoiceFeature = features?.find(isSubclassChoiceFeatureRow)
  const { subclasses, isPending } = useSubclassTabData(
    mode,
    campaignId,
    classId,
    subclassesOverride,
  )
  const usageMetaQuery = resolveSubclassUsageMetaQuery(mode, campaignId, classId)
  const { data: usageMeta } = useSubclassesUsageMeta(
    usageMetaQuery.campaignId,
    usageMetaQuery.classId,
  )
  const editor = useSubclassEditorState(classId, subclasses)

  const gate = resolveSubclassTabGate({
    mode,
    campaignId,
    classId,
    subclassChoiceFeature,
    isPending,
  })
  if (gate) {
    return { kind: 'gate', gate }
  }

  const defaultFeatureLevel = resolveDefaultFeatureLevel(subclassChoiceFeature)
  if (defaultFeatureLevel === null) {
    return { kind: 'gate', gate: 'choice-level' }
  }

  return {
    kind: 'body',
    campaignId: campaignId!,
    classId: classId!,
    formCtx,
    editor,
    defaultFeatureLevel,
    usageSummaryLabels: usageMeta?.usageSummaryLabels,
  }
}

export function useSubclassTabSave(args: {
  campaignId: string
  classId: string
  editor: SubclassEditorState
}) {
  const { campaignId, classId, editor } = args
  const campaignAccessForm = useCampaignAccessForm()
  const createMutation = useCreateSubclass(campaignId, classId)
  const updateMutation = useUpdateSubclass(campaignId, classId)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [campaignAccessDeferredError, setCampaignAccessDeferredError] = useState<string | null>(
    null,
  )

  const handleSave = async (
    values: SubclassFormValues,
    options?: { campaignAccessDraft?: ContentCampaignAccessPatch | null; accessOnly?: boolean },
  ) => {
    if (!editor.selectedId) return
    const selectedId = editor.selectedId

    setSaveError(null)
    setCampaignAccessDeferredError(null)
    editor.setSavePending(true)
    try {
      if (isDraftSubclassId(selectedId)) {
        await saveDraftSubclass({
          campaignId,
          classId,
          draftId: selectedId,
          values,
          existingEntity: editor.selectedEntity,
          pendingAccess: options?.campaignAccessDraft,
          create: (input) => createMutation.mutateAsync(input),
          onDraftSaved: editor.commitDraftHandoff,
          onDeferredAccessError: setCampaignAccessDeferredError,
        })
        return
      }

      const result = await saveExistingSubclass({
        subclassId: selectedId,
        classId,
        values,
        existingEntity: editor.selectedEntity,
        accessOnly: options?.accessOnly,
        bodyWasDirty: editor.modifiedIds.has(selectedId),
        accessWasDirty: campaignAccessForm.isDirty,
        readPendingAvailable: campaignAccessForm.readPendingAvailable,
        readAccessAvailabilityChanged: campaignAccessForm.readAccessAvailabilityChanged,
        saveAccess: () => campaignAccessForm.save(),
        updateBody: ({ subclassId, input }) => updateMutation.mutateAsync({ subclassId, input }),
        onBodySaved: editor.clearEditsFor,
      })
      reportSubclassSaveResult(result, editor.selectedEntity?.name ?? 'Subclass', setSaveError)
    } catch (err) {
      setSaveError(getErrorMessage(err, 'Could not save subclass.'))
    } finally {
      editor.setSavePending(false)
    }
  }

  return {
    handleSave,
    saveError,
    campaignAccessDeferredError,
    savePending:
      editor.savePending ||
      createMutation.isPending ||
      updateMutation.isPending ||
      campaignAccessForm.isPending,
    isBodyDirty: editor.selectedId ? editor.modifiedIds.has(editor.selectedId) : false,
    isAccessDirty: campaignAccessForm.isDirty,
  }
}
