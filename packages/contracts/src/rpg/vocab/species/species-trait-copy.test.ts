import { describe, expect, it } from 'vitest'

import {
  getSpeciesTraitEmptySectionMessage,
  getSpeciesTraitSectionLabel,
} from './species-trait-copy'

describe('species trait copy', () => {
  it('derives section labels from the species content-type term', () => {
    expect(getSpeciesTraitSectionLabel()).toBe('Species traits')
    expect(getSpeciesTraitEmptySectionMessage()).toBe('No species traits.')
  })
})
