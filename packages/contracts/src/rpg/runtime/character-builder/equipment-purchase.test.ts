import { describe, expect, it, vi } from 'vitest'

import { equipmentSchema } from '../../content/equipment'
import {
  canMergeEquipmentPurchases,
  createDeterministicLegacyPurchaseId,
  createEquipmentPurchaseId,
  equipmentSupportsEquippedState,
  mergeCompatiblePurchasedEntries,
  normalizeCharacterBuilderDraft,
  normalizeEquipmentPurchase,
  occurrenceIndexAmongEquivalentLegacyPurchases,
  resolveEquipmentPurchaseIndex,
} from './equipment-purchase'
import { createEmptyCharacterBuilderDraft } from './draft'

const RULESET = 'srd-cc-5.2.1' as const

const rations = equipmentSchema.parse({
  id: `${RULESET}:rations`,
  slug: 'rations',
  rulesetId: RULESET,
  source: 'system',
  campaignId: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  name: 'Rations',
  description: '',
  kind: 'adventuring_gear',
  gearKind: 'consumable',
  cost: { amount: 5, currency: 'sp' },
  weight: { value: 2, unit: 'lb' },
})

const longsword = equipmentSchema.parse({
  id: `${RULESET}:longsword`,
  slug: 'longsword',
  rulesetId: RULESET,
  source: 'system',
  campaignId: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  name: 'Longsword',
  description: '',
  kind: 'weapon',
  category: 'martial',
  mode: 'melee',
  damage: { kind: 'dice', count: 1, faces: 8 },
  damageType: 'slashing',
  properties: [],
  mastery: 'sap',
  cost: { amount: 15, currency: 'gp' },
  weight: { value: 3, unit: 'lb' },
})

function legacyIdForRow(
  purchases: Parameters<typeof normalizeEquipmentPurchase>[0],
  index: number,
): string {
  const purchase = purchases[index]!
  return createDeterministicLegacyPurchaseId({
    equipmentId: purchase.equipmentId,
    sourceMode: purchase.sourceMode,
    equipped: purchase.equipped,
    modifiers: purchase.modifiers,
    occurrenceIndex: occurrenceIndexAmongEquivalentLegacyPurchases(purchases, index),
  })
}

describe('normalizeEquipmentPurchase', () => {
  it('assigns deterministic legacy ids and origin without changing normalized rows', () => {
    const purchases = [
      {
        equipmentId: `${RULESET}:rope`,
        quantity: 2,
        sourceMode: 'startingGold' as const,
      },
    ]

    const first = normalizeEquipmentPurchase(purchases, 0)
    const second = normalizeEquipmentPurchase([first], 0)

    expect(first).toEqual({
      ...purchases[0],
      id: legacyIdForRow(purchases, 0),
      origin: 'picker',
    })
    expect(second).toBe(first)
  })

  it('distinguishes duplicate legacy rows by occurrence index', () => {
    const purchases = [
      {
        equipmentId: `${RULESET}:rope`,
        quantity: 1,
        sourceMode: 'startingGold' as const,
      },
      {
        equipmentId: `${RULESET}:rope`,
        quantity: 2,
        sourceMode: 'startingGold' as const,
      },
    ]

    const first = normalizeEquipmentPurchase(purchases, 0)
    const second = normalizeEquipmentPurchase(purchases, 1)

    expect(first.id).not.toBe(second.id)
    expect(occurrenceIndexAmongEquivalentLegacyPurchases(purchases, 1)).toBe(1)
  })
})

describe('normalizeCharacterBuilderDraft', () => {
  it('is idempotent for already-normalized purchases', () => {
    const draft = {
      ...createEmptyCharacterBuilderDraft(),
      class: { classId: `${RULESET}:fighter`, level: 1 as const },
      equipment: {
        mode: 'gold' as const,
        purchases: [
          {
            id: 'purchase-1',
            equipmentId: `${RULESET}:rope`,
            quantity: 1,
            sourceMode: 'startingGold' as const,
            origin: 'picker' as const,
          },
        ],
        removedPackageItemKeys: [],
        customized: false,
      },
    }

    const once = normalizeCharacterBuilderDraft(draft)
    const twice = normalizeCharacterBuilderDraft(once)

    expect(once).toBe(draft)
    expect(twice).toBe(once)
  })
})

