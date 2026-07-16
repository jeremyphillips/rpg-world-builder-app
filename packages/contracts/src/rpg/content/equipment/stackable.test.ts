import { describe, expect, it } from 'vitest'

import { DEFAULT_SYSTEM_RULESET_ID } from '../../primitives/ruleset'
import type { Equipment } from '../equipment'

import { isEquipmentStackable } from './stackable'

const baseMeta = {
  rulesetId: DEFAULT_SYSTEM_RULESET_ID as typeof DEFAULT_SYSTEM_RULESET_ID,
  source: 'system' as const,
  campaignId: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  description: '',
  cost: { amount: 1, currency: 'gp' as const },
  weight: { value: 1, unit: 'lb' as const },
}

describe('isEquipmentStackable', () => {
  it('is permissive by default until stack rules are authored', () => {
    const longsword = {
      ...baseMeta,
      id: 'srd-cc-5.2.1:longsword',
      slug: 'longsword',
      name: 'Longsword',
      kind: 'weapon',
      category: 'martial',
      mode: 'melee',
      damage: { dice: { count: 1, faces: 8 } },
      damageType: 'slashing',
      properties: [],
      mastery: 'sap',
    } satisfies Equipment

    const rations = {
      ...baseMeta,
      id: 'srd-cc-5.2.1:rations',
      slug: 'rations',
      name: 'Rations',
      kind: 'adventuring_gear',
      gearKind: 'consumable',
    } satisfies Equipment

    expect(isEquipmentStackable(longsword)).toBe(true)
    expect(isEquipmentStackable(rations)).toBe(true)
  })
})
