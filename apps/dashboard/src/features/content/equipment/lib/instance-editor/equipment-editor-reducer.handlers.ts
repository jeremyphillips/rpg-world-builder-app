import type { EquipmentInstance, EquipmentMagicPropertyEntry } from '@rpg/contracts'

import type {
  CustomPropertyDraft,
  EffectDraft,
  EquipmentEditorAction,
  EquipmentEditorSession,
  EquipmentEditorState,
  PropertyBrowseDraft,
} from './equipment-editor-types'

export const DEFAULT_EFFECT_DRAFT: EffectDraft = { bonus: 1 }
export const DEFAULT_BROWSE_DRAFT: PropertyBrowseDraft = { query: '', category: 'all' }
export const DEFAULT_CUSTOM_DRAFT: CustomPropertyDraft = { name: '', description: '' }

export function withSession(
  state: EquipmentEditorState,
  session: EquipmentEditorSession,
): EquipmentEditorState {
  return { ...state, session }
}

function stripMagicPropertiesWhenOff(draft: EquipmentInstance): EquipmentInstance {
  if (draft.magical) return draft
  return { ...draft, magicProperties: undefined }
}

function upsertAdjustment(
  draft: EquipmentInstance,
  effectDraft: EffectDraft,
  replace: boolean,
): EquipmentInstance {
  const effectId = effectDraft.effectId ?? crypto.randomUUID()
  const nextEffect = {
    effectId,
    target: effectDraft.target!,
    bonus: effectDraft.bonus,
    ...(effectDraft.notes ? { notes: effectDraft.notes } : {}),
  }
  const rest = (draft.adjustments ?? []).filter(
    (row) => row.target !== nextEffect.target && (replace ? row.effectId !== effectId : true),
  )
  return { ...draft, adjustments: [...rest, nextEffect] }
}

function upsertMagicProperty(
  draft: EquipmentInstance,
  entry: EquipmentMagicPropertyEntry,
  replacePropertyId?: string,
): EquipmentInstance {
  const rows = (draft.magicProperties ?? []).filter((row) => {
    if (replacePropertyId && row.kind === 'preset') return row.propertyId !== replacePropertyId
    if (replacePropertyId && row.kind === 'custom') return row.customId !== replacePropertyId
    if (entry.kind === 'preset' && row.kind === 'preset') return row.propertyId !== entry.propertyId
    if (entry.kind === 'custom' && row.kind === 'custom') return row.customId !== entry.customId
    return true
  })
  return {
    ...draft,
    magical: true,
    magicProperties: [...rows, entry],
  }
}

const DRAFT_ACTION_TYPES = new Set([
  'setScope',
  'continueFromScope',
  'patchDraft',
  'setMagical',
  'cancelSubMode',
])

const EFFECT_ACTION_TYPES = new Set([
  'openEffectChoose',
  'openEffectForm',
  'commitEffectDraft',
  'removeEffect',
])

const PROPERTY_ACTION_TYPES = new Set([
  'openPropertyBrowse',
  'openPropertyCreate',
  'commitPresetProperty',
  'commitCustomProperty',
  'removeMagicProperty',
])

function applyDraftAction(
  state: EquipmentEditorState,
  action: EquipmentEditorAction,
): EquipmentEditorState {
  switch (action.type) {
    case 'setScope':
      return withSession(state, { ...state.session, scope: action.scope })
    case 'continueFromScope':
      return state.mode.kind === 'scope' ? { ...state, mode: { kind: 'main' } } : state
    case 'patchDraft':
      return withSession(state, {
        ...state.session,
        draft: { ...state.session.draft, ...action.patch },
      })
    case 'setMagical':
      return withSession(state, {
        ...state.session,
        draft: stripMagicPropertiesWhenOff({ ...state.session.draft, magical: action.magical }),
      })
    case 'cancelSubMode':
      return { ...state, mode: { kind: 'main' } }
    default:
      return state
  }
}

