'use client'

import { useState } from 'react'
import { ConfirmDialog } from '@rpg/ui'

import type { ContentUsageSummaryLabels, ResolvedSubclass } from '@rpg/contracts'

import { AvailabilityAlert, resolveAvailability } from '@/lib/availability'
import type { ContentFormCtx } from '../../lib/forms/registry/content-form-registry'
import { campaignRulesFromCtx } from '../../lib/form-options/content-campaign-rules'
import { CampaignAccessFormProvider } from '../../lib/campaign-access/campaign-access-form-context.client'
import {
  useClassSubclassesTabState,
  useSubclassTabSave,
} from '../hooks/use-class-subclasses-tab.client'
import { useReportSubclassUnsavedEdits } from '../hooks/subclass-unsaved-edits-context.client'
import { useSubclassDeleteFlow } from '../hooks/use-subclass-delete-flow.client'
import type { SubclassEditorState } from '../hooks/use-subclass-editor-state'
import { isDraftSubclassId } from '../lib/subclasses/subclass-editor-constants'
import type { SubclassTabGateKind } from '../lib/subclasses/subclass-tab-state.lib'
import {
  SubclassChoiceLevelGate,
  SubclassCreateGate,
  SubclassEmptySelectionGate,
  SubclassLoadingGate,
} from './subclasses/class-subclasses-tab-gates'
import { SubclassEditorPanel } from './subclasses/subclass-editor-panel.client'
import { SubclassListPanel } from './subclasses/subclass-list-panel.client'
import { SubclassDeleteDialog } from './subclasses/subclass-delete-dialog.client'

export interface ClassSubclassesTabProps {
  campaignId?: string
  classId?: string
  mode?: 'create' | 'edit'
  formCtx?: ContentFormCtx
  /** Test/story override — skips the subclasses query when provided. */
  subclassesOverride?: ResolvedSubclass[]
}

function renderSubclassTabGate(gate: SubclassTabGateKind) {
  switch (gate) {
    case 'create':
      return <SubclassCreateGate />
    case 'choice-level':
      return <SubclassChoiceLevelGate />
    case 'loading':
      return <SubclassLoadingGate />
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

function ClassSubclassesTabBody({
  campaignId,
  classId,
  formCtx,
  editor,
  defaultFeatureLevel,
  usageSummaryLabels,
}: {
  campaignId: string
  classId: string
  formCtx: ContentFormCtx
  editor: SubclassEditorState
  defaultFeatureLevel: number
  usageSummaryLabels?: ContentUsageSummaryLabels
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
            usageSummaryLabels={usageSummaryLabels}
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

export function ClassSubclassesTab(props: ClassSubclassesTabProps) {
  const state = useClassSubclassesTabState(props)

  if (state.kind === 'gate') {
    return renderSubclassTabGate(state.gate)
  }

  return (
    <CampaignAccessFormProvider>
      <ClassSubclassesTabBody
        campaignId={state.campaignId}
        classId={state.classId}
        formCtx={state.formCtx}
        editor={state.editor}
        defaultFeatureLevel={state.defaultFeatureLevel}
        usageSummaryLabels={state.usageSummaryLabels}
      />
    </CampaignAccessFormProvider>
  )
}
