import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expectNoAxeViolations } from '@rpg/ui/test-utils'

import { createEmptyCharacterBuilderDraft } from '@rpg/contracts'

import {
  equipmentStepCatalogIndexFixture,
  equipmentStepContextFixture,
} from '../../lib/equipment-step.fixtures'
import type { EquipmentInventoryRow } from '../../lib/equipment-step.lib'
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
        draft={createEmptyCharacterBuilderDraft()}
        context={equipmentStepContextFixture}
        catalogIndex={equipmentStepCatalogIndexFixture}
        onReleaseGrant={onReleaseGrant}
        onRemovePurchase={vi.fn()}
        onAddAnother={vi.fn()}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Release' }))
    expect(onReleaseGrant).toHaveBeenCalledWith({
      allowanceId: 'allowance-common',
      equipmentId: 'srd-cc-5.2.1:potion-of-healing',
      quantity: 1,
    })
  })

  it('renders manage for multi-copy grant rows without purchase controls', () => {
    render(
      <EquipmentAddedInventoryRowItem
        entry={entry([grantRow])}
        draft={createEmptyCharacterBuilderDraft()}
        context={equipmentStepContextFixture}
        catalogIndex={equipmentStepCatalogIndexFixture}
        onReleaseGrant={vi.fn()}
        onRemovePurchase={vi.fn()}
        onAddAnother={vi.fn()}
      />,
    )

    expect(screen.getByText('Qty 2')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Manage' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Remove all/ })).not.toBeInTheDocument()
  })

  it('has no axe accessibility violations', async () => {
    const { container } = render(
      <EquipmentAddedInventoryRowItem
        entry={entry([grantRow])}
        draft={createEmptyCharacterBuilderDraft()}
        context={equipmentStepContextFixture}
        catalogIndex={equipmentStepCatalogIndexFixture}
        onReleaseGrant={vi.fn()}
        onRemovePurchase={vi.fn()}
        onAddAnother={vi.fn()}
      />,
    )

    await expectNoAxeViolations(container)
  })
})
