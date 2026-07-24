'use client'

import { useState } from 'react'
import { useWatch } from 'react-hook-form'
import { ConfirmDialog } from '@rpg/ui'

import type { ContentCampaignAccessPatch, ResolvedSubclass } from '@rpg/contracts'
import { getErrorMessage } from '@rpg/contracts'

import { AvailabilityAlert, resolveAvailability } from '@/lib/availability'
import type { ContentFormCtx } from '../../lib/forms/content-form-registry'
import { campaignRulesFromCtx } from '../../lib/form-options/content-campaign-rules'
import { useCreateSubclass, useUpdateSubclass } from '../hooks/use-subclass-mutations'
import { useReportSubclassUnsavedEdits } from '../hooks/subclass-unsaved-edits-context.client'
import { useSubclassDeleteFlow } from '../hooks/use-subclass-delete-flow.client'
import { useSubclassEditorState } from '../hooks/use-subclass-editor-state'
import type { FeatureRowForm } from '../lib/class-feature-form-fields'
import { isSubclassChoiceFeatureRow } from '../lib/class-subclass-choice-features'
import { useSubclasses } from '../hooks/use-subclasses'
import { isDraftSubclassId } from '../lib/subclasses/subclass-editor-constants'
import { subclassFormDef } from '../lib/subclasses/subclass-form-values'
import type { SubclassFormValues } from '../lib/subclasses/subclass-form-fields'
import { updateContentCampaignAccess } from '../../lib/campaign-access/campaign-access-api'
import { CAMPAIGN_ACCESS_CREATE_DEFERRED_ERROR } from '../../lib/campaign-access/campaign-access-labels'
import {
  CampaignAccessFormProvider,
  useCampaignAccessForm,
} from '../../lib/campaign-access/campaign-access-form-context.client'
import { isDefaultCampaignAccessPatch } from '../../lib/campaign-access/campaign-access-state'
import {
  mapCampaignAccessSaveResult,
  runContentSaveSession,
} from '../../lib/forms/shells/content-save-session.lib'
import {
  SubclassChoiceLevelGate,
  SubclassCreateGate,
  SubclassEmptySelectionGate,
  SubclassLoadingGate,
} from './class-subclasses-tab-gates'
import { SubclassEditorPanel } from './subclass-editor-panel.client'
import { SubclassListPanel } from './subclass-list-panel.client'
import { SubclassDeleteDialog } from './subclass-delete-dialog.client'

export interface ClassSubclassesTabProps {
  campaignId?: string
  classId?: string
  mode?: 'create' | 'edit'
  formCtx?: ContentFormCtx
  /** Test/story override — skips the subclasses query when provided. */
  subclassesOverride?: ResolvedSubclass[]
}

const EMPTY_SUBCLASSES: ResolvedSubclass[] = []

