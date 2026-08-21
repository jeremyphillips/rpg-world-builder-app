import {
  copperToWealth,
  formatWealthAsGold,
  getMagicItemRarityLabel,
  resolveMagicItemAcquisitionState,
  type CharacterBuildCatalogIndex,
  type CharacterBuildContext,
  type CharacterBuilderDraft,
  type MagicItemRarity,
} from '@rpg/contracts'

type PurchaseSpendSnapshot = {
  quantity: number
  unitCostCp?: number
}

export function formatTotalPurchaseSpendFromSnapshots(
  purchases: readonly PurchaseSpendSnapshot[],
): string | undefined {
  let totalCp = 0
  let hasSnapshot = false

  for (const purchase of purchases) {
    if (purchase.unitCostCp === undefined) continue
    hasSnapshot = true
    totalCp += purchase.unitCostCp * purchase.quantity
  }

  if (!hasSnapshot || totalCp <= 0) return undefined
  return `${formatWealthAsGold(copperToWealth(totalCp))} spent`
}

export function resolveAllowanceRarity(args: {
  allowanceId: string
  draft: CharacterBuilderDraft
  context: CharacterBuildContext
  catalogIndex: CharacterBuildCatalogIndex
}): MagicItemRarity | undefined {
  const acquisition = resolveMagicItemAcquisitionState({
    draft: args.draft,
    context: args.context,
    catalogIndex: args.catalogIndex,
  })

  return acquisition.allowances.find((allowance) => allowance.id === args.allowanceId)?.rarity
}

export function formatGrantPreviewLine(grantQuantity: number, rarity: MagicItemRarity): string {
  const rarityLabel = getMagicItemRarityLabel(rarity)
  return grantQuantity === 1 ? `${rarityLabel} choice` : `${grantQuantity} ${rarityLabel} choices`
}

export function formatUsesGrantPreviewLine(grantQuantity: number, rarity: MagicItemRarity): string {
  const rarityLabel = getMagicItemRarityLabel(rarity)
  return grantQuantity === 1
    ? `Uses 1 ${rarityLabel} choice`
    : `Uses ${grantQuantity} ${rarityLabel} choices`
}
