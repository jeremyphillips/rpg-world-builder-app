import { describe, expect, it } from 'vitest'

import {
  formatChangeSpeciesHeritageLabel,
  getSpeciesHeritageKindLabel,
  getSpeciesHeritageLabel,
  getSpeciesHeritageOptionsLabel,
} from './heritage'

describe('species heritage vocab', () => {
  it('exposes heritage labels for authoring and builder copy', () => {
    expect(getSpeciesHeritageLabel()).toBe('Heritage')
    expect(getSpeciesHeritageOptionsLabel()).toBe('Heritage options')
    expect(formatChangeSpeciesHeritageLabel()).toBe('Change heritage')
    expect(getSpeciesHeritageKindLabel()).toBe('Heritage')
  })
})
