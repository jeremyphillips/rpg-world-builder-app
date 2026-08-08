import { describe, expect, it } from 'vitest'

import {
  CHARACTER_LOCATION_CONNECTION_ENTRIES,
  CHARACTER_LOCATION_CONNECTION_KIND_IDS,
  getCharacterLocationConnectionDisplayLabel,
  getCharacterLocationConnectionLabel,
  type CharacterLocationConnectionKind,
} from './character-location-connection'
import {
  getOrganizationLocationConnectionDisplayLabel,
  getOrganizationLocationConnectionLabel,
  ORGANIZATION_LOCATION_CONNECTION_ENTRIES,
  ORGANIZATION_LOCATION_CONNECTION_KIND_IDS,
  type OrganizationLocationConnectionKind,
} from './organization-location-connection'

describe('organization location connection display labels', () => {
  it.each(ORGANIZATION_LOCATION_CONNECTION_KIND_IDS)(
    'resolves canonical, forward, and inverse labels for %s',
    (kind) => {
      const entry = ORGANIZATION_LOCATION_CONNECTION_ENTRIES[kind]

      expect(getOrganizationLocationConnectionLabel(kind)).toBe(entry.label)
      expect(getOrganizationLocationConnectionDisplayLabel(kind, 'forward')).toBe(
        'forwardLabel' in entry && entry.forwardLabel ? entry.forwardLabel : entry.label,
      )
      expect(getOrganizationLocationConnectionDisplayLabel(kind, 'inverse')).toBe(
        'inverseLabel' in entry && entry.inverseLabel ? entry.inverseLabel : entry.label,
      )
    },
  )

  it('falls back to the raw id for unknown kinds', () => {
    expect(getOrganizationLocationConnectionLabel('unknown-kind')).toBe('unknown-kind')
    expect(getOrganizationLocationConnectionDisplayLabel('unknown-kind', 'forward')).toBe(
      'unknown-kind',
    )
    expect(getOrganizationLocationConnectionDisplayLabel('unknown-kind', 'inverse')).toBe(
      'unknown-kind',
    )
  })

  it('covers forward-only, inverse-only, and canonical-both-ways categories', () => {
    const forwardOnly: OrganizationLocationConnectionKind = 'owns'
    expect(getOrganizationLocationConnectionLabel(forwardOnly)).toBe('Owner')
    expect(getOrganizationLocationConnectionDisplayLabel(forwardOnly, 'forward')).toBe('Owns')
    expect(getOrganizationLocationConnectionDisplayLabel(forwardOnly, 'inverse')).toBe('Owner')

    const inverseOnly: OrganizationLocationConnectionKind = 'operates_in'
    expect(getOrganizationLocationConnectionLabel(inverseOnly)).toBe('Operates in')
    expect(getOrganizationLocationConnectionDisplayLabel(inverseOnly, 'forward')).toBe(
      'Operates in',
    )
    expect(getOrganizationLocationConnectionDisplayLabel(inverseOnly, 'inverse')).toBe(
      'Operating here',
    )
  })
})

describe('character location connection display labels', () => {
  it.each(CHARACTER_LOCATION_CONNECTION_KIND_IDS)(
    'resolves canonical, forward, and inverse labels for %s',
    (kind) => {
      const entry = CHARACTER_LOCATION_CONNECTION_ENTRIES[kind]

      expect(getCharacterLocationConnectionLabel(kind)).toBe(entry.label)
      expect(getCharacterLocationConnectionDisplayLabel(kind, 'forward')).toBe(
        'forwardLabel' in entry && entry.forwardLabel ? entry.forwardLabel : entry.label,
      )
      expect(getCharacterLocationConnectionDisplayLabel(kind, 'inverse')).toBe(
        'inverseLabel' in entry && entry.inverseLabel ? entry.inverseLabel : entry.label,
      )
    },
  )

  it('falls back to the raw id for unknown kinds', () => {
    expect(getCharacterLocationConnectionLabel('unknown-kind')).toBe('unknown-kind')
    expect(getCharacterLocationConnectionDisplayLabel('unknown-kind', 'forward')).toBe(
      'unknown-kind',
    )
    expect(getCharacterLocationConnectionDisplayLabel('unknown-kind', 'inverse')).toBe(
      'unknown-kind',
    )
  })

  it('covers forward-only, inverse-only, and canonical-both-ways categories', () => {
    const forwardOnly: CharacterLocationConnectionKind = 'resides_at'
    expect(getCharacterLocationConnectionLabel(forwardOnly)).toBe('Resident')
    expect(getCharacterLocationConnectionDisplayLabel(forwardOnly, 'forward')).toBe('Resides at')
    expect(getCharacterLocationConnectionDisplayLabel(forwardOnly, 'inverse')).toBe('Resident')

    const inverseOnly: CharacterLocationConnectionKind = 'works_at'
    expect(getCharacterLocationConnectionLabel(inverseOnly)).toBe('Works at')
    expect(getCharacterLocationConnectionDisplayLabel(inverseOnly, 'forward')).toBe('Works at')
    expect(getCharacterLocationConnectionDisplayLabel(inverseOnly, 'inverse')).toBe('Works here')

    const bothWays: CharacterLocationConnectionKind = 'tenant'
    expect(getCharacterLocationConnectionLabel(bothWays)).toBe('Tenant')
    expect(getCharacterLocationConnectionDisplayLabel(bothWays, 'forward')).toBe('Tenant')
    expect(getCharacterLocationConnectionDisplayLabel(bothWays, 'inverse')).toBe('Tenant')
  })
})