describe('canMergeEquipmentPurchases', () => {
  it('merges same-origin stackable purchases and preserves existing id', () => {
    const purchases = [
      {
        id: 'purchase-a',
        equipmentId: rations.id,
        quantity: 2,
        sourceMode: 'startingGold' as const,
        origin: 'picker' as const,
      },
    ]

    const merged = mergeCompatiblePurchasedEntries({
      purchases,
      incoming: {
        equipmentId: rations.id,
        quantity: 3,
        sourceMode: 'startingGold',
        origin: 'picker',
      },
      equipment: rations,
      createId: () => 'purchase-b',
    })

    expect(merged).toEqual([
      {
        id: 'purchase-a',
        equipmentId: rations.id,
        quantity: 5,
        sourceMode: 'startingGold',
        origin: 'picker',
      },
    ])
  })

  it('does not merge across different origins', () => {
    const purchases = [
      {
        id: 'purchase-a',
        equipmentId: rations.id,
        quantity: 2,
        sourceMode: 'startingGold' as const,
        origin: 'picker' as const,
      },
    ]

    const merged = mergeCompatiblePurchasedEntries({
      purchases,
      incoming: {
        equipmentId: rations.id,
        quantity: 3,
        sourceMode: 'startingGold',
        origin: 'packageConversion',
      },
      equipment: rations,
      createId: () => 'purchase-b',
    })

    expect(merged).toHaveLength(2)
    expect(merged[1]).toEqual({
      id: 'purchase-b',
      equipmentId: rations.id,
      quantity: 3,
      sourceMode: 'startingGold',
      origin: 'packageConversion',
    })
  })

  it('does not merge non-stackable equipment', () => {
    expect(
      canMergeEquipmentPurchases({
        existing: {
          id: 'purchase-a',
          equipmentId: longsword.id,
          quantity: 1,
          sourceMode: 'startingGold',
          origin: 'picker',
        },
        incoming: {
          equipmentId: longsword.id,
          sourceMode: 'startingGold',
          origin: 'picker',
        },
        equipment: longsword,
      }),
    ).toBe(false)
  })

  it('ignores equipped differences for kinds without equipped semantics', () => {
    expect(equipmentSupportsEquippedState(rations)).toBe(false)
    expect(
      canMergeEquipmentPurchases({
        existing: {
          id: 'purchase-a',
          equipmentId: rations.id,
          quantity: 1,
          sourceMode: 'startingGold',
          origin: 'picker',
          equipped: undefined,
        },
        incoming: {
          equipmentId: rations.id,
          sourceMode: 'startingGold',
          origin: 'picker',
          equipped: false,
        },
        equipment: rations,
      }),
    ).toBe(true)
  })
})

describe('resolveEquipmentPurchaseIndex', () => {
  it('resolves legacy rows by deterministic id fallback', () => {
    const purchases = [
      {
        equipmentId: `${RULESET}:rope`,
        quantity: 1,
        sourceMode: 'manual' as const,
      },
    ]

    const legacyId = legacyIdForRow(purchases, 0)

    expect(resolveEquipmentPurchaseIndex(purchases, legacyId)).toBe(0)
  })

  it('assigns new purchase ids from the factory', () => {
    vi.spyOn(globalThis.crypto, 'randomUUID').mockReturnValue(
      '849e4292-892f-4c3f-a2cf-b5ef8e9aa707',
    )

    const merged = mergeCompatiblePurchasedEntries({
      purchases: [],
      incoming: {
        equipmentId: rations.id,
        quantity: 1,
        sourceMode: 'startingGold',
        origin: 'picker',
      },
      equipment: rations,
      createId: createEquipmentPurchaseId,
    })

    expect(merged[0]?.id).toBe('849e4292-892f-4c3f-a2cf-b5ef8e9aa707')
  })
})
