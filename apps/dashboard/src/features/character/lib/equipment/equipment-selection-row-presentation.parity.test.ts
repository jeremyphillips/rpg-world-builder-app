import { describe, expect, it } from 'vitest'

import {
  isArmorEquipment,
  isWeaponEquipment,
  reconcileEquipmentForClassChange,
  resolveAvailableChoices,
  resolveCharacterBuildAdvisoriesForDraft,
  type CharacterBuilderDraft,
} from '@rpg/contracts'

import { indexBuildAdvisoriesByEquipmentId } from '../build-advisories/build-advisory-presentation.lib'
import { buildEquipmentInventoryViewModel } from './equipment-inventory-summary.lib'
import {
  selectionFactsDraft,
  selectionFactsEquipment,
  selectionFactsFighterClass,
  selectionFactsForDraft,
  selectionFactsPurchase,
  selectionFactsScenario,
  selectionFactsWizardClass,
} from './equipment-selection-facts.fixtures'
import type { EquipmentInventoryRow } from './equipment-step.lib'

const scenario = selectionFactsScenario()

function ownedRows(draft: CharacterBuilderDraft): EquipmentInventoryRow[] {
  const viewModel = buildEquipmentInventoryViewModel(
    draft,
    scenario.catalogIndex,
    undefined,
    'included',
    scenario.context,
    selectionFactsForDraft(scenario, draft),
  )
  if (!viewModel) return []
  const addedRows = viewModel.addedEquipment.flatMap((group) =>
    group.entries.flatMap((entry) =>
      entry.rows.map((row) => ({ ...row, selectionPresentation: entry.selectionPresentation })),
    ),
  )
  const packageRows =
    viewModel.layout === 'split' && viewModel.startingEquipment.kind === 'package'
      ? viewModel.startingEquipment.group.categoryGroups.flatMap((category) => category.rows)
      : []
  return [...packageRows, ...addedRows]
}

function hasCompatibilityEntry(row: EquipmentInventoryRow): boolean {
  return (row.selectionPresentation?.status ?? []).some(
    (entry) => entry.category === 'compatibility',
  )
}

function retainedAfterClassSwitchDraft(): CharacterBuilderDraft {
  const fighterDraft = selectionFactsDraft({
    characterClass: selectionFactsFighterClass,
    optionId: 'starting-gold',
    purchases: [
      selectionFactsPurchase('greatsword'),
      selectionFactsPurchase('plate-armor'),
      selectionFactsPurchase('dagger'),
    ],
  })
  return {
    ...fighterDraft,
    class: { classId: selectionFactsWizardClass.id, level: 1 },
    choiceSelections: {},
    equipment: reconcileEquipmentForClassChange({
      equipment: fighterDraft.equipment,
      previous: fighterDraft.class,
      next: { classId: selectionFactsWizardClass.id, level: 1 },
      context: scenario.context,
    }),
  }
}

const DRAFTS: [label: string, draft: CharacterBuilderDraft, hasIncompatible: boolean][] = [
  ['wizard package', selectionFactsDraft({ optionId: 'standard-equipment' }), false],
  [
    'fighter package at STR 8',
    selectionFactsDraft({ characterClass: selectionFactsFighterClass, optionId: 'heavy-armor' }),
    true,
  ],
  [
    'wizard gold purchases',
    selectionFactsDraft({
      optionId: 'starting-gold',
      purchases: [
        selectionFactsPurchase('plate-armor'),
        selectionFactsPurchase('greataxe'),
        selectionFactsPurchase('dagger'),
        selectionFactsPurchase('chain-mail'),
      ],
    }),
    true,
  ],
  [
    'wizard package with a grant on a purchased weapon',
    selectionFactsDraft({
      optionId: 'standard-equipment',
      purchases: [selectionFactsPurchase('greataxe')],
      grants: [
        {
          equipmentId: selectionFactsEquipment.greataxe.id,
          quantity: 1,
          contribution: 'additional',
        },
      ],
    }),
    true,
  ],
  ['retained purchases after a class switch', retainedAfterClassSwitchDraft(), true],
]

describe('owned equipment row/advisory parity', () => {
  it.each(DRAFTS)('%s', (_label, draft, hasIncompatible) => {
    const advisoriesById = indexBuildAdvisoriesByEquipmentId(
      resolveCharacterBuildAdvisoriesForDraft(draft, scenario.context, {
        resolvedChoiceSets: resolveAvailableChoices(draft, scenario.context),
      }),
    )
    const rows = ownedRows(draft).filter(
      (row) =>
        row.equipment && (isWeaponEquipment(row.equipment) || isArmorEquipment(row.equipment)),
    )

    expect(rows.length).toBeGreaterThan(0)
    expect(rows.some(hasCompatibilityEntry)).toBe(hasIncompatible)
    for (const row of rows) {
      expect({
        equipmentId: row.entry.equipmentId,
        compatibility: hasCompatibilityEntry(row),
      }).toEqual({
        equipmentId: row.entry.equipmentId,
        compatibility: (advisoriesById.get(row.equipment!.id) ?? []).length > 0,
      })
    }
  })

  it('covers both compatibility advisory codes', () => {
    const draft = DRAFTS.find(([label]) => label === 'wizard gold purchases')![1]
    const codes = resolveCharacterBuildAdvisoriesForDraft(draft, scenario.context).map(
      (advisory) => advisory.code,
    )

    expect(new Set(codes)).toEqual(
      new Set(['equipment_not_proficient', 'equipment_ability_score_requirement_unmet']),
    )
  })
})
