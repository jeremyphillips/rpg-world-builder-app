import type { Dispatch } from 'react'

import { ActionButton, Button } from '@rpg/ui'

import { DrawerShell } from '@/components/drawer'

import type {
  EquipmentEditorAction,
  EquipmentEditorMode,
} from '../../lib/instance-editor/equipment-editor-types'
import {
  EQUIPMENT_INSTANCE_EDITOR_ADD_ADJUSTMENT_ACTION_LABEL,
  EQUIPMENT_INSTANCE_EDITOR_CANCEL_LABEL,
  EQUIPMENT_INSTANCE_EDITOR_CONTINUE_LABEL,
  EQUIPMENT_INSTANCE_EDITOR_CREATE_CUSTOM_PROPERTY_ACTION_LABEL,
  EQUIPMENT_INSTANCE_EDITOR_CREATE_PROPERTY_LABEL,
  EQUIPMENT_INSTANCE_EDITOR_DONE_LABEL,
  EQUIPMENT_INSTANCE_EDITOR_REMOVE_ADJUSTMENT_LABEL,
  EQUIPMENT_INSTANCE_EDITOR_REMOVE_PROPERTY_LABEL,
  EQUIPMENT_INSTANCE_EDITOR_SAVE_ADJUSTMENT_LABEL,
  EQUIPMENT_INSTANCE_EDITOR_SAVE_PROPERTY_LABEL,
} from '../../lib/instance-editor/equipment-instance-editor-form-labels'

type EditorDispatch = Dispatch<EquipmentEditorAction>

type EquipmentInstanceEditorFooterProps = {
  mode: EquipmentEditorMode
  dispatch: EditorDispatch
  onRequestClose: () => void
  onDone: () => void
}

function DrawerCancelButton({ onRequestClose }: { onRequestClose: () => void }) {
  return (
    <DrawerShell.Close asChild>
      <Button variant="outline" onClick={onRequestClose}>
        {EQUIPMENT_INSTANCE_EDITOR_CANCEL_LABEL}
      </Button>
    </DrawerShell.Close>
  )
}

function SubmodeCancelButton({ dispatch }: { dispatch: EditorDispatch }) {
  return (
    <Button type="button" variant="outline" onClick={() => dispatch({ type: 'cancelSubMode' })}>
      {EQUIPMENT_INSTANCE_EDITOR_CANCEL_LABEL}
    </Button>
  )
}

function ScopeFooter({
  dispatch,
  onRequestClose,
}: {
  dispatch: EditorDispatch
  onRequestClose: () => void
}) {
  return (
    <>
      <DrawerCancelButton onRequestClose={onRequestClose} />
      <Button type="button" onClick={() => dispatch({ type: 'continueFromScope' })}>
        {EQUIPMENT_INSTANCE_EDITOR_CONTINUE_LABEL}
      </Button>
    </>
  )
}

function MainFooter({
  onRequestClose,
  onDone,
}: {
  onRequestClose: () => void
  onDone: () => void
}) {
  return (
    <>
      <DrawerCancelButton onRequestClose={onRequestClose} />
      <Button type="button" onClick={onDone}>
        {EQUIPMENT_INSTANCE_EDITOR_DONE_LABEL}
      </Button>
    </>
  )
}

function EffectChooseFooter({
  mode,
  dispatch,
}: {
  mode: Extract<EquipmentEditorMode, { kind: 'effectChoose' }>
  dispatch: EditorDispatch
}) {
  return (
    <>
      <SubmodeCancelButton dispatch={dispatch} />
      <Button
        type="button"
        disabled={!mode.draft.target}
        onClick={() =>
          dispatch({
            type: 'openEffectForm',
            draft: mode.draft,
            origin: 'new',
          })
        }
      >
        {EQUIPMENT_INSTANCE_EDITOR_CONTINUE_LABEL}
      </Button>
    </>
  )
}

function EffectFormFooter({
  mode,
  dispatch,
}: {
  mode: Extract<EquipmentEditorMode, { kind: 'effectForm' }>
  dispatch: EditorDispatch
}) {
  const effectId = mode.draft.effectId
  return (
    <>
      {mode.origin === 'existing' && effectId ? (
        <Button
          type="button"
          variant="outline"
          onClick={() => dispatch({ type: 'removeEffect', effectId })}
        >
          {EQUIPMENT_INSTANCE_EDITOR_REMOVE_ADJUSTMENT_LABEL}
        </Button>
      ) : null}
      <SubmodeCancelButton dispatch={dispatch} />
      <Button
        type="button"
        onClick={() =>
          dispatch({
            type: 'commitEffectDraft',
            draft: mode.draft,
            replace: mode.origin === 'existing',
          })
        }
      >
        {mode.origin === 'existing'
          ? EQUIPMENT_INSTANCE_EDITOR_SAVE_ADJUSTMENT_LABEL
          : EQUIPMENT_INSTANCE_EDITOR_ADD_ADJUSTMENT_ACTION_LABEL}
      </Button>
    </>
  )
}

function PropertyBrowseFooter({ dispatch }: { dispatch: EditorDispatch }) {
  return (
    <>
      <ActionButton
        action="add"
        variant="ghost"
        onClick={() => dispatch({ type: 'openPropertyCreate', origin: 'browse' })}
      >
        {EQUIPMENT_INSTANCE_EDITOR_CREATE_CUSTOM_PROPERTY_ACTION_LABEL}
      </ActionButton>
      <SubmodeCancelButton dispatch={dispatch} />
    </>
  )
}

function PropertyCreateFooter({
  mode,
  dispatch,
}: {
  mode: Extract<EquipmentEditorMode, { kind: 'propertyCreate' }>
  dispatch: EditorDispatch
}) {
  const customId = mode.draft.customId
  return (
    <>
      {customId ? (
        <Button
          type="button"
          variant="outline"
          onClick={() => dispatch({ type: 'removeMagicProperty', kind: 'custom', id: customId })}
        >
          {EQUIPMENT_INSTANCE_EDITOR_REMOVE_PROPERTY_LABEL}
        </Button>
      ) : null}
      <SubmodeCancelButton dispatch={dispatch} />
      <Button
        type="button"
        onClick={() =>
          dispatch({
            type: 'commitCustomProperty',
            draft: mode.draft,
            replaceCustomId: customId,
          })
        }
      >
        {customId
          ? EQUIPMENT_INSTANCE_EDITOR_SAVE_PROPERTY_LABEL
          : EQUIPMENT_INSTANCE_EDITOR_CREATE_PROPERTY_LABEL}
      </Button>
    </>
  )
}

export function EquipmentInstanceEditorFooter({
  mode,
  dispatch,
  onRequestClose,
  onDone,
}: EquipmentInstanceEditorFooterProps) {
  switch (mode.kind) {
    case 'scope':
      return <ScopeFooter dispatch={dispatch} onRequestClose={onRequestClose} />
    case 'main':
      return <MainFooter onRequestClose={onRequestClose} onDone={onDone} />
    case 'effectChoose':
      return <EffectChooseFooter mode={mode} dispatch={dispatch} />
    case 'effectForm':
      return <EffectFormFooter mode={mode} dispatch={dispatch} />
    case 'propertyBrowse':
      return <PropertyBrowseFooter dispatch={dispatch} />
    case 'propertyCreate':
      return <PropertyCreateFooter mode={mode} dispatch={dispatch} />
  }
}
