import type { ProgressionExtension } from '../../../vocab/spell/progression-extension'

import { expandSlotCountsForDisplay, normalizeSlotCounts } from './lookup'
import type { LeveledSlotRow, PactSlotRow, SlotProgression } from './slot-progression'
import { MAX_SPELL_SLOT_LEVEL, resolveMaxAuthoredSlotLevel } from './slot-progression'

export type SlotRowProvenance = 'authored' | 'derived' | 'unresolved'

export type ResolvedLeveledSlotRow = {
  kind: 'leveled'
  slots: number[]
  provenance: SlotRowProvenance
}

export type ResolvedPactSlotRow = {
  kind: 'pact'
  slotCount: number
  slotLevel: number
  provenance: SlotRowProvenance
}

export type ResolvedSlotRow = ResolvedLeveledSlotRow | ResolvedPactSlotRow

function resolveLeveledRowWithinRange(
  rows: readonly LeveledSlotRow[],
  level: number,
): ResolvedLeveledSlotRow {
  const exact = rows.find((row) => row.level === level)
  if (exact) {
    return {
      kind: 'leveled',
      slots: normalizeSlotCounts(exact.slots),
      provenance: 'authored',
    }
  }

  let carry: LeveledSlotRow | undefined
  for (const row of [...rows].sort((left, right) => left.level - right.level)) {
    if (row.level <= level) carry = row
  }

  return {
    kind: 'leveled',
    slots: normalizeSlotCounts(carry?.slots ?? []),
    provenance: carry ? 'derived' : 'derived',
  }
}

function resolvePactRowWithinRange(
  rows: readonly PactSlotRow[],
  level: number,
): ResolvedPactSlotRow {
  const exact = rows.find((row) => row.level === level)
  if (exact) {
    return {
      kind: 'pact',
      slotCount: exact.slotCount,
      slotLevel: exact.slotLevel,
      provenance: 'authored',
    }
  }

  let carry: PactSlotRow | undefined
  for (const row of [...rows].sort((left, right) => left.level - right.level)) {
    if (row.level <= level) carry = row
  }

  return {
    kind: 'pact',
    slotCount: carry?.slotCount ?? 0,
    slotLevel: carry?.slotLevel ?? 0,
    provenance: carry ? 'derived' : 'derived',
  }
}

function resolveBeyondAuthoredSlotRow(input: {
  progression: SlotProgression
  level: number
  maxAuthored: number
}): ResolvedSlotRow {
  if (input.progression.extension === 'explicit') {
    return input.progression.kind === 'pact'
      ? { kind: 'pact', slotCount: 0, slotLevel: 0, provenance: 'unresolved' }
      : { kind: 'leveled', slots: [], provenance: 'unresolved' }
  }

  if (input.progression.extension === 'zero') {
    return input.progression.kind === 'pact'
      ? { kind: 'pact', slotCount: 0, slotLevel: 0, provenance: 'derived' }
      : { kind: 'leveled', slots: [], provenance: 'derived' }
  }

  const anchorLevel = input.maxAuthored
  if (input.progression.kind === 'pact') {
    const anchor = resolvePactRowWithinRange(input.progression.rows, anchorLevel)
    return { ...anchor, provenance: 'derived' }
  }

  const anchor = resolveLeveledRowWithinRange(input.progression.rows, anchorLevel)
  return { ...anchor, provenance: 'derived' }
}

/** Resolve slot row for a character level from a slot progression record. */
export function resolveSlotRowAtLevel(
  progression: SlotProgression,
  level: number,
): ResolvedSlotRow {
  const maxAuthored = resolveMaxAuthoredSlotLevel(progression.rows)
  if (maxAuthored === 0) {
    return resolveBeyondAuthoredSlotRow({ progression, level, maxAuthored })
  }

  if (level <= maxAuthored) {
    return progression.kind === 'pact'
      ? resolvePactRowWithinRange(progression.rows, level)
      : resolveLeveledRowWithinRange(progression.rows, level)
  }

  return resolveBeyondAuthoredSlotRow({ progression, level, maxAuthored })
}

/** Legacy-compatible leveled slot counts for derivation and pickers. */
export function resolveLeveledSlotCountsAtLevel(
  progression: SlotProgression,
  level: number,
): { slots: number[]; provenance: SlotRowProvenance } {
  const resolved = resolveSlotRowAtLevel(progression, level)
  if (resolved.kind === 'pact') {
    const slots = Array.from({ length: MAX_SPELL_SLOT_LEVEL }, () => 0)
    if (resolved.slotCount > 0 && resolved.slotLevel > 0) {
      slots[resolved.slotLevel - 1] = resolved.slotCount
    }
    return { slots, provenance: resolved.provenance }
  }
  return { slots: resolved.slots, provenance: resolved.provenance }
}

/** Highest spell level with at least one slot at the given character level. */
export function maxSelectableSpellLevelFromSlotProgression(
  progression: SlotProgression,
  level: number,
): number {
  const { slots } = resolveLeveledSlotCountsAtLevel(progression, level)
  let maxLevel = 0
  for (let index = 0; index < slots.length; index += 1) {
    if ((slots[index] ?? 0) > 0) maxLevel = index + 1
  }
  return maxLevel
}

/** Display-width slot row (1st through 9th columns). */
export function resolveDisplaySlotRowAtLevel(
  progression: SlotProgression,
  level: number,
  width: number = MAX_SPELL_SLOT_LEVEL,
): readonly number[] {
  const { slots } = resolveLeveledSlotCountsAtLevel(progression, level)
  return expandSlotCountsForDisplay(slots, width)
}

/** Feature-table label derived from slot progression kind. */
export function spellcastingFeatureLabelForSlotProgression(progression: SlotProgression): string {
  return progression.kind === 'pact' ? 'Pact Magic' : 'Spellcasting'
}

export type { ProgressionExtension }
