import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expectNoAxeViolations } from '@rpg/ui/test-utils'

import {
  createEmptyCharacterBuilderDraft,
  nestedStartingEquipmentChoiceSetId,
  createDeterministicLegacyPurchaseId,
  startingEquipmentChoiceSetId,
} from '@rpg/contracts'

import {
  equipmentStepBardClassFixture,
  equipmentStepCatalogIndexFixture,
} from '../../lib/equipment-step.fixtures'
import { EquipmentInventorySummary } from './equipment-inventory-summary.client'
import { EquipmentInventoryRowItem } from './equipment-inventory-row.client'
import type { EquipmentInventoryRow } from '../../lib/equipment-step.lib'

describe('EquipmentInventorySummary', () => {
  it('renders package rows with qty-in-title and remove-from-package action', async () => {
    const user = userEvent.setup()
    const onRemoveFromPackage = vi.fn()
    const draft = {
      ...createEmptyCharacterBuilderDraft(),
      class: { classId: equipmentStepBardClassFixture.id, level: 1 as const },
      choiceSelections: {
        [startingEquipmentChoiceSetId(equipmentStepBardClassFixture.id)]: ['standard'],
        [nestedStartingEquipmentChoiceSetId(equipmentStepBardClassFixture.id, 'standard', 1)]: [
          'srd-cc-5.2.1:lute',
        ],
      },
      equipment: {
        mode: 'package' as const,
        purchases: [],
        removedPackageItemKeys: [],
        customized: false,
      },
    }

    render(
      <EquipmentInventorySummary
        draft={draft}
        catalogIndex={equipmentStepCatalogIndexFixture}
        onRemoveFromPackage={onRemoveFromPackage}
      />,
    )

    expect(screen.getByText('1 × Leather Armor')).toBeInTheDocument()
    expect(screen.getByText('1 × Lute')).toBeInTheDocument()
    expect(screen.getByText('Starting Equipment')).toBeInTheDocument()
    expect(screen.getByText('Purchased with Starting Gold')).toBeInTheDocument()

    await user.click(screen.getAllByRole('button', { name: 'Remove from package' })[0]!)

    expect(onRemoveFromPackage).toHaveBeenCalledWith(
      `${equipmentStepBardClassFixture.id}:standard:0`,
    )
  })

  it('renders editable starting-gold stackable rows with quantity controls', async () => {
    const user = userEvent.setup()
    const onSetPurchaseQuantity = vi.fn()
    const rationsId = 'srd-cc-5.2.1:rations'
    const draft = {
      ...createEmptyCharacterBuilderDraft(),
      class: { classId: equipmentStepBardClassFixture.id, level: 1 as const },
      choiceSelections: {
        [startingEquipmentChoiceSetId(equipmentStepBardClassFixture.id)]: ['gold'],
      },
      equipment: {
        mode: 'gold' as const,
        purchases: [
          {
            equipmentId: rationsId,
            quantity: 2,
            sourceMode: 'startingGold' as const,
            origin: 'picker' as const,
          },
        ],
        removedPackageItemKeys: [],
        customized: false,
      },
    }

    const catalogIndex = {
      ...equipmentStepCatalogIndexFixture,
      equipment: new Map([
        ...equipmentStepCatalogIndexFixture.equipment,
        [
          rationsId,
          {
            id: rationsId,
            slug: 'rations',
            rulesetId: 'srd-cc-5.2.1',
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
          },
        ],
      ]),
    }

    render(
      <EquipmentInventorySummary
        draft={draft}
        catalogIndex={catalogIndex}
        onRemoveItem={vi.fn()}
        onSetPurchaseQuantity={onSetPurchaseQuantity}
      />,
    )

    expect(screen.getByText('Rations')).toBeInTheDocument()
    expect(screen.getByText(/Purchased with starting gold · 5 SP each/)).toBeInTheDocument()
    expect(screen.getByText('10 SP total')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Remove all 2 Rations' })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Increment' }))

    expect(onSetPurchaseQuantity).toHaveBeenCalledWith(
      {
        kind: 'purchase',
        purchaseId: createDeterministicLegacyPurchaseId({
          equipmentId: rationsId,
          sourceMode: 'startingGold',
          occurrenceIndex: 0,
        }),
      },
      3,
    )
  })

  it('renders locked package grants with quantity in provenance', () => {
    const row: EquipmentInventoryRow = {
      group: 'weapons',
      groupLabel: 'Weapons',
      entry: {
        equipmentId: 'srd-cc-5.2.1:dagger',
        quantity: 2,
        sources: [
          {
            kind: 'classStartingEquipment',
            sourceId: equipmentStepBardClassFixture.id,
            grantId: 'standard',
          },
        ],
      },
      equipmentName: 'Dagger',
      sourceLabel: '2 included with Standard Equipment',
      isStackable: false,
      quantityMode: 'locked',
      removeLabel: 'Remove all 2 Dagger',
      removeTarget: {
        kind: 'package',
        packageItemKey: `${equipmentStepBardClassFixture.id}:standard:0`,
      },
    }

    render(<EquipmentInventoryRowItem display={{ kind: 'single', row }} onRemoveItem={vi.fn()} />)

    expect(screen.getByText('Dagger')).toBeInTheDocument()
    expect(screen.getByText('2 included with Standard Equipment')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Increment' })).not.toBeInTheDocument()
  })

  it('uses click-to-edit for large stack quantities', async () => {
    const user = userEvent.setup()
    const onSetPurchaseQuantity = vi.fn()
    const row: EquipmentInventoryRow = {
      group: 'gear',
      groupLabel: 'Gear',
      entry: {
        equipmentId: 'srd-cc-5.2.1:rations',
        quantity: 12,
        sources: [{ kind: 'startingGold' }],
      },
      equipmentName: 'Rations',
      sourceLabel: 'Purchased with starting gold',
      isStackable: true,
      quantityMode: 'editable',
      maxQuantity: 20,
      unitPriceLabel: '5 SP each',
      totalPriceLabel: '60 SP',
      removeLabel: 'Remove all 12 Rations',
      removeTarget: { kind: 'purchase', purchaseId: 'purchase-test-0' },
      quantityTarget: { kind: 'purchase', purchaseId: 'purchase-test-0' },
    }

    render(
      <EquipmentInventoryRowItem
        display={{ kind: 'single', row }}
        onSetPurchaseQuantity={onSetPurchaseQuantity}
      />,
    )

    expect(screen.getByRole('button', { name: 'Edit quantity for Rations' })).toHaveTextContent(
      '12',
    )
    await user.click(screen.getByRole('button', { name: 'Edit quantity for Rations' }))
    expect(screen.getByRole('spinbutton', { name: 'Quantity for Rations' })).toBeInTheDocument()
  })

  it('has no axe accessibility violations', async () => {
    const draft = {
      ...createEmptyCharacterBuilderDraft(),
      class: { classId: equipmentStepBardClassFixture.id, level: 1 as const },
      choiceSelections: {
        [startingEquipmentChoiceSetId(equipmentStepBardClassFixture.id)]: ['gold'],
      },
      equipment: {
        mode: 'gold' as const,
        purchases: [],
        removedPackageItemKeys: [],
        customized: false,
      },
    }

    const { container } = render(
      <EquipmentInventorySummary
        draft={draft}
        catalogIndex={equipmentStepCatalogIndexFixture}
        onRemoveItem={vi.fn()}
      />,
    )

    await expectNoAxeViolations(container)
  })
})
