import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expectNoAxeViolations, itAxe } from '@rpg/ui/test-utils'

import {
  createEmptyCharacterBuilderDraft,
  nestedStartingEquipmentChoiceSetId,
  createDeterministicLegacyPurchaseId,
  startingEquipmentChoiceSetId,
} from '@rpg/contracts'

import {
  equipmentStepBardClassFixture,
  equipmentStepBattleaxeFixture,
  equipmentStepCatalogIndexFixture,
  equipmentStepContextFixture,
  equipmentStepLeatherArmorFixture,
  equipmentStepMonkClassFixture,
} from '../../lib/equipment/equipment-step.fixtures'
import {
  EQUIPMENT_GOLD_OPTION_STARTING_MESSAGE,
  EQUIPMENT_STEP_BROWSE_LABEL,
  formatEquipmentGoldOptionStartingDescription,
} from '../../lib/equipment/equipment-step.lib'
import { EquipmentInventorySummary } from './equipment-inventory-summary.client'
import { EquipmentInventoryRowItem } from './equipment-inventory-row.client'
import type { EquipmentInventoryRow } from '../../lib/equipment/equipment-step.lib'

const inventoryManagementProps = {
  context: equipmentStepContextFixture,
  onReleaseGrant: vi.fn(),
  onRemovePurchase: vi.fn(),
  onApplyMagicItemAcquisition: vi.fn(() => true),
}

