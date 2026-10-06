import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { expectNoAxeViolations, itAxe } from '@rpg/ui/test-utils'

import {
  buildEquipmentInventoryViewModel,
  type AddedEquipmentCategoryGroup,
  type AddedEquipmentEntryViewModel,
} from '../../../../lib/equipment/equipment-inventory-summary.lib'
import {
  selectionFactsDraft,
  selectionFactsForDraft,
  selectionFactsPurchase,
  selectionFactsScenario,
} from '../../../../lib/equipment/equipment-selection-facts.fixtures'
import type { EquipmentInventoryRow } from '../../../../lib/equipment/equipment-step.lib'
import { EQUIPMENT_ADDED_INVENTORY_EMPTY_MESSAGE } from '../../../../lib/equipment/equipment-step.lib'
import { EquipmentAddedInventorySection } from './equipment-added-inventory-section'

const scenario = selectionFactsScenario()
const draft = selectionFactsDraft({
  optionId: 'starting-gold',
  purchases: [selectionFactsPurchase('plate-armor'), selectionFactsPurchase('dagger')],
})

function addedEquipment(): AddedEquipmentCategoryGroup[] {
  const viewModel = buildEquipmentInventoryViewModel(
    draft,
    scenario.catalogIndex,
    undefined,
    'included',
    scenario.context,
    selectionFactsForDraft(scenario, draft),
  )
  if (!viewModel) throw new Error('Expected an inventory view model')
  return viewModel.addedEquipment
}

function withMagicItemGrantRow(entry: AddedEquipmentEntryViewModel): AddedEquipmentEntryViewModel {
  const purchaseRow = entry.rows[0]!
  const grantRow: EquipmentInventoryRow = {
    ...purchaseRow,
    entry: {
      ...purchaseRow.entry,
      sources: [{ kind: 'startingWealthTier', sourceId: 'tier', grantId: 'allowance-rare' }],
    },
    sourceLabel: 'Rare choice',
    quantityMode: 'locked',
    removeTarget: {
      kind: 'magicItemGrant',
      allowanceId: 'allowance-rare',
      equipmentId: entry.equipmentId,
    },
    quantityTarget: undefined,
  }
  return { ...entry, rows: [grantRow, purchaseRow], totalQuantity: 2 }
}

const sectionProps = {
  draft,
  context: scenario.context,
  catalogIndex: scenario.catalogIndex,
  onReleaseGrant: vi.fn(),
  onRemovePurchase: vi.fn(),
  onApplyMagicItemAcquisition: vi.fn(() => true),
}

describe('EquipmentAddedInventorySection', () => {
  it('resolves owned status for single rows', () => {
    render(<EquipmentAddedInventorySection addedEquipment={addedEquipment()} {...sectionProps} />)

    expect(screen.getByText('Not proficient')).toBeInTheDocument()
    expect(screen.getByText('Requires STR 15')).toBeInTheDocument()
  })

  it('resolves owned status through the managed disclosure path', () => {
    const groups = addedEquipment().map((group) => ({
      ...group,
      entries: group.entries.map((entry) =>
        entry.equipmentName === 'Plate Armor' ? withMagicItemGrantRow(entry) : entry,
      ),
    }))

    render(<EquipmentAddedInventorySection addedEquipment={groups} {...sectionProps} />)

    expect(screen.getByRole('button', { name: 'Expand Plate Armor' })).toBeInTheDocument()
    expect(screen.getByText('Not proficient')).toBeInTheDocument()
    expect(screen.getByText('Requires STR 15')).toBeInTheDocument()
  })

  it('renders the empty message without entries', () => {
    render(<EquipmentAddedInventorySection addedEquipment={[]} {...sectionProps} />)

    expect(screen.getByText(EQUIPMENT_ADDED_INVENTORY_EMPTY_MESSAGE)).toBeInTheDocument()
  })

  itAxe('has no axe accessibility violations', async () => {
    const { container } = render(
      <EquipmentAddedInventorySection addedEquipment={addedEquipment()} {...sectionProps} />,
    )

    await expectNoAxeViolations(container)
  })
})
