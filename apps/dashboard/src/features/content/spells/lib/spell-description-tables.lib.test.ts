import { describe, expect, it } from 'vitest'

import { reincarnateSpeciesTableFixture } from '@rpg/contracts'

import { pruneSpellTablesToDescriptionEmbeds } from './spell-description-tables.lib'

describe('pruneSpellTablesToDescriptionEmbeds', () => {
  it('keeps only tables referenced from description embed ids', () => {
    const tables = [
      reincarnateSpeciesTableFixture,
      { ...reincarnateSpeciesTableFixture, id: 'orphan-table' },
    ]

    const pruned = pruneSpellTablesToDescriptionEmbeds(
      `<div data-rpg-table-id="reincarnate-species"></div>`,
      tables,
      ['reincarnate-species'],
    )

    expect(pruned.map((table) => table.id)).toEqual(['reincarnate-species'])
  })
})
