import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expectNoAxeViolations } from '@rpg/ui/test-utils'

import {
  buildMagicItemAllowanceId,
  createEmptyCharacterBuilderDraft,
  standardStartingWealthTableId,
  startingEquipmentChoiceSetId,
} from '@rpg/contracts'

import {
  createEquipmentStepContextWithMagicItemGrantsFixture,
  equipmentStepCatalogIndexFixture,
  equipmentStepContextFixture,
  equipmentStepMonkClassFixture,
  equipmentStepPotionOfHealingFixture,
} from '../../lib/equipment/equipment-step.fixtures'
import type { EquipmentInventoryRow } from '../../lib/equipment/equipment-step.lib'
import {
  EquipmentInventoryManagePanel,
  createStorybookApplyMagicItemAcquisition,
} from './equipment-inventory-manage-panel.client'

const rows: EquipmentInventoryRow[] = [
  {
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
  },
]

describe('EquipmentInventoryManagePanel', () => {
  it('releases one grant copy from the manage panel', async () => {
    const user = userEvent.setup()
    const onReleaseGrant = vi.fn()

    render(
      <EquipmentInventoryManagePanel
        equipmentName="Potion of Healing"
        equipment={equipmentStepPotionOfHealingFixture}
        rows={rows}
        draft={createEmptyCharacterBuilderDraft()}
        context={equipmentStepContextFixture}
        catalogIndex={equipmentStepCatalogIndexFixture}
        onReleaseGrant={onReleaseGrant}
        onRemovePurchase={vi.fn()}
        onApplyMagicItemAcquisition={vi.fn(() => true)}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Manage' }))
    const releaseButton = screen.getByRole('button', { name: 'Release one' })
    expect(releaseButton).toHaveClass('h-control-action-compact')
    await user.click(releaseButton)

    expect(onReleaseGrant).toHaveBeenCalledWith({
      allowanceId: 'allowance-common',
      equipmentId: 'srd-cc-5.2.1:potion-of-healing',
      quantity: 1,
    })
  })

  it('shows next-copy preview and add label before confirming another grant copy', async () => {
    const user = userEvent.setup()
    const allowanceId = buildMagicItemAllowanceId({
      startingWealthTableId: standardStartingWealthTableId('srd-cc-5.2.1'),
      tierId: 'hero',
      rarity: 'common',
    })
    const draft = {
      ...createEmptyCharacterBuilderDraft(),
      class: { classId: equipmentStepMonkClassFixture.id, level: 1 as const },
      choiceSelections: {
        [startingEquipmentChoiceSetId(equipmentStepMonkClassFixture.id)]: ['standard-equipment'],
      },
      equipment: {
        mode: 'package' as const,
        purchases: [],
        magicItemSelections: [
          {
            allowanceId,
            equipmentId: equipmentStepPotionOfHealingFixture.id,
            quantity: 1,
          },
        ],
        removedPackageItemKeys: [],
        customized: false,
      },
    }
    const context = createEquipmentStepContextWithMagicItemGrantsFixture()

    render(
      <EquipmentInventoryManagePanel
        equipmentName="Potion of Healing"
        equipment={equipmentStepPotionOfHealingFixture}
        rows={rows}
        draft={draft}
        context={context}
        catalogIndex={equipmentStepCatalogIndexFixture}
        onReleaseGrant={vi.fn()}
        onRemovePurchase={vi.fn()}
        onApplyMagicItemAcquisition={createStorybookApplyMagicItemAcquisition({
          draft,
          context,
          catalogIndex: equipmentStepCatalogIndexFixture,
        })}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Manage' }))

    expect(screen.getByRole('heading', { name: 'Next copy' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Use magic item choice' })).toBeInTheDocument()
  })

  it('lists grant and purchase sources for mixed rows', async () => {
    const user = userEvent.setup()
    const mixedRows: EquipmentInventoryRow[] = [
      ...rows,
      {
        group: 'magicItems',
        groupLabel: 'Magic Items',
        entry: {
          equipmentId: equipmentStepPotionOfHealingFixture.id,
          quantity: 1,
          sources: [{ kind: 'startingGold' }],
        },
        equipment: equipmentStepPotionOfHealingFixture,
        equipmentName: 'Potion of Healing',
        sourceLabel: 'Purchased with starting gold',
        isStackable: true,
        quantityMode: 'editable',
        removeLabel: 'Remove Potion of Healing',
        removeTarget: { kind: 'purchase', purchaseId: 'purchase-1' },
        quantityTarget: { kind: 'purchase', purchaseId: 'purchase-1' },
      },
    ]

    render(
      <EquipmentInventoryManagePanel
        equipmentName="Potion of Healing"
        equipment={equipmentStepPotionOfHealingFixture}
        rows={mixedRows}
        draft={createEmptyCharacterBuilderDraft()}
        context={equipmentStepContextFixture}
        catalogIndex={equipmentStepCatalogIndexFixture}
        onReleaseGrant={vi.fn()}
        onRemovePurchase={vi.fn()}
        onApplyMagicItemAcquisition={vi.fn(() => true)}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Manage' }))

    expect(screen.getByText('Common choices')).toBeInTheDocument()
    expect(screen.getByText('Purchased')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Remove one' })).toBeInTheDocument()
  })

  it('has no axe accessibility violations', async () => {
    const { container } = render(
      <EquipmentInventoryManagePanel
        equipmentName="Potion of Healing"
        equipment={equipmentStepPotionOfHealingFixture}
        rows={rows}
        draft={createEmptyCharacterBuilderDraft()}
        context={equipmentStepContextFixture}
        catalogIndex={equipmentStepCatalogIndexFixture}
        onReleaseGrant={vi.fn()}
        onRemovePurchase={vi.fn()}
        onApplyMagicItemAcquisition={vi.fn(() => true)}
      />,
    )

    await expectNoAxeViolations(container)
  })
})
