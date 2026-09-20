import { describe, expect, it } from 'vitest'

import {
  progressionTableFromFormValues,
  progressionTableToFormValues,
  cantripProgressionsEquivalent,
  spellsAvailableProgressionsEquivalent,
} from './progression-table-helpers'

describe('progressionTableToFormValues / progressionTableFromFormValues', () => {
  it('round-trips bard-like cantrips and spells available curves', () => {
    const cantrips = [
      { level: 1, known: 2 },
      { level: 4, known: 3 },
      { level: 10, known: 4 },
    ]
    const spellsAvailable = [
      { level: 1, count: 4 },
      { level: 20, count: 22 },
    ]
    const table = progressionTableToFormValues(cantrips, spellsAvailable)
    const restored = progressionTableFromFormValues(table)

    expect(cantripProgressionsEquivalent(restored.cantrips, cantrips)).toBe(true)
    expect(spellsAvailableProgressionsEquivalent(restored.spellsAvailable, spellsAvailable)).toBe(
      true,
    )
  })

  it('round-trips sorcerer-like cantrips and spells available curves', () => {
    const cantrips = [
      { level: 1, known: 4 },
      { level: 4, known: 5 },
    ]
    const spellsAvailable = [
      { level: 1, count: 2 },
      { level: 20, count: 22 },
    ]
    const table = progressionTableToFormValues(cantrips, spellsAvailable)
    const restored = progressionTableFromFormValues(table)

    expect(cantripProgressionsEquivalent(restored.cantrips, cantrips)).toBe(true)
    expect(spellsAvailableProgressionsEquivalent(restored.spellsAvailable, spellsAvailable)).toBe(
      true,
    )
  })

  it('compresses a flat dense column into a single entry', () => {
    const table = progressionTableToFormValues(undefined, undefined)
    table.cantrips = Array.from({ length: 20 }, () => 4)

    expect(progressionTableFromFormValues(table).cantrips).toEqual([{ level: 1, known: 4 }])
  })

  it('expands sparse entries with fill-forward for editing', () => {
    const table = progressionTableToFormValues(
      [
        { level: 1, known: 2 },
        { level: 4, known: 3 },
      ],
      undefined,
    )

    expect(table.cantrips.slice(0, 4)).toEqual([2, 2, 2, 3])
  })
})
