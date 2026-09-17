import { describe, expect, it } from 'vitest'

import { reincarnateSpeciesTableFixture } from '@rpg/contracts'
import { RICH_TEXT_TABLE_EMBED_ATTR } from '@rpg/ui'

import {
  formatSpellTableMetadata,
  pruneSpellTablesToDescriptionEmbeds,
} from './spell-description-tables.lib'

const orphanTable = { ...reincarnateSpeciesTableFixture, id: 'orphan-table' }

function embedHtml(tableId: string): string {
  return `<div ${RICH_TEXT_TABLE_EMBED_ATTR}="${tableId}"></div>`
}

describe('formatSpellTableMetadata', () => {
  it('delegates to the contracts general-table metadata formatter', () => {
    expect(formatSpellTableMetadata(reincarnateSpeciesTableFixture)).toBe('2 columns · 10 rows')
  })
})

describe('pruneSpellTablesToDescriptionEmbeds', () => {
  it('keeps only tables referenced from description embed ids', () => {
    const tables = [reincarnateSpeciesTableFixture, orphanTable]

    const pruned = pruneSpellTablesToDescriptionEmbeds(embedHtml('reincarnate-species'), tables)

    expect(pruned.map((table) => table.id)).toEqual(['reincarnate-species'])
  })

  it('returns an empty list when description has no embeds', () => {
    const pruned = pruneSpellTablesToDescriptionEmbeds('<p>No tables here.</p>', [
      reincarnateSpeciesTableFixture,
      orphanTable,
    ])

    expect(pruned).toEqual([])
  })

  it('keeps a table again when its embed reappears in description (redo path)', () => {
    const tables = [reincarnateSpeciesTableFixture]

    expect(pruneSpellTablesToDescriptionEmbeds('<p>Removed</p>', tables)).toEqual([])
    expect(pruneSpellTablesToDescriptionEmbeds(embedHtml('reincarnate-species'), tables)).toEqual(
      tables,
    )
  })

  it('persists only referenced ids when multiple tables exist but one embed remains', () => {
    const tableB = { ...reincarnateSpeciesTableFixture, id: 'table-b', name: 'Table B' }
    const tables = [reincarnateSpeciesTableFixture, tableB]

    const pruned = pruneSpellTablesToDescriptionEmbeds(embedHtml('table-b'), tables)

    expect(pruned.map((table) => table.id)).toEqual(['table-b'])
  })
})
