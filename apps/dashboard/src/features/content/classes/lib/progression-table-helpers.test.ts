import { describe, expect, it } from 'vitest'
import { loadSeedClasses } from '@rpg/catalog/classes'

import {
  progressionTableFromFormValues,
  progressionTableToFormValues,
  cantripProgressionsEquivalent,
  spellsAvailableProgressionsEquivalent,
} from './progression-table-helpers'

const SRD_CLASSES = loadSeedClasses('srd-cc-5.2.1')

describe('progressionTableToFormValues / progressionTableFromFormValues', () => {
  it('round-trips bard cantrips and spells available', () => {
    const bard = SRD_CLASSES.find((c) => c.slug === 'bard')!
    const table = progressionTableToFormValues(
      bard.spellcasting?.cantrips,
      bard.spellcasting?.spellsAvailable,
    )
    const restored = progressionTableFromFormValues(table)

    expect(cantripProgressionsEquivalent(restored.cantrips, bard.spellcasting?.cantrips)).toBe(true)
    expect(
      spellsAvailableProgressionsEquivalent(
        restored.spellsAvailable,
        bard.spellcasting?.spellsAvailable,
      ),
    ).toBe(true)
  })

  it('round-trips sorcerer cantrips and spells available', () => {
    const sorcerer = SRD_CLASSES.find((c) => c.slug === 'sorcerer')!
    const table = progressionTableToFormValues(
      sorcerer.spellcasting?.cantrips,
      sorcerer.spellcasting?.spellsAvailable,
    )
    const restored = progressionTableFromFormValues(table)

    expect(cantripProgressionsEquivalent(restored.cantrips, sorcerer.spellcasting?.cantrips)).toBe(
      true,
    )
    expect(
      spellsAvailableProgressionsEquivalent(
        restored.spellsAvailable,
        sorcerer.spellcasting?.spellsAvailable,
      ),
    ).toBe(true)
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
