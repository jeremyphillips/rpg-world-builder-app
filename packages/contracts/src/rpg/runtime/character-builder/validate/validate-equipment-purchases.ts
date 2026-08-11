import { formatFieldMessage } from '../../../../validation/define-message'
import { wealthToCopper } from '../../../primitives/wealth'
import { indexCharacterBuildCatalog, type CharacterBuildContext } from '../context'
import type { CharacterBuilderDraft } from '../draft/draft'
import { characterBuilderValidationMessages } from '../messages/character-builder-messages'
import { deriveEquipmentBudgetSummary } from '../resolvers/equipment/equipment-budget'
import { resolveEquipmentPurchaseAvailability } from '../resolvers/equipment/resolve-equipment-purchase-availability'

import { validationIssue } from './issue'
import type { CharacterBuildValidationIssue } from './types'

export const EQUIPMENT_PURCHASE_INVALID_ITEM_CODE = 'equipment_purchase_invalid_item'
export const EQUIPMENT_PURCHASE_INVALID_QUANTITY_CODE = 'equipment_purchase_invalid_quantity'
export const EQUIPMENT_PURCHASE_OVER_BUDGET_CODE = 'equipment_purchase_over_budget'

function purchasePath(index: number, purchaseId?: string): string {
  return purchaseId ? `equipment.purchases.${purchaseId}` : `equipment.purchases.${index}`
}

/** finalSubmit-only — validates draft purchase rows via canonical purchase policy and budget summary. */
export function validateEquipmentPurchases(
  draft: CharacterBuilderDraft,
  context: CharacterBuildContext,
): CharacterBuildValidationIssue[] {
  const purchases = draft.equipment?.purchases ?? []
  if (purchases.length === 0) return []

  const catalogIndex = indexCharacterBuildCatalog(context.catalog)
  const budget = deriveEquipmentBudgetSummary(draft, catalogIndex, {
    startingWealth: context.characterCreationRules.startingWealth,
  })

  const issues: CharacterBuildValidationIssue[] = []

  for (const [index, purchase] of purchases.entries()) {
    const path = purchasePath(index, purchase.id)

    if (!Number.isInteger(purchase.quantity) || purchase.quantity < 1) {
      issues.push(
        validationIssue(
          EQUIPMENT_PURCHASE_INVALID_QUANTITY_CODE,
          formatFieldMessage(characterBuilderValidationMessages.equipmentPurchaseInvalidQuantity()),
          { path, stepId: 'equipment' },
        ),
      )
      continue
    }

    const equipment = catalogIndex.equipment.get(purchase.equipmentId)
    if (!equipment) {
      issues.push(
        validationIssue(
          EQUIPMENT_PURCHASE_INVALID_ITEM_CODE,
          formatFieldMessage(characterBuilderValidationMessages.equipmentPurchaseInvalidItem()),
          { path, stepId: 'equipment' },
        ),
      )
      continue
    }

    const availability = resolveEquipmentPurchaseAvailability({
      equipment,
      budget,
      requestedQuantity: purchase.quantity,
    })

    if (availability.status === 'unavailable') {
      issues.push(
        validationIssue(
          EQUIPMENT_PURCHASE_INVALID_ITEM_CODE,
          formatFieldMessage(characterBuilderValidationMessages.equipmentPurchaseInvalidItem()),
          { path, stepId: 'equipment' },
        ),
      )
    }
  }

  if (budget && wealthToCopper(budget.spent) > wealthToCopper(budget.starting)) {
    issues.push(
      validationIssue(
        EQUIPMENT_PURCHASE_OVER_BUDGET_CODE,
        formatFieldMessage(characterBuilderValidationMessages.equipmentPurchaseOverBudget()),
        { path: 'equipment.purchases', stepId: 'equipment' },
      ),
    )
  }

  return issues
}
