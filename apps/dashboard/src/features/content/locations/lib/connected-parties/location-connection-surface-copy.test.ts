import { describe, expect, it } from 'vitest'

import {
  DEFAULT_LOCATION_INVERSE_CHARACTER_TARGET_PRESENTATION,
  DEFAULT_LOCATION_INVERSE_ORGANIZATION_TARGET_PRESENTATION,
  LOCATION_INVERSE_ORGANIZATION_DRAWER,
  TERRITORIAL_AUTHORITY_DRAWER,
  isTerritorialAuthorityKind,
  resolveLocationInverseCharacterTargetPresentation,
  resolveLocationInverseOrganizationReplaceHelper,
  resolveLocationInverseOrganizationTargetPresentation,
} from './location-connection-surface-copy'

describe('location-connection-surface-copy inverse target presentation', () => {
  it('resolves generic organization defaults for site and presence kinds', () => {
    expect(resolveLocationInverseOrganizationTargetPresentation('headquarters')).toEqual(
      DEFAULT_LOCATION_INVERSE_ORGANIZATION_TARGET_PRESENTATION,
    )
    expect(resolveLocationInverseOrganizationTargetPresentation('operates_in')).toEqual(
      DEFAULT_LOCATION_INVERSE_ORGANIZATION_TARGET_PRESENTATION,
    )
    expect(resolveLocationInverseOrganizationTargetPresentation(null)).toEqual(
      DEFAULT_LOCATION_INVERSE_ORGANIZATION_TARGET_PRESENTATION,
    )
  })

  it('uses territorial organization search placeholder only for territorial authority kinds', () => {
    expect(resolveLocationInverseOrganizationTargetPresentation('governs')).toEqual({
      targetLabel: 'Organization',
      searchPlaceholder: TERRITORIAL_AUTHORITY_DRAWER.organizationSearchPlaceholder,
    })
    expect(resolveLocationInverseOrganizationTargetPresentation('controls')).toEqual({
      targetLabel: 'Organization',
      searchPlaceholder: TERRITORIAL_AUTHORITY_DRAWER.organizationSearchPlaceholder,
    })
    expect(resolveLocationInverseOrganizationTargetPresentation('claims')).toEqual({
      targetLabel: 'Organization',
      searchPlaceholder: TERRITORIAL_AUTHORITY_DRAWER.organizationSearchPlaceholder,
    })
  })

  it('resolves character target presentation independently of kind', () => {
    expect(resolveLocationInverseCharacterTargetPresentation('works_at')).toEqual(
      DEFAULT_LOCATION_INVERSE_CHARACTER_TARGET_PRESENTATION,
    )
    expect(resolveLocationInverseCharacterTargetPresentation(undefined)).toEqual(
      DEFAULT_LOCATION_INVERSE_CHARACTER_TARGET_PRESENTATION,
    )
  })
})

describe('location-connection-surface-copy inverse replace helper', () => {
  it('routes territorial authority kinds to the territorial replace helper', () => {
    for (const kind of ['governs', 'controls', 'claims'] as const) {
      expect(isTerritorialAuthorityKind(kind)).toBe(true)
      expect(resolveLocationInverseOrganizationReplaceHelper(kind)).toBe(
        TERRITORIAL_AUTHORITY_DRAWER.replaceHelper,
      )
    }
  })

  it('routes site and presence kinds to the generic inverse organization replace helper', () => {
    for (const kind of ['headquarters', 'owns', 'operates_in', 'tenant', 'operator'] as const) {
      expect(isTerritorialAuthorityKind(kind)).toBe(false)
      expect(resolveLocationInverseOrganizationReplaceHelper(kind)).toBe(
        LOCATION_INVERSE_ORGANIZATION_DRAWER.replaceHelper,
      )
    }
  })
})
