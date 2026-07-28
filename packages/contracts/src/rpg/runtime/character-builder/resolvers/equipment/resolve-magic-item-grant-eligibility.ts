import { resolveStartingWealthTierForBuilder } from '../../../../campaign/rules/starting-wealth'
import type { Equipment } from '../../../../content/equipment'
import type { MagicItemAllowance } from '../../equipment/magic-item-selection'
import type { MagicItemGrantProgress } from '../../equipment/magic-item-selection'
import type { CharacterBuilderDraft } from '../../draft/draft'
import { getBuilderSelectedStartingLevel } from '../../progression/builder-level'
import type {
  EquipmentAcquisitionBuilderContext,
  MagicItemGrantEligibility,
} from './equipment-acquisition-types'
import { resolveMagicItemGrantAllowances } from './resolve-magic-item-grant-allowances'
import {
  matchingAllowancesForRarity,
  readMagicItemSelections,
  resolveMagicItemAllowanceEligibility,
  resolveMagicItemGrantProgressList,
} from './resolve-magic-item-grant-progress'

function defaultProgressForAllowance(allowance: MagicItemAllowance): MagicItemGrantProgress {
  return {
    allowanceId: allowance.id,
    rarity: allowance.rarity,
    capacity: allowance.count,
    selected: 0,
    remainingCapacity: allowance.count,
    isFilled: false,
  }
}

function resolveScopedAllowances(args: {
  draft: CharacterBuilderDraft
  context: EquipmentAcquisitionBuilderContext
  rarity: NonNullable<Extract<Equipment, { kind: 'magic_item' }>['rarity']>
  focusedAllowanceId?: string
}) {
  const startingLevel = getBuilderSelectedStartingLevel(args.draft)
  const tier = resolveStartingWealthTierForBuilder(args.context.startingWealth, startingLevel)
  if (!tier) return []

  const allowances = resolveMagicItemGrantAllowances({
    startingWealthTableId: args.context.startingWealthTableId,
    tier,
  })

  if (args.focusedAllowanceId) {
    return allowances.filter((entry) => entry.id === args.focusedAllowanceId)
  }

  return matchingAllowancesForRarity(allowances, args.rarity)
}

export function resolveMagicItemGrantEligibility(args: {
  equipment: Equipment
  draft: CharacterBuilderDraft
  context: EquipmentAcquisitionBuilderContext
  focusedAllowanceId?: string
}): MagicItemGrantEligibility {
  const { equipment } = args

  if (equipment.kind !== 'magic_item' || !equipment.rarity) {
    return { eligible: false, reason: 'not_magic_item' }
  }

  const scopedAllowances = resolveScopedAllowances({
    draft: args.draft,
    context: args.context,
    rarity: equipment.rarity,
    focusedAllowanceId: args.focusedAllowanceId,
  })
  if (scopedAllowances.length === 0) {
    return { eligible: false, reason: 'rarity_mismatch' }
  }

  const selections = readMagicItemSelections(args.draft)
  const progress = resolveMagicItemGrantProgressList({
    allowances: scopedAllowances,
    selections,
  })
  const progressById = new Map(progress.map((entry) => [entry.allowanceId, entry]))

  for (const allowance of scopedAllowances) {
    const entry = progressById.get(allowance.id) ?? defaultProgressForAllowance(allowance)
    const eligibility = resolveMagicItemAllowanceEligibility({
      equipment,
      allowance,
      progress: entry,
    })
    if (eligibility.eligible) {
      return { eligible: true, allowanceId: allowance.id }
    }
  }

  return { eligible: false, reason: 'allowance_full' }
}
