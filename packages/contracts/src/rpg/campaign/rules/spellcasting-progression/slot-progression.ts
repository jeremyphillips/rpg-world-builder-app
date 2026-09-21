import { z } from 'zod'

import { absoluteLevelSchema } from '../../../primitives/level'
import { progressionExtensionSchema } from '../../../vocab/spell/progression-extension'

import { normalizeSlotCounts } from './lookup'
import { refineLeveledSlotRows, refinePactSlotRows } from './validation'

// ---------------------------------------------------------------------------
// Slot progression — leveled matrix or pact { slotCount, slotLevel } rows.
// ---------------------------------------------------------------------------

export const MAX_SPELL_SLOT_LEVEL = 9 as const

export const leveledSlotRowSchema = z.object({
  level: absoluteLevelSchema,
  slots: z.array(z.number().int().min(0)),
})

export type LeveledSlotRow = z.infer<typeof leveledSlotRowSchema>

export const pactSlotRowSchema = z.object({
  level: absoluteLevelSchema,
  slotCount: z.number().int().min(0),
  slotLevel: z.number().int().min(0).max(MAX_SPELL_SLOT_LEVEL),
})

export type PactSlotRow = z.infer<typeof pactSlotRowSchema>

const slotProgressionBaseSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  extension: progressionExtensionSchema.default('carryForward'),
})

export const leveledSlotProgressionSchema = slotProgressionBaseSchema
  .extend({
    kind: z.literal('leveled'),
    rows: z.array(leveledSlotRowSchema).min(1),
  })
  .superRefine((value, ctx) => {
    refineLeveledSlotRows(value.rows, ctx, ['rows'])
  })

export const pactSlotProgressionSchema = slotProgressionBaseSchema
  .extend({
    kind: z.literal('pact'),
    rows: z.array(pactSlotRowSchema).min(1),
  })
  .superRefine((value, ctx) => {
    refinePactSlotRows(value.rows, ctx, ['rows'])
  })

export const slotProgressionSchema = z.discriminatedUnion('kind', [
  leveledSlotProgressionSchema,
  pactSlotProgressionSchema,
])

export type SlotProgression = z.infer<typeof slotProgressionSchema>

/** Canonical storage shape — trailing zero slot columns removed. */
export function normalizeLeveledSlotRow(row: LeveledSlotRow): LeveledSlotRow {
  return { level: row.level, slots: normalizeSlotCounts(row.slots) }
}

export function normalizeSlotProgression<T extends SlotProgression>(progression: T): T {
  if (progression.kind === 'pact') return progression
  return {
    ...progression,
    rows: progression.rows.map(normalizeLeveledSlotRow),
  }
}

export function resolveMaxAuthoredSlotLevel(rows: readonly { level: number }[]): number {
  return rows.reduce((max, row) => Math.max(max, row.level), 0)
}
