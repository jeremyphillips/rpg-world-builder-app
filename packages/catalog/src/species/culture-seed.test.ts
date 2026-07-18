import { describe, expect, it } from 'vitest'
import { hasSpeciesCultureOverride } from '@rpg/contracts'

import { loadSeedSpecies } from './index'

describe('SRD species culture seeds', () => {
  const species = loadSeedSpecies('srd-cc-5.2.1')

  it('includes culture.naming on every species', () => {
    for (const entry of species) {
      expect(entry.culture?.naming, `${entry.slug} missing culture.naming`).toBeDefined()
    }
  })

  it('persists id/name override only for elf', () => {
    const overrides = species.filter((entry) =>
      hasSpeciesCultureOverride({ culture: entry.culture }),
    )
    expect(overrides.map((entry) => entry.slug)).toEqual(['elf'])
    expect(overrides[0]?.culture).toMatchObject({
      id: 'elven',
      name: 'Elven',
    })
  })

  it('never persists culture id equal to species slug', () => {
    for (const entry of species) {
      expect(entry.culture?.id).not.toBe(entry.slug)
    }
  })
})
