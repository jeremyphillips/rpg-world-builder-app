'use client'

import { useFormContext } from 'react-hook-form'

import type { Subclass } from '@rpg/contracts'

import type { ContentFormCtx } from '../../lib/forms/content-form-registry'
import { useSubclassEditorState } from '../hooks/use-subclass-editor-state'
import { useSubclasses } from '../hooks/use-subclasses'
import { SUBCLASS_CHOICE_LEVEL_NONE } from '../lib/class-form-constants'
import { SubclassDeleteDialog } from './subclass-delete-dialog.client'
import {
  SubclassChoiceLevelGate,
  SubclassCreateGate,
  SubclassEmptySelectionGate,
  SubclassLoadingGate,
} from './class-subclasses-tab-gates'
import { SubclassEditorPanel } from './subclass-editor-panel.client'
import { SubclassListPanel } from './subclass-list-panel.client'

export interface ClassSubclassesTabProps {
  campaignId?: string
  classId?: string
  mode?: 'create' | 'edit'
  formCtx?: ContentFormCtx
  /** Test/story override — skips the subclasses query when provided. */
  subclassesOverride?: Subclass[]
}

function useSubclassTabData(
  mode: ClassSubclassesTabProps['mode'],
  campaignId: string | undefined,
  classId: string | undefined,
  subclassesOverride: Subclass[] | undefined,
) {
  const queryEnabled =
    mode === 'edit' && Boolean(campaignId) && Boolean(classId) && subclassesOverride === undefined

  const query = useSubclasses(
    queryEnabled ? campaignId : undefined,
    queryEnabled ? classId : undefined,
  )

  return {
    subclasses: subclassesOverride ?? query.data ?? [],
    isPending: subclassesOverride ? false : query.isPending,
  }
}

function parseDefaultFeatureLevel(subclassChoiceLevel: string): number | undefined {
  return subclassChoiceLevel !== SUBCLASS_CHOICE_LEVEL_NONE
    ? Number(subclassChoiceLevel)
    : undefined
}

export function ClassSubclassesTab({
  campaignId,
  classId,
  mode = 'create',
  formCtx = {},
  subclassesOverride,
}: ClassSubclassesTabProps) {
  const subclassChoiceLevel = useFormContext<{ subclassChoiceLevel: string }>().watch(
    'subclassChoiceLevel',
  )
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

  if (subclassChoiceLevel === SUBCLASS_CHOICE_LEVEL_NONE) {
    return <SubclassChoiceLevelGate />
  }

  if (isPending) {
    return <SubclassLoadingGate />
  }

  const defaultFeatureLevel = parseDefaultFeatureLevel(subclassChoiceLevel)

  return (
    <>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <SubclassListPanel
          items={editor.listItems}
          selectedId={editor.selectedId}
          activeById={editor.activeById}
          modifiedIds={editor.modifiedIds}
          onSelect={editor.setSelectedId}
          onAdd={editor.handleAdd}
          onDeleteRequest={editor.handleDeleteRequest}
        />

        <div className="md:col-span-2">
          {editor.selectedId && editor.selectedValues ? (
            <SubclassEditorPanel
              key={editor.selectedId}
              subclassId={editor.selectedId}
              classId={classId}
              entity={editor.selectedEntity}
              defaultValues={editor.selectedValues}
              activeInCampaign={editor.activeById[editor.selectedId] !== false}
              defaultFeatureLevel={defaultFeatureLevel}
              formCtx={formCtx}
              onActiveChange={(active) => editor.handleActiveChange(editor.selectedId!, active)}
              onValuesChange={editor.handleValuesChange}
              onDeleteRequest={() => editor.handleDeleteRequest(editor.selectedId!)}
            />
          ) : (
            <SubclassEmptySelectionGate />
          )}
        </div>
      </div>

      <SubclassDeleteDialog
        open={editor.deleteTargetId !== null}
        subclassName={editor.deleteTargetItem?.name ?? 'Untitled subclass'}
        onOpenChange={(open) => {
          if (!open) editor.handleDeleteDismiss()
        }}
        onConfirm={editor.handleDeleteConfirm}
      />
    </>
  )
}
