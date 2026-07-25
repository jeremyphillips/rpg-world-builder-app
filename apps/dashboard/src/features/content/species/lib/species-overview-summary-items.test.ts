import { describe, expect, it } from 'vitest'

import { pickSpecies } from '../../lib/fixtures/pick'
import { resolveTraitName } from '@rpg/contracts'
import { resolveSpeciesTraitSummaryItems } from './species-overview-summary-items'

describe('resolveSpeciesTraitSummaryItems', () => {
  it('maps species traits to collection items in authored order', () => {
    const species = pickSpecies('dwarf')

    expect(resolveSpeciesTraitSummaryItems(species)).toEqual(
      species.traits.map((trait) => ({
        id: trait.id,
        label: resolveTraitName(trait),
      })),
    )
  })
})
