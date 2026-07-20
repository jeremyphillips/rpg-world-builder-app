import type { Equipment } from '../../../../content/equipment'
import type { CharacterBuilderDraft } from '../../draft'
import {
  mergeCompatiblePurchasedEntries,
  normalizeEquipmentPurchase,
} from '../../equipment-purchase'
import type {
  ApplyEquipmentIntentResult,
  EquipmentAcquisitionBuilderContext,
} from './equipment-acquisition-types'
import {
  resolveEquipmentAcquisitionPlan,
  resolveEquipmentPurchasePlan,
} from './resolve-equipment-acquisition-plan'
import { applyGrantAllocationsToSelections } from './reconcile-magic-item-selections'
import { readMagicItemSelections } from './resolve-magic-item-grant-progress'
import { cloneEquipmentDraftChannel } from './equipment-draft-base'

function upsertPurchaseQuantity(args: {
  draft: CharacterBuilderDraft
  equipment: Equipment
  quantity: number
}): CharacterBuilderDraftEquipmentPurchases {
  const { draft, equipment, quantity } = args
  const purchases = (draft.equipment?.purchases ?? []).map((_, index) =>
    normalizeEquipmentPurchase(draft.equipment!.purchases, index),
  )

  return mergeCompatiblePurchasedEntries({
    purchases,
    incoming: {
      equipmentId: equipment.id,
      quantity,
      sourceMode: 'startingGold',
      origin: 'picker',
    },
    equipment,
  })
}

type CharacterBuilderDraftEquipmentPurchases = NonNullable<
  CharacterBuilderDraft['equipment']
>['purchases']

export function applyEquipmentPurchaseIntent(args: {
  draft: CharacterBuilderDraft
  context: EquipmentAcquisitionBuilderContext
  equipment: Equipment
  requestedQuantity: number
}): ApplyEquipmentIntentResult {
  const { draft, context, equipment, requestedQuantity } = args
  const plan = resolveEquipmentPurchasePlan({ draft, context, equipment, requestedQuantity })

  if (!plan.canApplyRequestedQuantity) {
    return { draft, plan, applied: false }
  }

  const purchases = upsertPurchaseQuantity({
    draft,
    equipment,
    quantity: plan.purchaseQuantity,
  })

  return {
    draft: {
      ...draft,
      equipment: cloneEquipmentDraftChannel(draft, {
        mode: 'gold',
        purchases,
        skipped: false,
      }),
    },
    plan,
    applied: true,
  }
}

export function applyMagicItemAcquisitionIntent(args: {
  draft: CharacterBuilderDraft
  context: EquipmentAcquisitionBuilderContext
  equipment: Equipment
  requestedQuantity: number
}): ApplyEquipmentIntentResult {
  const { draft, context, equipment, requestedQuantity } = args
  const plan = resolveEquipmentAcquisitionPlan({ draft, context, equipment, requestedQuantity })

  if (!plan.canApplyRequestedQuantity) {
    return { draft, plan, applied: false }
  }

  let magicItemSelections = readMagicItemSelections(draft)

  if (plan.grantAllocations.length > 0) {
    magicItemSelections = applyGrantAllocationsToSelections({
      selections: magicItemSelections,
      equipmentId: equipment.id,
      grantAllocations: plan.grantAllocations,
    })
  }

  let purchases = draft.equipment?.purchases ?? []
  if (plan.purchaseQuantity > 0) {
    purchases = upsertPurchaseQuantity({
      draft,
      equipment,
      quantity: plan.purchaseQuantity,
    })
  }

  return {
    draft: {
      ...draft,
      equipment: cloneEquipmentDraftChannel(draft, {
        purchases,
        magicItemSelections,
        skipped: false,
      }),
    },
    plan,
    applied: true,
  }
}

export function resolveEquipmentAcquisitionBuilderContext(args: {
  context: {
    rulesetId: EquipmentAcquisitionBuilderContext['rulesetId']
    characterCreationRules: { startingWealth: EquipmentAcquisitionBuilderContext['startingWealth'] }
    catalog: { equipment: Equipment[] }
  }
  catalogIndex: EquipmentAcquisitionBuilderContext['catalogIndex']
  startingWealthTableId: string
}): EquipmentAcquisitionBuilderContext {
  return {
    catalogIndex: args.catalogIndex,
    rulesetId: args.context.rulesetId,
    startingWealthTableId: args.startingWealthTableId,
    startingWealth: args.context.characterCreationRules.startingWealth,
  }
}
