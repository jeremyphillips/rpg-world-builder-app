import {
  resolveStartingWealthTierForBuilder,
  standardStartingWealthTableId,
} from '../../../../campaign/rules/starting-wealth'
import { wealthToCopper } from '../../../../primitives/wealth'
import type { CharacterBuildCatalogIndex, CharacterBuildContext } from '../../context'
import type { CharacterBuilderDraft } from '../../draft'
import { getBuilderSelectedStartingLevel } from '../../builder-level'
import { deriveEquipmentBudgetSummary } from './equipment-budget'
import type { ResolvedMagicItemAcquisitionState } from './equipment-acquisition-types'
import { resolveMagicItemGrantAllowances } from './resolve-magic-item-grant-allowances'
import {
  readMagicItemSelections,
  resolveMagicItemGrantProgressList,
} from './resolve-magic-item-grant-progress'

export function resolveMagicItemAcquisitionState(args: {
  draft: CharacterBuilderDraft
  context: Pick<CharacterBuildContext, 'rulesetId' | 'characterCreationRules'>
  catalogIndex: CharacterBuildCatalogIndex
}): ResolvedMagicItemAcquisitionState {
  const { draft, context, catalogIndex } = args
  const startingWealth = context.characterCreationRules.startingWealth
  const startingLevel = getBuilderSelectedStartingLevel(draft)
  const tier = resolveStartingWealthTierForBuilder(startingWealth, startingLevel)
  const startingWealthTableId = standardStartingWealthTableId(context.rulesetId)

  const allowances = tier ? resolveMagicItemGrantAllowances({ startingWealthTableId, tier }) : []

  const selections = readMagicItemSelections(draft)
  const progress = resolveMagicItemGrantProgressList({ allowances, selections })
  const budget = deriveEquipmentBudgetSummary(draft, catalogIndex, { startingWealth })

  return { allowances, progress, budget }
}

export function hasMagicItemGrantAllowances(state: ResolvedMagicItemAcquisitionState): boolean {
  return state.allowances.length > 0
}

export function hasPurchasingWealth(budget: ResolvedMagicItemAcquisitionState['budget']): boolean {
  if (!budget) return false
  return wealthToCopper(budget.starting) > 0
}
