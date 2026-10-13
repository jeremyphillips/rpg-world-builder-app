import { describe, expect, it } from 'vitest'

import { commitEquipmentEditorSession } from './commit-equipment-editor-session'
import {
  cloneEquipmentEditorState,
  createEquipmentEditorState,
  equipmentEditorReducer,
  isEquipmentEditorSessionDirty,
  restoreHiddenMagicProperties,
} from './equipment-editor-reducer'
import { DEFAULT_BROWSE_DRAFT } from './equipment-editor-reducer.handlers'

const baseEntry = {
  entryId: 'e1',
  equipmentId: 'srd-cc-5.2.1:dagger',
  quantity: 2,
  equipped: true,
}

describe('equipment editor session', () => {
  it('opens scope mode when quantity is above one', () => {
    const state = createEquipmentEditorState({ sourceEntry: baseEntry })
    expect(state.mode).toEqual({ kind: 'scope' })
  })

  it('cancelSubMode returns to main without changing the session draft', () => {
    const initial = createEquipmentEditorState({ sourceEntry: { ...baseEntry, quantity: 1 } })
    const edited = equipmentEditorReducer(initial, {
      type: 'patchDraft',
      patch: { customName: 'Renamed' },
    })
    const inSubMode = equipmentEditorReducer(edited, { type: 'openEffectChoose' })
    const cancelled = equipmentEditorReducer(inSubMode, { type: 'cancelSubMode' })
    expect(cancelled.mode).toEqual({ kind: 'main' })
    expect(cancelled.session.draft.customName).toBe('Renamed')
  })

  it('restores magic properties when magical is toggled back on', () => {
    const initial = createEquipmentEditorState({
      sourceEntry: {
        ...baseEntry,
        quantity: 1,
        magical: true,
        magicProperties: [
          { kind: 'custom', customId: 'c1', name: 'Glow', description: 'Shines in moonlight' },
        ],
      },
    })
    const off = equipmentEditorReducer(initial, { type: 'setMagical', magical: false })
    expect(off.session.draft.magicProperties).toBeUndefined()
    const restored = restoreHiddenMagicProperties(off)
    expect(restored.session.draft.magicProperties).toHaveLength(1)
  })

  it('drops magic properties on done when magical is false', () => {
    const session = createEquipmentEditorState({
      sourceEntry: {
        ...baseEntry,
        quantity: 1,
        magical: true,
        magicProperties: [
          { kind: 'custom', customId: 'c1', name: 'Glow', description: 'Shines in moonlight' },
        ],
      },
    }).session
    const off = equipmentEditorReducer(
      { session, mode: { kind: 'main' } },
      { type: 'setMagical', magical: false },
    )
    const committed = commitEquipmentEditorSession([baseEntry], off.session)
    expect(committed[0]?.magicProperties).toBeUndefined()
  })

  it('commits one-scope edits as a split stack', () => {
    const session = createEquipmentEditorState({ sourceEntry: baseEntry }).session
    const withDraft = {
      ...session,
      scope: 'one' as const,
      draft: { ...session.draft, magical: true, quantity: 1 },
    }
    const committed = commitEquipmentEditorSession([baseEntry], withDraft, () => 'split-id')
    expect(committed).toHaveLength(2)
    expect(committed[0]?.quantity).toBe(1)
    expect(committed[1]).toMatchObject({ entryId: 'split-id', quantity: 1, magical: true })
  })

  it('does not split in one scope when the draft matches the source', () => {
    const session = createEquipmentEditorState({ sourceEntry: baseEntry }).session
    const committed = commitEquipmentEditorSession([baseEntry], {
      ...session,
      scope: 'one',
      draft: { ...baseEntry },
    })
    expect(committed).toHaveLength(1)
  })

  it('tracks dirty state against the opened snapshot', () => {
    const state = createEquipmentEditorState({ sourceEntry: { ...baseEntry, quantity: 1 } })
    expect(isEquipmentEditorSessionDirty(state)).toBe(false)
    const edited = equipmentEditorReducer(state, { type: 'patchDraft', patch: { equipped: false } })
    expect(isEquipmentEditorSessionDirty(edited)).toBe(true)
    expect(isEquipmentEditorSessionDirty(cloneEquipmentEditorState(edited))).toBe(true)
  })

  it('returns from effect form back to effect choose', () => {
    const state = createEquipmentEditorState({
      sourceEntry: { ...baseEntry, quantity: 1 },
    })
    const inForm = equipmentEditorReducer(state, {
      type: 'openEffectForm',
      draft: { effectId: 'new', target: 'attack_roll', bonus: 1 },
      origin: 'new',
    })
    const back = equipmentEditorReducer(inForm, { type: 'back' })
    expect(back.mode.kind).toBe('effectChoose')
  })

  it('returns from property create back to property browse when opened from browse', () => {
    const state = createEquipmentEditorState({
      sourceEntry: { ...baseEntry, quantity: 1, magical: true },
    })
    const browse = equipmentEditorReducer(state, {
      type: 'openPropertyBrowse',
      draft: DEFAULT_BROWSE_DRAFT,
    })
    const inCreate = equipmentEditorReducer(browse, {
      type: 'openPropertyCreate',
      draft: { name: 'Glow', description: 'Shines' },
      origin: 'browse',
    })
    const back = equipmentEditorReducer(inCreate, { type: 'back' })
    expect(back.mode).toEqual({ kind: 'propertyBrowse', draft: expect.any(Object) })
  })

  it('replaces an enhancement preset from browse', () => {
    const state = createEquipmentEditorState({
      sourceEntry: {
        ...baseEntry,
        quantity: 1,
        magical: true,
        magicProperties: [{ kind: 'preset', propertyId: 'old' }],
      },
    })
    const next = equipmentEditorReducer(state, {
      type: 'commitPresetProperty',
      propertyId: 'new',
      replacePropertyId: 'old',
    })
    expect(next.session.draft.magicProperties).toEqual([{ kind: 'preset', propertyId: 'new' }])
    expect(next.mode).toEqual({ kind: 'main' })
  })
})
