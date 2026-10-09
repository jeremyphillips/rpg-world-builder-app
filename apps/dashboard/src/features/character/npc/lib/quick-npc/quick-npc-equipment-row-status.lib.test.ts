import { describe, expect, it } from 'vitest'

import type { CharacterBuildAdvisory } from '@rpg/contracts'

import {
  selectionFactsDraft,
  selectionFactsEquipment,
  selectionFactsForDraft,
  selectionFactsPurchase,
  selectionFactsScenario,
} from '@/features/character/lib/equipment/equipment-selection-facts.fixtures'

import {
  deriveQuickNpcEquipmentSelectionFacts,
  quickNpcPackageAdvisoryLabels,
  resolveQuickNpcEquipmentRowStatus,
} from './quick-npc-equipment-row-status.lib'

const scenario = selectionFactsScenario()

function labels(equipmentId: string, context: 'edit_choice' | 'owned'): string[] {
  const facts = selectionFactsForDraft(
    scenario,
    selectionFactsDraft({
      optionId: 'starting-gold',
      purchases: [selectionFactsPurchase('greataxe'), selectionFactsPurchase('plate-armor')],
    }),
  )
  return resolveQuickNpcEquipmentRowStatus({
    facts,
    catalogIndex: scenario.catalogIndex,
    equipmentId,
    context,
  }).flatMap((item) => ('label' in item ? [item.label] : []))
}

describe('resolveQuickNpcEquipmentRowStatus', () => {
  it('shows package guidance on edit_choice and only compatibility on owned rows', () => {
    expect(labels(selectionFactsEquipment.spellbook.id, 'edit_choice')).toContain(
      'Required by class',
    )
    expect(labels(selectionFactsEquipment.spellbook.id, 'edit_choice')).not.toContain(
      'Included in package option',
    )
    expect(labels(selectionFactsEquipment.spellbook.id, 'owned')).not.toContain('Required by class')

    expect(labels(selectionFactsEquipment.greataxe.id, 'owned')).toEqual(['Not proficient'])
    expect(labels(selectionFactsEquipment['plate-armor'].id, 'owned')).toEqual([
      'Not proficient',
      'Requires STR 15',
    ])
  })

  it('returns no facts when the prepared draft is missing', () => {
    expect(
      deriveQuickNpcEquipmentSelectionFacts({
        prepared: null,
        catalogIndex: scenario.catalogIndex,
        rulesetId: scenario.context.rulesetId,
      }).resolvedById.size,
    ).toBe(0)
  })
})

describe('quickNpcPackageAdvisoryLabels', () => {
  const advisory: CharacterBuildAdvisory = {
    code: 'equipment_not_proficient',
    subject: {
      kind: 'equipment',
      equipmentId: selectionFactsEquipment['plate-armor'].id,
      label: 'Plate Armor',
      equipmentClass: 'armor',
    },
  }

  it('keeps the advisory sentence for retained rows and drops removed ones', () => {
    expect(
      quickNpcPackageAdvisoryLabels({
        advisories: [advisory],
        rows: [
          { equipmentId: selectionFactsEquipment['plate-armor'].id, retainedQuantity: 1 },
          { equipmentId: selectionFactsEquipment.greataxe.id, retainedQuantity: 0 },
        ],
      }),
    ).toEqual(['Not proficient with this armor'])
  })
})