function useSubclassTabData(
  mode: ClassSubclassesTabProps['mode'],
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

function SubclassesDisabledAlert({
  campaignId,
  formCtx,
}: {
  campaignId: string
  formCtx: ContentFormCtx
}) {
  const campaignRules = campaignRulesFromCtx(formCtx)
  if (campaignRules.subclassing.enabled) return null

  return (
    <AvailabilityAlert
      availability={resolveAvailability([
        {
          code: 'subclasses-disabled',
          settingId: 'characterCreation.subclasses.enabled',
        },
      ])}
      context={{ campaignId }}
    />
  )
}

type SubclassEditorState = ReturnType<typeof useSubclassEditorState>

async function persistSubclassCampaignAccess(args: {
  campaignId: string
  classId: string
  subclassId: string
  pendingAccess: ContentCampaignAccessPatch | null | undefined
  onDeferredError: (message: string) => void
}): Promise<void> {
  const { campaignId, classId, subclassId, pendingAccess, onDeferredError } = args
  if (!pendingAccess || isDefaultCampaignAccessPatch(pendingAccess)) return

  try {
    await updateContentCampaignAccess(campaignId, 'subclasses', subclassId, pendingAccess, {
      classId,
    })
  } catch {
    onDeferredError(CAMPAIGN_ACCESS_CREATE_DEFERRED_ERROR)
  }
}

function useSubclassTabSave(args: {
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
        const input = subclassFormDef.toInput(
          values,
          classId,
          editor.selectedEntity ? { entity: editor.selectedEntity } : undefined,
        )
        const saved = await createMutation.mutateAsync(input)
        await persistSubclassCampaignAccess({
          campaignId,
          classId,
          subclassId: saved.id,
          pendingAccess: options?.campaignAccessDraft,
          onDeferredError: setCampaignAccessDeferredError,
        })
        editor.commitDraftHandoff(selectedId, saved)
        return
      }

      const bodyDirty = !options?.accessOnly && editor.modifiedIds.has(selectedId)
      const outcome = await runContentSaveSession(
        {
          dirty: campaignAccessForm.isDirty,
          save: async () => mapCampaignAccessSaveResult(await campaignAccessForm.save()),
        },
        {
          dirty: bodyDirty,
          save: async () => {
            const input = subclassFormDef.toInput(
              values,
              classId,
              editor.selectedEntity ? { entity: editor.selectedEntity } : undefined,
            )
            await updateMutation.mutateAsync({
              subclassId: selectedId,
              input,
            })
            editor.clearEditsFor(selectedId)
            return { status: 'saved' as const }
          },
        },
      )

      if (outcome.status === 'body_failed') {
        setSaveError(getErrorMessage(outcome.error, 'Could not save subclass.'))
      } else if (outcome.status === 'access_invalid' || outcome.status === 'body_invalid') {
        setSaveError('Could not save subclass campaign access.')
      }
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

function ClassSubclassesTabBody({
  campaignId,
  classId,
  formCtx,
  editor,
  defaultFeatureLevel,
}: {
  campaignId: string
  classId: string
  formCtx: ContentFormCtx
  editor: SubclassEditorState
  defaultFeatureLevel: number
}) {
  const {
    handleSave,
    saveError,
    campaignAccessDeferredError,
    savePending,
    isBodyDirty,
    isAccessDirty,
  } = useSubclassTabSave({
    campaignId,
    classId,
    editor,
  })
  const [switchTargetId, setSwitchTargetId] = useState<string | null>(null)

  useReportSubclassUnsavedEdits(editor.hasUnsavedEdits)

  const deleteFlow = useSubclassDeleteFlow({
    campaignId,
    classId,
    onDeleted: (subclassId) => {
      editor.removeLocalRow(subclassId)
    },
  })

  const handleDeleteRequest = (id: string) => {
    const item = editor.listItems.find((entry) => entry.id === id)
    if (!item) return

    if (item.source === 'unsaved' || isDraftSubclassId(id)) {
      editor.handleDeleteRequest(id)
      return
    }

    if (item.source === 'homebrew') {
      void deleteFlow.handleDeleteClick(id, item.name, item.source)
    }
  }

  const handleSelect = (id: string) => {
    if (
      editor.selectedId &&
      editor.selectedId !== id &&
      editor.modifiedIds.has(editor.selectedId)
    ) {
      setSwitchTargetId(id)
      return
    }
    editor.setSelectedId(id)
  }

  return (
    <>
      <div className="space-y-6">
        <SubclassesDisabledAlert campaignId={campaignId} formCtx={formCtx} />
        {saveError ? (
          <p className="text-sm text-destructive" role="alert">
            {saveError}
          </p>
        ) : null}
        {campaignAccessDeferredError ? (
          <p className="text-sm text-warning" role="status">
            {campaignAccessDeferredError}
          </p>
        ) : null}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <SubclassListPanel
            items={editor.listItems}
            selectedId={editor.selectedId}
            modifiedIds={editor.modifiedIds}
            onSelect={handleSelect}
            onAdd={editor.handleAdd}
            onDeleteRequest={handleDeleteRequest}
          />

          <div className="md:col-span-2">
            {editor.selectedId && editor.selectedValues ? (
              <SubclassEditorPanel
                key={editor.selectedId}
                subclassId={editor.selectedId}
                classId={classId}
                campaignId={campaignId}
                entity={editor.selectedEntity}
                defaultValues={editor.selectedValues}
                defaultFeatureLevel={defaultFeatureLevel}
                formCtx={formCtx}
                savePending={savePending}
                isBodyDirty={isBodyDirty}
                isAccessDirty={isAccessDirty}
                onValuesChange={editor.handleValuesChange}
                onSave={handleSave}
                onDeleteRequest={() => handleDeleteRequest(editor.selectedId!)}
              />
            ) : (
              <SubclassEmptySelectionGate />
            )}
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={switchTargetId !== null}
        onOpenChange={(open) => {
          if (!open) setSwitchTargetId(null)
        }}
        headline="Discard subclass changes?"
        description="This subclass has unsaved changes. Switching rows will lose them."
        confirmLabel="Discard"
        cancelLabel="Keep editing"
        confirmVariant="destructive"
        onConfirm={() => {
          if (editor.selectedId) editor.clearEditsFor(editor.selectedId)
          if (switchTargetId) editor.setSelectedId(switchTargetId)
          setSwitchTargetId(null)
        }}
        onCancel={() => setSwitchTargetId(null)}
      />

      <SubclassDeleteDialog
        open={
          editor.deleteTargetId !== null &&
          (editor.deleteTargetItem?.source === 'unsaved' ||
            isDraftSubclassId(editor.deleteTargetId))
        }
        subclassName={editor.deleteTargetItem?.name ?? 'Untitled subclass'}
        onOpenChange={(open) => {
          if (!open) editor.handleDeleteDismiss()
        }}
        onConfirm={editor.handleDeleteConfirmLocal}
      />

      {deleteFlow.dialogs}
    </>
  )
}

export function ClassSubclassesTab({
  campaignId,
  classId,
  mode = 'create',
  formCtx = {},
  subclassesOverride,
}: ClassSubclassesTabProps) {
  const features = useWatch({ name: 'features' }) as FeatureRowForm[] | undefined
  const subclassChoiceFeature = features?.find(isSubclassChoiceFeatureRow)
  const { subclasses, isPending } = useSubclassTabData(
    mode,
    campaignId,
    classId,
    subclassesOverride,
  )
  const editor = useSubclassEditorState(classId, subclasses)

  if (mode === 'create' || !campaignId || !classId) {
    return <SubclassCreateGate />
  }

  if (!subclassChoiceFeature) {
    return <SubclassChoiceLevelGate />
  }

  if (isPending) {
    return <SubclassLoadingGate />
  }

  return (
    <CampaignAccessFormProvider>
      <ClassSubclassesTabBody
        campaignId={campaignId}
        classId={classId}
        formCtx={formCtx}
        editor={editor}
        defaultFeatureLevel={Number(subclassChoiceFeature.level)}
      />
    </CampaignAccessFormProvider>
  )
}
