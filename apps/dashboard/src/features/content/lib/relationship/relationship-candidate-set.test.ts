import { describe, expect, it } from 'vitest'

import { resolveCatalogMutationAvailability } from './relationship-candidate-set'

describe('resolveCatalogMutationAvailability', () => {
  it('returns unavailable when unsupported', () => {
    expect(
      resolveCatalogMutationAvailability({
        supported: false,
        matchCount: 1,
        isAuthoritativeDomainSet: true,
      }),
    ).toEqual({ supported: false, availability: 'unavailable' })
  })

  it('returns available when a valid alternative exists regardless of domain authority', () => {
    expect(
      resolveCatalogMutationAvailability({
        supported: true,
        matchCount: 2,
        isAuthoritativeDomainSet: false,
      }),
    ).toEqual({ supported: true, availability: 'available' })
  })

  it('returns unavailable when authoritative domain set has no matches', () => {
    expect(
      resolveCatalogMutationAvailability({
        supported: true,
        matchCount: 0,
        isAuthoritativeDomainSet: true,
      }),
    ).toEqual({ supported: true, availability: 'unavailable' })
  })

  it('returns unknown when partial domain set has no local matches', () => {
    expect(
      resolveCatalogMutationAvailability({
        supported: true,
        matchCount: 0,
        isAuthoritativeDomainSet: false,
      }),
    ).toEqual({ supported: true, availability: 'unknown' })
  })

  it('returns unknown with isResolving when prerequisite data is loading', () => {
    expect(
      resolveCatalogMutationAvailability({
        supported: true,
        matchCount: 0,
        isAuthoritativeDomainSet: true,
        prerequisiteUnknown: true,
      }),
    ).toEqual({ supported: true, availability: 'unknown', isResolving: true })
  })
})
