import { useCallback, useMemo, useRef, useState } from 'react'
import { ConfirmDialog, Text } from '@rpg/ui'

import type { ResolvedSubclass } from '@rpg/contracts'

import { AvailabilityAlert, resolveAvailability } from '@/lib/availability'
import type { ContentFormCtx } from '../../lib/forms/registry/content-form-registry'
import { campaignRulesFromCtx } from '../../lib/form-options/content-campaign-rules'
import { CampaignAccessFormProvider } from '../../lib/campaign-access/campaign-access-form-context'
import { openCampaignAvailabilityDialog } from '../../lib/campaign-access/open-campaign-availability-dialog.lib'
import { NestedResourceMasterDetailEditor } from '../../components/master-detail/nested-resource-master-detail-editor'
import { MasterDetailDeleteDialog } from '../../components/master-detail/master-detail-delete-dialog'
import { masterDetailItemNounLabel } from '../../lib/master-detail/master-detail-constants'
import { useMasterDetailCollectionAvailability } from '../../lib/master-detail/use-master-detail-collection-availability'
import { useClassSubclassesTabState, useSubclassTabSave } from '../hooks/use-class-subclasses-tab'
import { useReportSubclassUnsavedEdits } from '../hooks/use-subclass-unsaved-edits'
import { useSubclassDeleteFlow } from '../hooks/use-subclass-delete-flow'
import type { SubclassEditorState } from '../hooks/use-subclass-editor-state'
import { buildSubclassMasterDetailListItem } from '../lib/subclasses/build-subclass-master-detail-list-item'
import { buildSubclassAvailabilityPresentations } from '../lib/subclasses/subclass-availability.lib'
import { isDraftSubclassId } from '../lib/subclasses/subclass-editor-constants'
import { buildSubclassSelectedIdentity } from '../lib/subclasses/subclass-master-detail.lib'
import { SUBCLASS_MASTER_DETAIL_ITEM_NOUN } from '../lib/subclasses/subclass-form-labels'
import type { SubclassTabGateKind } from '../lib/subclasses/subclass-tab-state.lib'
import {
  SubclassChoiceLevelGate,
  SubclassCreateGate,
  SubclassLoadingGate,
} from './subclasses/class-subclasses-tab-gates'
import { SubclassDetailEditor } from './subclasses/subclass-detail-editor'

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
  const [accessOverrides, setAccessOverrides] = useState<Record<string, boolean>>({})
  const campaignAccessDialogRef = useRef<HTMLDivElement>(null)

  const availabilityItems = useMemo(
    () =>
      buildSubclassAvailabilityPresentations(editor.listItems, editor.subclasses, accessOverrides),
    [accessOverrides, editor.listItems, editor.subclasses],
  )

  const { visibleItems, isSelectedVisible, countSupplement } =
    useMasterDetailCollectionAvailability({
      items: availabilityItems,
      selectedId: editor.selectedId,
      onSelectedIdChange: editor.setSelectedId,
    })

  const listItems = useMemo(() => {
    const byId = new Map(editor.listItems.map((item) => [item.id, item]))
    return visibleItems.flatMap((entry) => {
      const item = byId.get(entry.rowId)
      if (!item) return []
      return [
        buildSubclassMasterDetailListItem({
          item,
          isModified: editor.modifiedIds.has(item.id),
          isAvailable: entry.isAvailable,
        }),
      ]
    })
  }, [editor.listItems, editor.modifiedIds, visibleItems])

  const selectedAvailability = useMemo(
    () => availabilityItems.find((item) => item.rowId === editor.selectedId),
    [availabilityItems, editor.selectedId],
  )

  const selectedListItem = useMemo(
    () => editor.listItems.find((item) => item.id === editor.selectedId),
    [editor.listItems, editor.selectedId],
  )

  const handleSelectedAvailabilityChange = useCallback(() => {
    openCampaignAvailabilityDialog(campaignAccessDialogRef.current)
  }, [])

  const selectedIdentity = useMemo(() => {
    const identity = buildSubclassSelectedIdentity({
      selectedId: editor.selectedId,
      selectedValues: editor.selectedValues,
      selectedListItem,
      selectedEntity: editor.selectedEntity,
      selectedAvailability,
      modifiedIds: editor.modifiedIds,
    })
    if (!identity) return undefined
    return { ...identity, onAvailabilityChange: handleSelectedAvailabilityChange }
  }, [
    editor.modifiedIds,
    editor.selectedEntity,
    editor.selectedId,
    editor.selectedValues,
    handleSelectedAvailabilityChange,
    selectedAvailability,
    selectedListItem,
  ])

  const handleAvailabilityChange = useCallback((subclassId: string, isAvailable: boolean) => {
    setAccessOverrides((current) => ({ ...current, [subclassId]: isAvailable }))
  }, [])

  useReportSubclassUnsavedEdits(editor.hasUnsavedEdits)

  const deleteFlow = useSubclassDeleteFlow({
    campaignId,
    classId,
    onDeleted: (subclassId) => {
      editor.removeLocalRow(subclassId)
    },
  })

  const handleDeleteRequest = useCallback(
    (id: string) => {
      const item = editor.listItems.find((entry) => entry.id === id)
      if (!item) return

      if (item.catalogLayer === 'unsaved' || isDraftSubclassId(id)) {
        editor.handleDeleteRequest(id)
        return
      }

      if (item.catalogLayer === 'homebrew') {
        void deleteFlow.handleDeleteClick(id, item.name, item.catalogLayer)
      }
    },
    [deleteFlow, editor],
  )

  const handleSelect = useCallback(
    (id: string) => {
      if (
        editor.selectedId &&
        editor.selectedId !== id &&
        editor.modifiedIds.has(editor.selectedId)
      ) {
        setSwitchTargetId(id)
        return
      }
      editor.setSelectedId(id)
    },
    [editor],
  )

  return (
    <>
      <div className="space-y-6">
        <SubclassesDisabledAlert campaignId={campaignId} formCtx={formCtx} />
        {saveError ? (
          <Text variant="destructive" role="alert">
            {saveError}
          </Text>
        ) : null}
        {campaignAccessDeferredError ? (
          <Text variant="warning" role="status">
            {campaignAccessDeferredError}
          </Text>
        ) : null}

        <NestedResourceMasterDetailEditor
          items={listItems}
          selectedRowId={isSelectedVisible ? editor.selectedId : null}
          onSelectRow={handleSelect}
          onAdd={editor.handleAdd}
          listTitle="Subclasses"
          ariaLabel="Subclasses"
          addLabel="Add subclass"
          itemNoun={SUBCLASS_MASTER_DETAIL_ITEM_NOUN}
          countSupplement={countSupplement}
          selectedIdentity={isSelectedVisible ? selectedIdentity : undefined}
          onDelete={editor.selectedId ? () => handleDeleteRequest(editor.selectedId!) : undefined}
          renderDetail={({ rowId }) =>
            editor.selectedValues ? (
              <SubclassDetailEditor
                key={rowId}
                subclassId={rowId}
                classId={classId}
                campaignId={campaignId}
                entity={editor.selectedEntity}
                defaultValues={editor.selectedValues}
                defaultFeatureLevel={defaultFeatureLevel}
                formCtx={formCtx}
                savePending={savePending}
                isBodyDirty={isBodyDirty}
                isAccessDirty={isAccessDirty}
                campaignAccessDialogRef={campaignAccessDialogRef}
                onValuesChange={editor.handleValuesChange}
                onAvailabilityChange={handleAvailabilityChange}
                onSave={handleSave}
              />
            ) : null
          }
        />
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

      <MasterDetailDeleteDialog
        open={
          editor.deleteTargetId !== null &&
          (editor.deleteTargetItem?.catalogLayer === 'unsaved' ||
            isDraftSubclassId(editor.deleteTargetId))
        }
        itemNoun={masterDetailItemNounLabel(SUBCLASS_MASTER_DETAIL_ITEM_NOUN)}
        itemName={editor.deleteTargetItem?.name ?? 'Untitled subclass'}
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
      />
    </CampaignAccessFormProvider>
  )
}
