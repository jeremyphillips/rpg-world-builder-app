import { monsterActionDraftSchema } from '@rpg/contracts'
import { describe, expect, it } from 'vitest'

import { resolveMonsterCreateDefaultValues } from '../monster-form-values'
import { normalizeMonsterFormValues } from '../normalize-monster-form-values'
import { createMonsterActionFromAcquisition } from './monster-action-acquisition'
import type { MonsterActionDraftRow } from './monster-action-presets'

function storedAction(action: MonsterActionDraftRow) {
  const values = resolveMonsterCreateDefaultValues()
  values.actions = [action]
  const normalized = normalizeMonsterFormValues(values, { intent: 'draft', mode: 'create' })
  const actions = normalized.actions as unknown[]
  return monsterActionDraftSchema.parse(actions[0])
}

describe('monster save action round trip', () => {
  it('keeps the breath resolution when only the name changes', () => {
    const created = createMonsterActionFromAcquisition({
      type: 'preset',
      presetId: 'breath-weapon',
    })
    const renamed = { ...created, name: 'Frost Breath' }
    const loaded = storedAction(created)
    const edited = storedAction(renamed)
    expect(edited.kind).toBe('save')
    if (edited.kind !== 'save' || loaded.kind !== 'save') return
    expect(edited.name).toBe('Frost Breath')
    expect(edited.resolution).toEqual(loaded.resolution)
  })

  it('changes only the damage type that was edited', () => {
    const created = createMonsterActionFromAcquisition({
      type: 'preset',
      presetId: 'breath-weapon',
    })
    const resolution = created.resolution
    if (!resolution) throw new Error('Breath preset is missing a resolution')
    const effects = resolution.effects.map((effect, index) =>
      index === 0 && effect.kind === 'damage' ? { ...effect, damageType: 'cold' } : effect,
    )
    const edited = storedAction({ ...created, resolution: { ...resolution, effects } })
    const original = storedAction(created)
    if (edited.kind !== 'save' || original.kind !== 'save') return
    expect(edited.resolution?.effects[0]).toMatchObject({ damageType: 'cold' })
    expect(edited.resolution?.effects.slice(1)).toEqual(original.resolution?.effects.slice(1))
    expect(edited.resolution?.outcomes).toEqual(original.resolution?.outcomes)
  })
})
