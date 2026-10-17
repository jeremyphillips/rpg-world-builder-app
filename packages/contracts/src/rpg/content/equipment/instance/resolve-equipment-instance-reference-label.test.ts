import { describe, expect, it } from 'vitest'

import { equipmentSchema } from '../../equipment'
import { resolveEquipmentInstanceReferenceLabel } from './resolve-equipment-instance-reference-label'

const dagger = equipmentSchema.parse({
  id: 'srd-cc-5.2.1:dagger',
  slug: 'dagger',
  rulesetId: 'srd-cc-5.2.1',
  source: 'system',
  campaignId: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  name: 'Dagger',
  description: '',
  cost: { amount: 2, currency: 'gp' },
  weight: { value: 1, unit: 'lb' },
  kind: 'weapon',
  category: 'simple',
  mode: 'melee',
  properties: ['finesse', 'light', 'thrown'],
  mastery: 'nick',
  damage: { dice: { count: 1, faces: 4 } },
  damageType: 'piercing',
})

const provider = () => undefined

describe('resolveEquipmentInstanceReferenceLabel', () => {
  it('uses short entry ids when they are already unique', () => {
    const siblings = [
      { entryId: 'dagger-1', equipmentId: dagger.id, quantity: 1 },
      { entryId: 'dagger-2', equipmentId: dagger.id, quantity: 1 },
    ]
    const labels = siblings.map((entry) =>
      resolveEquipmentInstanceReferenceLabel(entry, dagger, provider, siblings),
    )
    expect(new Set(labels).size).toBe(2)
    expect(labels).toEqual(['Dagger · dagger-1', 'Dagger · dagger-2'])
  })

  it('adds uuid tokens when duplicate labels collide', () => {
    const siblings = [
      {
        entryId: '11111111-1111-1111-1111-111111111111',
        equipmentId: dagger.id,
        quantity: 1,
      },
      {
        entryId: '22222222-2222-2222-2222-222222222222',
        equipmentId: dagger.id,
        quantity: 1,
      },
    ]
    const labels = siblings.map((entry) =>
      resolveEquipmentInstanceReferenceLabel(entry, dagger, provider, siblings),
    )
    expect(new Set(labels).size).toBe(2)
    expect(labels[0]).toContain('1111')
    expect(labels[1]).toContain('2222')
    expect(labels[0]!.length).toBeLessThan(40)
  })

  it('is stable when sibling order changes', () => {
    const a = { entryId: 'dagger-a', equipmentId: dagger.id, quantity: 1, equipped: true }
    const b = { entryId: 'dagger-b', equipmentId: dagger.id, quantity: 1, equipped: false }
    const first = resolveEquipmentInstanceReferenceLabel(a, dagger, provider, [a, b])
    const second = resolveEquipmentInstanceReferenceLabel(a, dagger, provider, [b, a])
    expect(first).toBe(second)
  })
})
