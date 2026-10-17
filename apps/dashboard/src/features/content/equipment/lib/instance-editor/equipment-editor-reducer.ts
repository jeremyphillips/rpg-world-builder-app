import type { EquipmentInstance } from '@rpg/contracts'

import { applyEquipmentEditorAction, withSession } from './equipment-editor-reducer.handlers'
import type {
  EquipmentEditorScope,
  EquipmentEditorSession,
  EquipmentEditorState,
} from './equipment-editor-types'

export type { EquipmentEditorAction, EquipmentEditorState } from './equipment-editor-types'
export {
  DEFAULT_BROWSE_DRAFT,
  DEFAULT_CUSTOM_DRAFT,
  DEFAULT_EFFECT_DRAFT,
} from './equipment-editor-reducer.handlers'

export function createEquipmentEditorState(args: {
  sourceEntry: EquipmentInstance & { entryId: string }
  scope?: EquipmentEditorScope
}): EquipmentEditorState {
  const scope =
    args.scope ?? ((args.sourceEntry.quantity ?? 1) > 1 ? ('one' as const) : ('all' as const))
  const draft = structuredClone(args.sourceEntry)
  const session: EquipmentEditorSession = {
    sourceEntryId: args.sourceEntry.entryId,
    scope,
    draft,
    openedSnapshot: structuredClone(args.sourceEntry),
  }
  return {
    session,
    mode:
      (args.sourceEntry.quantity ?? 1) > 1 && !args.scope ? { kind: 'scope' } : { kind: 'main' },
  }
}

export function equipmentEditorReducer(
  state: EquipmentEditorState,
  action: import('./equipment-editor-types').EquipmentEditorAction,
): EquipmentEditorState {
  return applyEquipmentEditorAction(state, action)
}

export function isEquipmentEditorSessionDirty(state: EquipmentEditorState): boolean {
  return JSON.stringify(state.session.openedSnapshot) !== JSON.stringify(state.session.draft)
}

function cloneSession(session: EquipmentEditorSession): EquipmentEditorSession {
  return {
    ...session,
    draft: structuredClone(session.draft),
    openedSnapshot: structuredClone(session.openedSnapshot),
  }
}

export function restoreHiddenMagicProperties(state: EquipmentEditorState): EquipmentEditorState {
  if (state.session.draft.magical) return state
  const snapshotProps = state.session.openedSnapshot.magicProperties
  if (!snapshotProps?.length) return state
  return withSession(state, {
    ...state.session,
    draft: { ...state.session.draft, magicProperties: structuredClone(snapshotProps) },
  })
}

export function cloneEquipmentEditorState(state: EquipmentEditorState): EquipmentEditorState {
  return {
    session: cloneSession(state.session),
    mode: structuredClone(state.mode),
  }
}
