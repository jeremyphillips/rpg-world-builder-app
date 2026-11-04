import { describe, expect, it } from 'vitest'

import { actionPresetDefaultName, getActionPreset } from '../../content/action/action-presets'
import type { Equipment } from '../../content/equipment'
import { monsterActionAuthoring } from '../../content/monster/monster-action-authoring'
import {
  MONSTER_ACTION_UNRESOLVED_REFERENCE,
  resolveMonsterActionIdentity,
} from './resolve-monster-action-identity'

const longsword = { id: 'longsword', kind: 'weapon', name: 'Longsword' } as Equipment

describe('actionPresetDefaultName', () => {
  it('uses the vocabulary label unless the preset defines a printed default', () => {
    expect(actionPresetDefaultName(getActionPreset('bite')!)).toBe('Bite')
    expect(actionPresetDefaultName(getActionPreset('multiattack')!)).toBe('Multiattack')
    expect(actionPresetDefaultName(getActionPreset('constrict')!)).toBe('Constrict')
    expect(actionPresetDefaultName(getActionPreset('breath-weapon')!)).toBe('Fire Breath')
  })
})

describe('resolveMonsterActionIdentity', () => {
  it('derives preset names without a stored name and keeps an explicit custom name', () => {
    const bite = resolveMonsterActionIdentity({
      action: { kind: 'natural-weapon', preset: 'bite' },
      equipmentCatalogStatus: 'ready',
    })
    expect(bite).toMatchObject({
      authority: 'derived',
      sourceState: 'resolved',
      defaultName: 'Bite',
      displayName: 'Bite',
    })
    expect(bite.customName).toBeUndefined()

    const custom = resolveMonsterActionIdentity({
      action: { kind: 'natural-weapon', preset: 'bite', name: 'Bite' },
      equipmentCatalogStatus: 'ready',
    })
    expect(custom.customName).toBe('Bite')
    expect(custom.displayName).toBe('Bite')
  })

  it('does not treat a missing preset or weapon as a numbered title', () => {
    const preset = resolveMonsterActionIdentity({
      action: { kind: 'save', preset: 'missing-preset', name: 'Fire Breath' },
      equipmentCatalogStatus: 'ready',
    })
    expect(preset.sourceState).toBe('missing')
    expect(preset.displayName).toBe('Fire Breath')
    expect(monsterActionAuthoring({ kind: 'save', preset: 'missing-preset' }).name).toBe('derived')

    const weapon = resolveMonsterActionIdentity({
      action: { kind: 'weapon', equipmentEntryId: 'gone' },
      equipment: [],
      equipmentCatalogStatus: 'ready',
    })
    expect(weapon.displayName).toBe(MONSTER_ACTION_UNRESOLVED_REFERENCE)

    const pending = resolveMonsterActionIdentity({
      action: { kind: 'weapon', equipmentEntryId: 'sword' },
      equipment: [{ entryId: 'sword', equipmentId: 'longsword', quantity: 1 }],
      equipmentCatalogStatus: 'pending',
    })
    expect(pending.sourceState).toBe('pending')
    expect(pending.displayName).toBe('')
  })

  it('uses the equipment instance display name and lets a custom action name win', () => {
    const derived = resolveMonsterActionIdentity({
      action: { kind: 'weapon', equipmentEntryId: 'sword' },
      equipment: [
        { entryId: 'sword', equipmentId: 'longsword', quantity: 1, customName: 'Rusty Shiv' },
      ],
      equipmentCatalog: new Map([['longsword', longsword]]),
      equipmentCatalogStatus: 'ready',
    })
    expect(derived.defaultName).toBe('Rusty Shiv')
    expect(derived.displayName).toBe('Rusty Shiv')

    const custom = resolveMonsterActionIdentity({
      action: { kind: 'weapon', equipmentEntryId: 'sword', name: 'Rusty Shiv' },
      equipment: [{ entryId: 'sword', equipmentId: 'longsword', quantity: 1 }],
      equipmentCatalog: new Map([['longsword', longsword]]),
      equipmentCatalogStatus: 'ready',
    })
    expect(custom.customName).toBe('Rusty Shiv')
    expect(custom.defaultName).toBe('Longsword')
  })

  it('requires an authored name only when the action has no deriving source', () => {
    expect(monsterActionAuthoring({ kind: 'attack' }).name).toBe('authored')
    expect(monsterActionAuthoring({ kind: 'natural-weapon' }).name).toBe('authored')
    expect(monsterActionAuthoring({ kind: 'natural-weapon', preset: 'bite' }).name).toBe('derived')
    expect(
      resolveMonsterActionIdentity({
        action: { kind: 'attack', name: 'Arcane Burst' },
      }).displayName,
    ).toBe('Arcane Burst')
    expect(resolveMonsterActionIdentity({ action: { kind: 'special' } }).customName).toBeUndefined()
  })
})
