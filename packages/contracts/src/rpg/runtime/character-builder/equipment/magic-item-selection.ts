import { z } from 'zod'

import type { MagicItemRarity } from '../../../vocab/magic-item/rarity'

// ---------------------------------------------------------------------------
// Magic-item grant selections — canonical draft channel (composite key upsert).
// ---------------------------------------------------------------------------

export const magicItemGrantSelectionSchema = z.object({
  allowanceId: z.string().min(1),
  equipmentId: z.string().min(1),
  quantity: z.number().int().min(1),
})

export type MagicItemGrantSelection = z.infer<typeof magicItemGrantSelectionSchema>

/** Deterministic row id when a framework id is required. */
export function magicItemGrantSelectionId(selection: {
  allowanceId: string
  equipmentId: string
}): string {
  return `${selection.allowanceId}::${selection.equipmentId}`
}

export function magicItemGrantSelectionKey(selection: {
  allowanceId: string
  equipmentId: string
}): string {
  return magicItemGrantSelectionId(selection)
}

// ---------------------------------------------------------------------------
// Allowances — resolved from tier magicItemGrants at builder time.
// ---------------------------------------------------------------------------

export type MagicItemAllowanceSource = {
  kind: 'startingWealthTier'
  sourceId: string
  tierId: string
}

export type MagicItemAllowanceRequirement = 'exact' | 'up_to'

export type MagicItemAllowance = {
  id: string
  source: MagicItemAllowanceSource
  rarity: MagicItemRarity
  count: number
  requirement: MagicItemAllowanceRequirement
}

export function buildMagicItemAllowanceId(args: {
  startingWealthTableId: string
  tierId: string
  rarity: MagicItemRarity
}): string {
  return `startingWealthTier:${args.startingWealthTableId}:${args.tierId}:${args.rarity}`
}

// ---------------------------------------------------------------------------
// Progress vs readiness
// ---------------------------------------------------------------------------

export type MagicItemGrantProgress = {
  allowanceId: string
  rarity: MagicItemRarity
  capacity: number
  selected: number
  remainingCapacity: number
  isFilled: boolean
}

export type MagicItemGrantReadinessIssue = {
  allowanceId: string
  rarity: MagicItemRarity
  remaining: number
}

export type MagicItemGrantReadiness = {
  complete: boolean
  issues: MagicItemGrantReadinessIssue[]
}

// ---------------------------------------------------------------------------
// Eligibility
// ---------------------------------------------------------------------------

export type MagicItemAllowanceEligibility =
  | { eligible: true }
  | {
      eligible: false
      reason: 'not_magic_item' | 'rarity_mismatch' | 'allowance_full'
    }

// ---------------------------------------------------------------------------
// Selection issues — reported by resolvers; never auto-mutated.
// ---------------------------------------------------------------------------

export type MagicItemSelectionIssue =
  | { code: 'allowance_missing'; allowanceId: string; equipmentId: string }
  | { code: 'equipment_missing'; allowanceId: string; equipmentId: string }
  | { code: 'not_magic_item'; allowanceId: string; equipmentId: string }
  | { code: 'rarity_mismatch'; allowanceId: string; equipmentId: string }
  | { code: 'allowance_overfilled'; allowanceId: string }
  | { code: 'duplicate_not_allowed'; allowanceId: string; equipmentId: string }
