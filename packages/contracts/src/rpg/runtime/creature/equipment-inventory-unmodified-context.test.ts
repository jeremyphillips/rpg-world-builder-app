import { describe, expect, it } from 'vitest'

import {
  buildEquipmentInventoryUnmodifiedContext,
  shouldShowUnmodifiedEquipmentQualifier,
} from './equipment-inventory-unmodified-context'

describe('buildEquipmentInventoryUnmodifiedContext', () => {
  it('returns empty when only a plain stack exists', () => {
    const context = buildEquipmentInventoryUnmodifiedContext([
      { equipmentId: 'weapon:dagger', quantity: 2 },
    ])
    expect(context.size).toBe(0)
    expect(
      shouldShowUnmodifiedEquipmentQualifier(
        { equipmentId: 'weapon:dagger', quantity: 2 },
        context,
      ),
    ).toBe(false)
  })

  it('qualifies plain entries when a magical sibling shares the equipment id', () => {
    const entries = [
      { entryId: 'plain', equipmentId: 'weapon:longsword', quantity: 1 },
      { entryId: 'plus', equipmentId: 'weapon:longsword', quantity: 1, magical: true },
    ]
    const context = buildEquipmentInventoryUnmodifiedContext(entries)
    expect(context.has('weapon:longsword')).toBe(true)
    expect(shouldShowUnmodifiedEquipmentQualifier(entries[0]!, context)).toBe(true)
    expect(shouldShowUnmodifiedEquipmentQualifier(entries[1]!, context)).toBe(false)
  })

  it('qualifies plain entries when a mechanical adjustment sibling exists', () => {
    const entries = [
      { entryId: 'plain', equipmentId: 'weapon:battleaxe', quantity: 1 },
      {
        entryId: 'adj',
        equipmentId: 'weapon:battleaxe',
        quantity: 1,
        adjustments: [{ effectId: 'enhancement', target: 'attack_roll' as const, bonus: 1 }],
      },
    ]
    const context = buildEquipmentInventoryUnmodifiedContext(entries)
    expect(shouldShowUnmodifiedEquipmentQualifier(entries[0]!, context)).toBe(true)
  })

  it('treats cosmetic custom names as configured siblings', () => {
    const entries = [
      { entryId: 'plain', equipmentId: 'weapon:dagger', quantity: 1 },
      { entryId: 'named', equipmentId: 'weapon:dagger', quantity: 1, customName: 'Shard' },
    ]
    const context = buildEquipmentInventoryUnmodifiedContext(entries)
    expect(shouldShowUnmodifiedEquipmentQualifier(entries[0]!, context)).toBe(true)
    expect(shouldShowUnmodifiedEquipmentQualifier(entries[1]!, context)).toBe(false)
  })

  it('supports multiple configured variants with one plain stack', () => {
    const plain = { entryId: 'plain', equipmentId: 'weapon:dagger', quantity: 1 }
    const magical = { entryId: 'm', equipmentId: 'weapon:dagger', quantity: 1, magical: true }
    const named = { entryId: 'n', equipmentId: 'weapon:dagger', quantity: 1, customName: 'X' }
    const context = buildEquipmentInventoryUnmodifiedContext([plain, magical, named])
    expect(shouldShowUnmodifiedEquipmentQualifier(plain, context)).toBe(true)
  })

  it('does not qualify when only configured copies exist', () => {
    const context = buildEquipmentInventoryUnmodifiedContext([
      { entryId: 'm', equipmentId: 'weapon:dagger', quantity: 1, magical: true },
    ])
    expect(context.size).toBe(0)
  })

  it('ignores similar display names on different equipment ids', () => {
    const context = buildEquipmentInventoryUnmodifiedContext([
      { entryId: 'a', equipmentId: 'weapon:dagger', quantity: 1 },
      { entryId: 'b', equipmentId: 'weapon:shortsword', quantity: 1, magical: true },
    ])
    expect(context.size).toBe(0)
  })

  it('clears qualification when the last configured sibling is removed', () => {
    const plain = { entryId: 'plain', equipmentId: 'weapon:dagger', quantity: 1 }
    const configured = { entryId: 'c', equipmentId: 'weapon:dagger', quantity: 1, magical: true }
    expect(
      shouldShowUnmodifiedEquipmentQualifier(
        plain,
        buildEquipmentInventoryUnmodifiedContext([plain, configured]),
      ),
    ).toBe(true)
    expect(
      shouldShowUnmodifiedEquipmentQualifier(
        plain,
        buildEquipmentInventoryUnmodifiedContext([plain]),
      ),
    ).toBe(false)
  })

  it('ignores zero-quantity entries for sibling detection', () => {
    const context = buildEquipmentInventoryUnmodifiedContext([
      { entryId: 'plain', equipmentId: 'weapon:dagger', quantity: 1 },
      { entryId: 'ghost', equipmentId: 'weapon:dagger', quantity: 0, magical: true },
    ])
    expect(context.size).toBe(0)
  })

  it('does not change classification when plain quantity increases', () => {
    const plain = { entryId: 'plain', equipmentId: 'weapon:dagger', quantity: 1 }
    const configured = { entryId: 'c', equipmentId: 'weapon:dagger', quantity: 1, magical: true }
    const contextOne = buildEquipmentInventoryUnmodifiedContext([
      { ...plain, quantity: 1 },
      configured,
    ])
    const contextThree = buildEquipmentInventoryUnmodifiedContext([
      { ...plain, quantity: 3 },
      configured,
    ])
    expect(shouldShowUnmodifiedEquipmentQualifier({ ...plain, quantity: 3 }, contextThree)).toBe(
      shouldShowUnmodifiedEquipmentQualifier(plain, contextOne),
    )
  })
})
