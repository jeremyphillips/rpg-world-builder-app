import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'

import type {
  CharacterBuildCatalogIndex,
  CharacterBuilderDraft,
  CharacterClass,
  StartingEquipmentOptionSummary,
} from '@rpg/contracts'
import { RadioCard } from '@rpg/ui'

import {
  buildGoldRadioCardOption,
  buildPackageRadioCardOption,
} from './starting-equipment-radio-card-builders'

const emptyGroups = {
  weapons: [],
  armor: [],
  tools: [],
  gear: [],
  magicItems: [],
  vehicles: [],
  mounts: [],
} satisfies StartingEquipmentOptionSummary['itemsByGroup']

function summary(
  overrides: Partial<StartingEquipmentOptionSummary> &
    Pick<StartingEquipmentOptionSummary, 'optionId' | 'label' | 'description'>,
): StartingEquipmentOptionSummary {
  return {
    orderedItems: [],
    itemsByGroup: emptyGroups,
    missingItemSlugs: [],
    unselectableReasons: [],
    isSelectable: true,
    funding: {
      classOptionId: overrides.optionId,
      classOptionWealth: { cp: 0, sp: 0, gp: 15, pp: 0 },
      tierAdditionalWealth: { cp: 0, sp: 0, gp: 637, pp: 0 },
      tierLabel: 'Hero',
      totalStartingWealth: { cp: 0, sp: 0, gp: 652, pp: 0 },
      classOptionPolicy: 'included',
    },
    ...overrides,
  }
}

const characterClass = {
  id: 'barbarian',
  rulesetId: 'srd-cc-5.2.1',
  characterCreation: { startingEquipment: { options: [] } },
} as unknown as CharacterClass

describe('starting equipment radio card tier summary', () => {
  it('shows the shared tier row on package and gold options', () => {
    render(
      <RadioCard
        aria-label="Starting equipment options"
        options={[
          buildPackageRadioCardOption({
            summary: summary({
              optionId: 'standard',
              label: 'Standard Equipment',
              description: "Greataxe, 4 Javelins, Explorer's Pack, and 15 GP.",
            }),
            characterClass,
            catalogIndex: {} as CharacterBuildCatalogIndex,
            draft: {} as CharacterBuilderDraft,
            resolvedChoiceSets: [],
            pendingNestedSelections: {},
            onSelectOption: vi.fn(),
            onNestedPoolChange: vi.fn(),
            onChoiceSelectionChange: vi.fn(),
          }),
          buildGoldRadioCardOption(
            summary({
              optionId: 'starting-gold',
              label: 'Starting Gold',
              description: 'Take 75 GP instead of standard equipment.',
              funding: {
                classOptionId: 'starting-gold',
                classOptionWealth: { cp: 0, sp: 0, gp: 75, pp: 0 },
                tierAdditionalWealth: { cp: 0, sp: 0, gp: 637, pp: 0 },
                tierLabel: 'Hero',
                totalStartingWealth: { cp: 0, sp: 0, gp: 712, pp: 0 },
                classOptionPolicy: 'included',
              },
            }),
          ),
        ]}
      />,
    )

    expect(screen.getByText('15 GP base')).toBeInTheDocument()
    expect(screen.getByText('652 GP total')).toBeInTheDocument()
    expect(screen.getByText('75 GP base')).toBeInTheDocument()
    expect(screen.getByText('712 GP total')).toBeInTheDocument()
    expect(screen.queryByText('+637 GP Hero tier')).not.toBeInTheDocument()
    expect(screen.queryByText('Hero tier adds 637 GP')).not.toBeInTheDocument()
    expect(screen.queryByText('Total purchasing gold: 652 GP')).not.toBeInTheDocument()
    expect(screen.queryByText('Total: 712 GP')).not.toBeInTheDocument()
  })
})