function applyEffectAction(
  state: EquipmentEditorState,
  action: EquipmentEditorAction,
): EquipmentEditorState {
  switch (action.type) {
    case 'openEffectChoose':
      return {
        ...state,
        mode: {
          kind: 'effectChoose',
          draft: action.draft ?? DEFAULT_EFFECT_DRAFT,
          returnTo: action.returnTo ?? 'main',
        },
      }
    case 'openEffectForm':
      return { ...state, mode: { kind: 'effectForm', draft: action.draft, origin: action.origin } }
    case 'commitEffectDraft': {
      const draft = upsertAdjustment(state.session.draft, action.draft, action.replace ?? false)
      return withSession({ ...state, mode: { kind: 'main' } }, { ...state.session, draft })
    }
    case 'removeEffect': {
      const draft = {
        ...state.session.draft,
        adjustments: (state.session.draft.adjustments ?? []).filter(
          (row) => row.effectId !== action.effectId,
        ),
      }
      return withSession({ ...state, mode: { kind: 'main' } }, { ...state.session, draft })
    }
    default:
      return state
  }
}

function applyPropertyAction(
  state: EquipmentEditorState,
  action: EquipmentEditorAction,
): EquipmentEditorState {
  switch (action.type) {
    case 'openPropertyBrowse':
      return {
        ...state,
        mode: {
          kind: 'propertyBrowse',
          draft: action.draft ?? DEFAULT_BROWSE_DRAFT,
        },
      }
    case 'openPropertyCreate':
      return {
        ...state,
        mode: {
          kind: 'propertyCreate',
          draft: action.draft ?? DEFAULT_CUSTOM_DRAFT,
          origin: action.origin,
        },
      }
    case 'commitPresetProperty': {
      const draft = upsertMagicProperty(
        state.session.draft,
        { kind: 'preset', propertyId: action.propertyId },
        action.replacePropertyId,
      )
      return withSession({ ...state, mode: { kind: 'main' } }, { ...state.session, draft })
    }
    case 'commitCustomProperty': {
      const customId = action.draft.customId ?? crypto.randomUUID()
      const draft = upsertMagicProperty(
        state.session.draft,
        {
          kind: 'custom',
          customId,
          name: action.draft.name,
          description: action.draft.description,
        },
        action.replaceCustomId,
      )
      return withSession({ ...state, mode: { kind: 'main' } }, { ...state.session, draft })
    }
    case 'removeMagicProperty': {
      const draft = {
        ...state.session.draft,
        magicProperties: (state.session.draft.magicProperties ?? []).filter((row) =>
          action.kind === 'preset'
            ? row.kind !== 'preset' || row.propertyId !== action.id
            : row.kind !== 'custom' || row.customId !== action.id,
        ),
      }
      return withSession(state, { ...state.session, draft })
    }
    default:
      return state
  }
}

function applyEquipmentEditorBack(state: EquipmentEditorState): EquipmentEditorState {
  const { mode } = state
  if (mode.kind === 'effectChoose' && mode.returnTo === 'effectForm') {
    return { ...state, mode: { kind: 'effectForm', draft: mode.draft, origin: 'existing' } }
  }
  if (mode.kind === 'effectForm') {
    return {
      ...state,
      mode: { kind: 'effectChoose', draft: mode.draft, returnTo: 'main' },
    }
  }
  if (mode.kind === 'propertyCreate' && mode.origin === 'browse') {
    return { ...state, mode: { kind: 'propertyBrowse', draft: DEFAULT_BROWSE_DRAFT } }
  }
  return { ...state, mode: { kind: 'main' } }
}

export function applyEquipmentEditorAction(
  state: EquipmentEditorState,
  action: EquipmentEditorAction,
): EquipmentEditorState {
  if (action.type === 'back') return applyEquipmentEditorBack(state)
  if (DRAFT_ACTION_TYPES.has(action.type)) return applyDraftAction(state, action)
  if (EFFECT_ACTION_TYPES.has(action.type)) return applyEffectAction(state, action)
  if (PROPERTY_ACTION_TYPES.has(action.type)) return applyPropertyAction(state, action)
  return state
}
