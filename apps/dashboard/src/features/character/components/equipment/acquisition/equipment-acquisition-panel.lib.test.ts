import { describe, expect, it } from 'vitest'

import {
  buildEquipmentAcquisitionPanelViewModel,
  formatAcquisitionCommitLabel,
  formatAcquisitionCommitSuccessAnnouncement,
  formatAcquisitionCommitSuccessButtonLabel,
  formatOwnedPurchaseQuantityLabel,
  formatTotalPurchaseSpendFromSnapshots,
} from './equipment-acquisition-panel.lib'
import {
  createEquipmentStepContextWithMagicItemGrantsFixture,
  equipmentStepCatalogIndexFixture,
  equipmentStepMonkClassFixture,
  equipmentStepPotionOfHealingFixture,
} from '../../../lib/equipment/equipment-step.fixtures'
import {
  createEmptyCharacterBuilderDraft,
  startingEquipmentChoiceSetId,
  buildMagicItemAllowanceId,
  standardStartingWealthTableId,
} from '@rpg/contracts'

describe('equipment-acquisition-panel.lib', () => {
  it('formats commit labels for grant-only and multi-quantity adds', () => {
    expect(
      formatAcquisitionCommitLabel({
        plan: {
          requestedQuantity: 1,
          fulfilledQuantity: 1,
          unfulfilledQuantity: 0,
          grantAllocations: [{ allowanceId: 'allowance-common', quantity: 1 }],
          purchaseQuantity: 0,
          totalCostCp: 0,
          canApplyRequestedQuantity: true,
          blockers: [],
        },
        quantity: 1,
      }),
    ).toBe('Use magic item choice')

    expect(
      formatAcquisitionCommitLabel({
        plan: {
          requestedQuantity: 2,
          fulfilledQuantity: 2,
          unfulfilledQuantity: 0,
          grantAllocations: [
            { allowanceId: 'allowance-common', quantity: 1 },
            { allowanceId: 'allowance-common', quantity: 1 },
          ],
          purchaseQuantity: 0,
          totalCostCp: 0,
          canApplyRequestedQuantity: true,
          blockers: [],
        },
        quantity: 2,
      }),
    ).toBe('Use 2 magic item choices')

    expect(
      formatAcquisitionCommitLabel({
        plan: {
          requestedQuantity: 3,
          fulfilledQuantity: 3,
          unfulfilledQuantity: 0,
          grantAllocations: [],
          purchaseQuantity: 3,
          totalCostCp: 15000,
          canApplyRequestedQuantity: true,
          blockers: [],
        },
        quantity: 3,
      }),
    ).toBe('Add 3 to inventory')
  })

  it('formats owned purchase quantity labels from snapshots', () => {
    expect(
      formatOwnedPurchaseQuantityLabel({
        quantity: 1,
        unitCostCp: 5000,
      }),
    ).toEqual({
      quantityLabel: '1',
      spendSuffix: '50 GP spent',
    })
  })

  it('sums snapshot-based GP spent labels', () => {
    expect(formatTotalPurchaseSpendFromSnapshots([{ quantity: 15, unitCostCp: 5000 }])).toBe(
      '750 GP spent',
    )
  })

  it('formats commit success button and announcement labels', () => {
    expect(formatAcquisitionCommitSuccessButtonLabel(3)).toBe('Added 3 ✓')
    expect(formatAcquisitionCommitSuccessAnnouncement(3)).toBe('Added 3 to inventory')
  })

  it('formats next-action preview lines for grant, mixed, and purchase paths', () => {
    const draft = {
      ...createEmptyCharacterBuilderDraft(),
      class: { classId: equipmentStepMonkClassFixture.id, level: 1 as const },
      choiceSelections: {
        [startingEquipmentChoiceSetId(equipmentStepMonkClassFixture.id)]: ['standard-equipment'],
      },
      equipment: {
        mode: 'package' as const,
        purchases: [],
        removedPackageItemKeys: [],
        customized: false,
      },
    }
    const context = createEquipmentStepContextWithMagicItemGrantsFixture()

    const grantOnlyViewModel = buildEquipmentAcquisitionPanelViewModel({
      draft,
      context,
      catalogIndex: equipmentStepCatalogIndexFixture,
      equipment: equipmentStepPotionOfHealingFixture,
      rows: [],
      requestedQuantity: 1,
    })

    expect(grantOnlyViewModel.nextAction.previewLines).toEqual(['Uses 1 Common choice'])

    const goldOptionDraft = {
      ...createEmptyCharacterBuilderDraft(),
      class: { classId: equipmentStepMonkClassFixture.id, level: 1 as const },
      choiceSelections: {
        [startingEquipmentChoiceSetId(equipmentStepMonkClassFixture.id)]: ['starting-gold'],
      },
      equipment: {
        mode: 'gold' as const,
        purchases: [],
        magicItemSelections: [
          {
            allowanceId: buildMagicItemAllowanceId({
              startingWealthTableId: standardStartingWealthTableId('srd-cc-5.2.1'),
              tierId: 'hero',
              rarity: 'common',
            }),
            equipmentId: equipmentStepPotionOfHealingFixture.id,
            quantity: 1,
          },
        ],
        removedPackageItemKeys: [],
        customized: false,
      },
    }

    const mixedViewModel = buildEquipmentAcquisitionPanelViewModel({
      draft: goldOptionDraft,
      context,
      catalogIndex: equipmentStepCatalogIndexFixture,
      equipment: equipmentStepPotionOfHealingFixture,
      rows: [],
      requestedQuantity: 2,
    })

    expect(mixedViewModel.nextAction.previewLines).toEqual(['Common choice · 1 copy for 50 GP'])
  })
})
