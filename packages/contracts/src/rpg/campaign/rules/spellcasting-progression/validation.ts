import type { z } from 'zod'

import { spellcastingProgressionValidationMessages } from './messages'
import type { LeveledSlotRow, PactSlotRow } from './slot-progression'
import { MAX_SPELL_SLOT_LEVEL } from './slot-progression'
import { normalizeSlotCounts } from './lookup'

function highestUnlockedSlotLevel(slots: readonly number[]): number {
  let highest = 0
  for (let index = 0; index < slots.length; index += 1) {
    if ((slots[index] ?? 0) > 0) highest = index + 1
  }
  return highest
}

export function refineLeveledSlotRows(
  rows: readonly LeveledSlotRow[],
  ctx: z.RefinementCtx,
  pathPrefix: (string | number)[] = [],
): void {
  const seen = new Set<number>()
  let previousRow: LeveledSlotRow | undefined

  rows.forEach((row, index) => {
    const rowPath = [...pathPrefix, index]

    if (seen.has(row.level)) {
      ctx.addIssue({
        code: 'custom',
        message: spellcastingProgressionValidationMessages.duplicateSlotLevel({ level: row.level }),
        path: [...rowPath, 'level'],
      })
    }
    seen.add(row.level)

    const slots = normalizeSlotCounts(row.slots)
    const currentHighest = highestUnlockedSlotLevel(slots)

    if (previousRow) {
      const previousSlots = normalizeSlotCounts(previousRow.slots)
      const previousHighest = highestUnlockedSlotLevel(previousSlots)

      if (currentHighest < previousHighest) {
        ctx.addIssue({
          code: 'custom',
          message: spellcastingProgressionValidationMessages.slotLevelDecreased({
            level: row.level,
            previous: previousHighest,
            next: currentHighest,
          }),
          path: [...rowPath, 'slots'],
        })
      }

      for (let slotLevel = 1; slotLevel <= MAX_SPELL_SLOT_LEVEL; slotLevel += 1) {
        const previousCount = previousSlots[slotLevel - 1] ?? 0
        const currentCount = slots[slotLevel - 1] ?? 0
        if (currentCount < previousCount) {
          ctx.addIssue({
            code: 'custom',
            message: spellcastingProgressionValidationMessages.slotCountDecreased({
              level: row.level,
              slotLevel,
              previous: previousCount,
              next: currentCount,
            }),
            path: [...rowPath, 'slots'],
          })
        }
      }

      if (currentHighest > previousHighest + 1) {
        ctx.addIssue({
          code: 'custom',
          message: spellcastingProgressionValidationMessages.slotLevelSkipped({
            level: row.level,
            slotLevel: previousHighest + 1,
          }),
          path: [...rowPath, 'slots'],
        })
      }
    }

    previousRow = row
  })
}

export function refinePactSlotRows(
  rows: readonly PactSlotRow[],
  ctx: z.RefinementCtx,
  pathPrefix: (string | number)[] = [],
): void {
  const seen = new Set<number>()
  let previousRow: PactSlotRow | undefined

  rows.forEach((row, index) => {
    const rowPath = [...pathPrefix, index]

    if (seen.has(row.level)) {
      ctx.addIssue({
        code: 'custom',
        message: spellcastingProgressionValidationMessages.duplicateSlotLevel({ level: row.level }),
        path: [...rowPath, 'level'],
      })
    }
    seen.add(row.level)

    if (previousRow) {
      if (row.slotLevel < previousRow.slotLevel) {
        ctx.addIssue({
          code: 'custom',
          message: spellcastingProgressionValidationMessages.slotLevelDecreased({
            level: row.level,
            previous: previousRow.slotLevel,
            next: row.slotLevel,
          }),
          path: [...rowPath, 'slotLevel'],
        })
      }

      if (row.slotLevel > previousRow.slotLevel + 1) {
        ctx.addIssue({
          code: 'custom',
          message: spellcastingProgressionValidationMessages.slotLevelSkipped({
            level: row.level,
            slotLevel: previousRow.slotLevel + 1,
          }),
          path: [...rowPath, 'slotLevel'],
        })
      }

      if (row.slotCount < previousRow.slotCount && row.slotLevel === previousRow.slotLevel) {
        ctx.addIssue({
          code: 'custom',
          message: spellcastingProgressionValidationMessages.pactSlotCountDecreased({
            level: row.level,
            previous: previousRow.slotCount,
            next: row.slotCount,
          }),
          path: [...rowPath, 'slotCount'],
        })
      }
    }

    previousRow = row
  })
}
