import { describe, expect, it } from 'vitest'

import {
  getCantripLevelLabel,
  getSpellCollectionKindChoicePlaceholder,
  getSpellCollectionKindLabel,
  getSpellCollectionKindSentenceForm,
} from './spell-collection-kind'

describe('spell-collection-kind', () => {
  it('exposes collection labels and counted forms for cantrips', () => {
    expect(getSpellCollectionKindLabel('cantrips')).toBe('Cantrips')
    expect(getSpellCollectionKindSentenceForm('cantrips', 1)).toBe('cantrip')
    expect(getSpellCollectionKindSentenceForm('cantrips', 2)).toBe('cantrips')
    expect(getCantripLevelLabel()).toBe('Cantrip')
  })

  it('builds cantrip choice placeholders from sentence forms', () => {
    expect(getSpellCollectionKindChoicePlaceholder('cantrips', true)).toBe('Choose cantrips…')
  })
})
