import { describe, expect, it } from 'vitest'

import {
  inferLocalSpeciesId,
  inferLocalSpeciesSlug,
  readDndBeyondSpeciesLabel,
} from './dnd-beyond-species-mapping'

describe('dnd-beyond-species-mapping', () => {
  const humanRace = {
    isSubRace: false,
    baseRaceName: 'Human',
    entityRaceId: 1751441,
    fullName: 'Human',
    baseName: 'Human',
    slug: '1751441-human',
  }

  it('reads species label from data.race', () => {
    expect(readDndBeyondSpeciesLabel(humanRace)).toBe('Human')
  })

  it('infers local species slug from D&D Beyond race slug', () => {
    expect(inferLocalSpeciesSlug(humanRace)).toBe('human')
    expect(inferLocalSpeciesId(humanRace)).toBe('srd-cc-5.2.1:human')
  })
})