describe('EquipmentInventorySummary', () => {
  it('renders package rows with name and value pricing', async () => {
    const draft = {
      ...createEmptyCharacterBuilderDraft(),
      class: { classId: equipmentStepBardClassFixture.id, level: 1 as const },
      choiceSelections: {
        [startingEquipmentChoiceSetId(equipmentStepBardClassFixture.id)]: ['standard-equipment'],
        [nestedStartingEquipmentChoiceSetId(
          equipmentStepBardClassFixture.id,
          'standard-equipment',
          1,
        )]: ['srd-cc-5.2.1:lute'],
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
        {...inventoryManagementProps}
      />,
    )

    expect(screen.getByText('Leather Armor')).toBeInTheDocument()
    expect(screen.getByText('Lute')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Remove from package' })).not.toBeInTheDocument()
    expect(screen.getByText('Added Equipment')).toBeInTheDocument()
  })

  it('keeps package gear visible after a purchase on the package path', () => {
    const catalogIndex = {
      ...equipmentStepCatalogIndexFixture,
      equipment: new Map([
        ...equipmentStepCatalogIndexFixture.equipment,
        [equipmentStepBattleaxeFixture.id, equipmentStepBattleaxeFixture],
      ]),
    }
    const draft = {
      ...createEmptyCharacterBuilderDraft(),
      class: { classId: equipmentStepMonkClassFixture.id, level: 1 as const },
      choiceSelections: {
        [startingEquipmentChoiceSetId(equipmentStepMonkClassFixture.id)]: ['standard-equipment'],
      },
      equipment: {
        mode: 'package' as const,
        purchases: [
          {
            equipmentId: equipmentStepBattleaxeFixture.id,
            quantity: 1,
            sourceMode: 'startingGold' as const,
            origin: 'picker' as const,
          },
        ],
        removedPackageItemKeys: [],
        customized: false,
      },
    }

    render(
      <EquipmentInventorySummary
        draft={draft}
        catalogIndex={catalogIndex}
        {...inventoryManagementProps}
      />,
    )

    expect(screen.getByText('Spear')).toBeInTheDocument()
    expect(screen.getByText('Battleaxe')).toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: EQUIPMENT_STEP_BROWSE_LABEL }),
    ).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Choose magic items' })).not.toBeInTheDocument()
  })

  it('renders editable starting-gold stackable rows with quantity controls', async () => {
    const user = userEvent.setup()
    const onSetPurchaseQuantity = vi.fn()
    const rationsId = 'srd-cc-5.2.1:rations'
    const draft = {
      ...createEmptyCharacterBuilderDraft(),
      class: { classId: equipmentStepBardClassFixture.id, level: 1 as const },
      choiceSelections: {
        [startingEquipmentChoiceSetId(equipmentStepBardClassFixture.id)]: ['starting-gold'],
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
            status: 'published',
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
        {...inventoryManagementProps}
      />,
    )

    expect(screen.getByText('Rations')).toBeInTheDocument()
    expect(screen.getByText('2 purchased for 1 GP')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Remove all 2 Rations' })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Increase Rations quantity' }))

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

  it('renders starting-gold armor rows with quantity controls on the gold path', async () => {
    const user = userEvent.setup()
    const onSetPurchaseQuantity = vi.fn()
    const draft = {
      ...createEmptyCharacterBuilderDraft(),
      class: { classId: equipmentStepBardClassFixture.id, level: 1 as const },
      choiceSelections: {
        [startingEquipmentChoiceSetId(equipmentStepBardClassFixture.id)]: ['starting-gold'],
      },
      equipment: {
        mode: 'gold' as const,
        purchases: [
          {
            equipmentId: equipmentStepLeatherArmorFixture.id,
            quantity: 1,
            sourceMode: 'startingGold' as const,
            origin: 'picker' as const,
          },
        ],
        removedPackageItemKeys: [],
        customized: false,
      },
    }

    render(
      <EquipmentInventorySummary
        draft={draft}
        catalogIndex={equipmentStepCatalogIndexFixture}
        onRemoveItem={vi.fn()}
        onSetPurchaseQuantity={onSetPurchaseQuantity}
        {...inventoryManagementProps}
      />,
    )

    expect(screen.getByText('Leather Armor')).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Increase Leather Armor quantity' }),
    ).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Increase Leather Armor quantity' }))

    expect(onSetPurchaseQuantity).toHaveBeenCalled()
  })

  it('renders locked package grants with value pricing and read-only quantity', () => {
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
            grantId: 'standard-equipment',
          },
        ],
      },
      equipmentName: 'Dagger',
      sourceLabel: '2 included with Standard Equipment',
      isStackable: false,
      quantityMode: 'locked',
      priceLineLabel: '2 GP value · 4 GP total value',
      removeLabel: 'Remove all 2 Dagger',
      removeTarget: {
        kind: 'package',
        packageItemKey: `${equipmentStepBardClassFixture.id}:standard-equipment:0`,
      },
    }

    render(<EquipmentInventoryRowItem display={{ kind: 'single', row }} onRemoveItem={vi.fn()} />)

    expect(screen.getByText('Dagger')).toBeInTheDocument()
    expect(screen.getByText('2 GP value · 4 GP total value')).toBeInTheDocument()
    expect(screen.getByText('Qty 2')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Increase Quantity/ })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Remove all/ })).not.toBeInTheDocument()
  })

  it('keeps the stepper visible for large stack quantities', async () => {
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
      priceLineLabel: '5 SP each · 6 GP total',
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

    expect(screen.getByRole('spinbutton', { name: 'Rations quantity' })).toHaveValue(12)
    await user.click(screen.getByRole('button', { name: 'Increase Rations quantity' }))
    expect(onSetPurchaseQuantity).toHaveBeenCalledWith(
      { kind: 'purchase', purchaseId: 'purchase-test-0' },
      13,
    )
  })

  it('renders the gold-option panel copy with outline-only chrome', () => {
    const draft = {
      ...createEmptyCharacterBuilderDraft(),
      class: { classId: equipmentStepBardClassFixture.id, level: 1 as const },
      choiceSelections: {
        [startingEquipmentChoiceSetId(equipmentStepBardClassFixture.id)]: ['starting-gold'],
      },
      equipment: {
        mode: 'gold' as const,
        purchases: [],
        removedPackageItemKeys: [],
        customized: false,
      },
    }

    render(
      <EquipmentInventorySummary
        draft={draft}
        catalogIndex={equipmentStepCatalogIndexFixture}
        {...inventoryManagementProps}
      />,
    )

    expect(
      screen.getByRole('heading', { name: EQUIPMENT_GOLD_OPTION_STARTING_MESSAGE }),
    ).toHaveClass('heading-style-group')
    expect(
      screen.getByText(formatEquipmentGoldOptionStartingDescription(false)),
    ).toBeInTheDocument()

    const startingColumn = screen
      .getByRole('heading', { name: EQUIPMENT_GOLD_OPTION_STARTING_MESSAGE })
      .closest('section')
    expect(startingColumn?.querySelector('.border-border')).toBeInTheDocument()
    expect(startingColumn?.querySelector('.bg-sunken')).not.toBeInTheDocument()
  })

  it('reserves the toolbar row on the added column for package-path alignment', () => {
    const draft = {
      ...createEmptyCharacterBuilderDraft(),
      class: { classId: equipmentStepBardClassFixture.id, level: 1 as const },
      choiceSelections: {
        [startingEquipmentChoiceSetId(equipmentStepBardClassFixture.id)]: ['standard-equipment'],
        [nestedStartingEquipmentChoiceSetId(
          equipmentStepBardClassFixture.id,
          'standard-equipment',
          1,
        )]: ['srd-cc-5.2.1:lute'],
      },
      equipment: {
        mode: 'package' as const,
        purchases: [],
        removedPackageItemKeys: [],
        customized: false,
      },
    }

    const { container } = render(
      <EquipmentInventorySummary
        draft={draft}
        catalogIndex={equipmentStepCatalogIndexFixture}
        {...inventoryManagementProps}
      />,
    )

    const addedColumn = screen.getByRole('heading', { name: 'Added Equipment' }).closest('section')
    expect(addedColumn?.querySelector('[aria-hidden="true"]')).toBeInTheDocument()
    expect(container.querySelector('.bg-card')).not.toBeInTheDocument()
  })

  it('renders a title badge and outline panel when added inventory has entries', () => {
    const draft = {
      ...createEmptyCharacterBuilderDraft(),
      class: { classId: equipmentStepMonkClassFixture.id, level: 1 as const },
      choiceSelections: {
        [startingEquipmentChoiceSetId(equipmentStepMonkClassFixture.id)]: ['standard-equipment'],
      },
      equipment: {
        mode: 'package' as const,
        purchases: [
          {
            equipmentId: equipmentStepBattleaxeFixture.id,
            quantity: 1,
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
        [equipmentStepBattleaxeFixture.id, equipmentStepBattleaxeFixture],
      ]),
    }

    const { container } = render(
      <EquipmentInventorySummary
        draft={draft}
        catalogIndex={catalogIndex}
        {...inventoryManagementProps}
      />,
    )

    expect(screen.getByText('1')).toBeInTheDocument()
    expect(screen.getByText('Battleaxe')).toBeInTheDocument()
    expect(container.querySelector('.bg-card')).not.toBeInTheDocument()
  })

  itAxe('has no axe accessibility violations', async () => {
    const draft = {
      ...createEmptyCharacterBuilderDraft(),
      class: { classId: equipmentStepBardClassFixture.id, level: 1 as const },
      choiceSelections: {
        [startingEquipmentChoiceSetId(equipmentStepBardClassFixture.id)]: ['starting-gold'],
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
        {...inventoryManagementProps}
      />,
    )

    await expectNoAxeViolations(container)
  })
})
