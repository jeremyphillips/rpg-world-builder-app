import { describe, expect, it, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expectNoAxeViolations, itAxe } from '@rpg/ui/test-utils'

import { createEmptyCharacterBuilderDraft } from '@rpg/contracts'

import {
  equipmentStepCatalogIndexFixture,
  equipmentStepContextFixture,
  equipmentStepPotionOfHealingFixture,
} from '../../lib/equipment/equipment-step.fixtures'
import type { EquipmentInventoryRow } from '../../lib/equipment/equipment-step.lib'
import { EquipmentAddedInventoryRowItem } from './equipment-added-inventory-row.client'
import type { AddedEquipmentEntryViewModel } from './equipment-inventory-summary.lib'

const grantRow: EquipmentInventoryRow = {
  group: 'magicItems',
  groupLabel: 'Magic Items',
  entry: {
    equipmentId: 'srd-cc-5.2.1:potion-of-healing',
    quantity: 2,
    sources: [{ kind: 'startingWealthTier', sourceId: 'tier', grantId: 'allowance-common' }],
  },
  equipmentName: 'Potion of Healing',
  equipment: equipmentStepPotionOfHealingFixture,
  sourceLabel: 'Common choice',
  isStackable: true,
  quantityMode: 'locked',
  removeLabel: 'Release choice Potion of Healing',
  removeTarget: {
    kind: 'magicItemGrant',
    allowanceId: 'allowance-common',
    equipmentId: 'srd-cc-5.2.1:potion-of-healing',
  },
}

function entry(
  rows: EquipmentInventoryRow[],
  overrides?: Partial<AddedEquipmentEntryViewModel>,
): AddedEquipmentEntryViewModel {
  return {
    equipmentId: rows[0]!.entry.equipmentId,
    equipmentName: rows[0]!.equipmentName,
    group: rows[0]!.group,
    groupLabel: rows[0]!.groupLabel,
    totalQuantity: rows.reduce((sum, row) => sum + row.entry.quantity, 0),
    sources: [],
    provenanceLabel: '2 Common choices',
    rows,
    ...overrides,
  }
}

const defaultProps = {
  draft: createEmptyCharacterBuilderDraft(),
  context: equipmentStepContextFixture,
  catalogIndex: equipmentStepCatalogIndexFixture,
  onReleaseGrant: vi.fn(),
  onRemovePurchase: vi.fn(),
  onApplyMagicItemAcquisition: vi.fn(() => true),
}

describe('EquipmentAddedInventoryRowItem', () => {
  it('renders inline release for a single grant copy', async () => {
    const user = userEvent.setup()
    const onReleaseGrant = vi.fn()

    render(
      <EquipmentAddedInventoryRowItem
        entry={entry([{ ...grantRow, entry: { ...grantRow.entry, quantity: 1 } }], {
          provenanceLabel: '1 Common choice',
          totalQuantity: 1,
        })}
        {...defaultProps}
        onReleaseGrant={onReleaseGrant}
      />,
    )

    const releaseButton = screen.getByRole('button', { name: 'Release' })
    expect(releaseButton).toHaveClass('h-control-action-compact')
    expect(releaseButton).not.toHaveClass('bg-secondary')
    await user.click(releaseButton)
    expect(onReleaseGrant).toHaveBeenCalledWith({
      allowanceId: 'allowance-common',
      equipmentId: 'srd-cc-5.2.1:potion-of-healing',
      quantity: 1,
    })
  })

  it('renders manage disclosure for multi-copy grant rows without purchase controls', async () => {
    const user = userEvent.setup()

    render(<EquipmentAddedInventoryRowItem entry={entry([grantRow])} {...defaultProps} />)

    expect(screen.getByText('Qty 2')).toBeInTheDocument()
    const trigger = screen.getByRole('button', { name: 'Manage' })
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
    expect(trigger).toHaveClass('text-xs')

    await user.click(trigger)
    const ownedHeadingRow = screen.getByRole('heading', { name: 'Owned copies' }).parentElement
    expect(within(ownedHeadingRow!).getByText('2')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Remove all/ })).not.toBeInTheDocument()
  })

  it('renders manage without trash controls for mixed grant and purchase rows', () => {
    const purchaseRow: EquipmentInventoryRow = {
      group: 'magicItems',
      groupLabel: 'Magic Items',
      entry: {
        equipmentId: 'srd-cc-5.2.1:potion-of-healing',
        quantity: 1,
        sources: [{ kind: 'startingGold' }],
      },
      equipmentName: 'Potion of Healing',
      sourceLabel: 'Purchased with starting gold',
      isStackable: true,
      quantityMode: 'editable',
      removeLabel: 'Remove Potion of Healing',
      removeTarget: { kind: 'purchase', purchaseId: 'purchase-1' },
      quantityTarget: { kind: 'purchase', purchaseId: 'purchase-1' },
    }

    render(
      <EquipmentAddedInventoryRowItem
        entry={entry([grantRow, purchaseRow], {
          provenanceLabel: '2 Common choices · Purchased · 50 GP',
          totalQuantity: 3,
        })}
        {...defaultProps}
      />,
    )

    expect(screen.getByText('Qty 3')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Manage' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Remove all/ })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Release' })).not.toBeInTheDocument()
  })

  itAxe('has no axe accessibility violations', async () => {
    const { container } = render(
      <EquipmentAddedInventoryRowItem entry={entry([grantRow])} {...defaultProps} />,
    )

    await expectNoAxeViolations(container)
  })
})
