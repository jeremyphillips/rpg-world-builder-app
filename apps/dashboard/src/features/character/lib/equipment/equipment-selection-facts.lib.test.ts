import { describe, expect, it } from 'vitest'

import type { StartingPackageConversionItem } from '@rpg/contracts'

import { resolveSelectionRowStatusItems } from '../selection-row-status'
import {
  EMPTY_EQUIPMENT_SELECTION_FACTS,
  lookupResolvedEquipment,
  resolveEquipmentConversionItemPresentation,
  resolveHeldEquipmentSelectionPresentation,
} from './equipment-selection-facts.lib'
import {
  selectionFactsDraft,
  selectionFactsEquipment,
  selectionFactsForDraft,
  selectionFactsPurchase,
  selectionFactsScenario,
} from './equipment-selection-facts.fixtures'

const scenario = selectionFactsScenario()
const wizardGoldFacts = selectionFactsForDraft(
  scenario,
  selectionFactsDraft({
    optionId: 'starting-gold',
    purchases: [selectionFactsPurchase('plate-armor'), selectionFactsPurchase('dagger')],
  }),
)

function conversionItem(
  overrides: Partial<StartingPackageConversionItem> = {},
): StartingPackageConversionItem {
  return {
    packageItemKey: 'wizard:standard-equipment:0',
    itemIndex: 0,
    equipmentId: selectionFactsEquipment.spellbook.id,
    equipmentName: 'Spellbook',
    grantQuantity: 1,
    purchaseQuantity: 1,
    pricing: { status: 'priced', unitCostCp: 5000 },
    status: 'selectable',
    ...overrides,
  }
}

describe('lookupResolvedEquipment', () => {
  it('finds facts by content id and by slug id with a ruleset', () => {
    const plate = selectionFactsEquipment['plate-armor']

    expect(lookupResolvedEquipment(wizardGoldFacts, plate.id)).toBeDefined()
    expect(lookupResolvedEquipment(wizardGoldFacts, plate.slug)).toBe(
      lookupResolvedEquipment(wizardGoldFacts, plate.id),
    )
  })

  it('returns undefined for unknown ids and slug ids without a ruleset', () => {
    const plate = selectionFactsEquipment['plate-armor']

    expect(lookupResolvedEquipment(wizardGoldFacts, 'missing')).toBeUndefined()
    expect(
      lookupResolvedEquipment({ ...wizardGoldFacts, rulesetId: undefined }, plate.slug),
    ).toBeUndefined()
  })
})

describe('resolveHeldEquipmentSelectionPresentation', () => {
  it('reports compatibility for owned armor the character cannot use', () => {
    const presentation = resolveHeldEquipmentSelectionPresentation(
      wizardGoldFacts,
      selectionFactsEquipment['plate-armor'],
    )

    expect(resolveSelectionRowStatusItems(presentation, { context: 'owned' })).toEqual([
      expect.objectContaining({ kind: 'badge', label: 'Not proficient', tone: 'warning' }),
      expect.objectContaining({ kind: 'badge', label: 'Requires STR 15', tone: 'warning' }),
    ])
  })

  it('is empty without facts', () => {
    expect(
      resolveHeldEquipmentSelectionPresentation(
        EMPTY_EQUIPMENT_SELECTION_FACTS,
        selectionFactsEquipment['plate-armor'],
      ),
    ).toEqual({ status: [], guidance: [] })
  })
})

describe('resolveEquipmentConversionItemPresentation', () => {
  it('maps a blocking issue to a conversion_blocked availability blocker', () => {
    const presentation = resolveEquipmentConversionItemPresentation({
      item: conversionItem({
        status: 'blocked',
        blockingIssue: 'This item has no market price and cannot be purchased with starting gold.',
      }),
      equipment: selectionFactsEquipment.robe,
      facts: wizardGoldFacts,
    })

    expect(presentation.status).toEqual([
      expect.objectContaining({
        kind: 'blocker',
        reason: 'conversion_blocked',
        category: 'availability',
        label: 'This item has no market price and cannot be purchased with starting gold.',
      }),
    ])
  })

  it('keeps the blocker when the package item has no catalog equipment', () => {
    const presentation = resolveEquipmentConversionItemPresentation({
      item: conversionItem({
        equipmentId: 'unresolved',
        status: 'blocked',
        blockingIssue: 'This package item could not be resolved.',
      }),
      facts: wizardGoldFacts,
    })

    expect(presentation).toEqual({
      status: [expect.objectContaining({ reason: 'conversion_blocked' })],
      guidance: [],
    })
  })

  it('adds no blocker for a selectable item', () => {
    const presentation = resolveEquipmentConversionItemPresentation({
      item: conversionItem(),
      equipment: selectionFactsEquipment.spellbook,
      facts: wizardGoldFacts,
    })

    expect(presentation.status.some((entry) => entry.reason === 'conversion_blocked')).toBe(false)
  })
})
