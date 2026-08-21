import { describe, expect, it, vi } from 'vitest'

import { mapRelationshipPickerCreateIntentsToAuxiliaryAction } from './map-relationship-picker-create-intents-to-auxiliary-action.lib'
import { resolveRelationshipPickerCreateIntents } from './relationship-picker-create-intents.lib'

describe('mapRelationshipPickerCreateIntentsToAuxiliaryAction', () => {
  it('returns undefined when no intents resolve', () => {
    expect(
      mapRelationshipPickerCreateIntentsToAuxiliaryAction([], {
        onOrganization: vi.fn(),
        onLocation: vi.fn(),
        onCharacter: vi.fn(),
      }),
    ).toBeUndefined()
  })

  it('maps one intent to a direct action', () => {
    const onOrganization = vi.fn()
    const action = mapRelationshipPickerCreateIntentsToAuxiliaryAction(
      resolveRelationshipPickerCreateIntents({ target: 'organization' }),
      { onOrganization, onLocation: vi.fn(), onCharacter: vi.fn() },
    )

    expect(action).toEqual(
      expect.objectContaining({
        state: 'action',
        label: 'Create organization',
      }),
    )

    if (action?.state === 'action') {
      action.onAction()
    }
    expect(onOrganization).toHaveBeenCalledOnce()
  })

  it('maps one character intent to a direct action', () => {
    const onCharacter = vi.fn()
    const action = mapRelationshipPickerCreateIntentsToAuxiliaryAction(
      resolveRelationshipPickerCreateIntents({
        target: 'character',
        createableCharacterTypes: ['npc'],
      }),
      { onOrganization: vi.fn(), onLocation: vi.fn(), onCharacter },
    )

    expect(action).toEqual(
      expect.objectContaining({
        state: 'action',
        label: 'Create NPC',
      }),
    )

    if (action?.state === 'action') {
      action.onAction()
    }
    expect(onCharacter).toHaveBeenCalledOnce()
  })

  it('maps many location intents to a menu in registry order labels', () => {
    const onLocation = vi.fn()
    const action = mapRelationshipPickerCreateIntentsToAuxiliaryAction(
      resolveRelationshipPickerCreateIntents({
        target: 'location',
        selectedKind: 'headquarters',
      }),
      { onOrganization: vi.fn(), onLocation, onCharacter: vi.fn() },
    )

    expect(action).toEqual(
      expect.objectContaining({
        state: 'menu',
        label: 'Create new',
        items: [
          { label: 'Building', onAction: expect.any(Function) },
          { label: 'Fortification', onAction: expect.any(Function) },
          { label: 'Unclassified structure', onAction: expect.any(Function) },
        ],
      }),
    )

    if (action?.state === 'menu') {
      action.items[1]?.onAction()
    }
    expect(onLocation).toHaveBeenCalledWith('fortification')
  })

  it('forwards disabled to action and menu variants', () => {
    const action = mapRelationshipPickerCreateIntentsToAuxiliaryAction(
      resolveRelationshipPickerCreateIntents({ target: 'organization' }),
      { onOrganization: vi.fn(), onLocation: vi.fn(), onCharacter: vi.fn(), disabled: true },
    )

    expect(action).toEqual(expect.objectContaining({ disabled: true }))
  })
})
