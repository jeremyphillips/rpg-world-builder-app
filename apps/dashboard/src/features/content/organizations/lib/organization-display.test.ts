import { describe, expect, it } from 'vitest'

import { CITY_COUNCIL } from '../fixtures'
import {
  buildOrganizationDetailViewModel,
  formatConnectedCharactersCount,
  ORGANIZATION_EMPTY_SECTION_TEXT,
  type OrganizationConnectedCharactersViewModel,
  type OrganizationLocationConnectionsViewModel,
} from './organization-display'

const emptyConnectedCharacters: OrganizationConnectedCharactersViewModel = {
  previewItems: [],
  total: 0,
  emptyText: ORGANIZATION_EMPTY_SECTION_TEXT.connectedCharacters,
}

const emptyLocationConnections: OrganizationLocationConnectionsViewModel = {
  previewItems: [],
  total: 0,
  emptyText: ORGANIZATION_EMPTY_SECTION_TEXT.locationConnections,
}

describe('formatConnectedCharactersCount', () => {
  it('pluralizes connected character count copy', () => {
    expect(formatConnectedCharactersCount(1)).toBe('1 connected character')
    expect(formatConnectedCharactersCount(4)).toBe('4 connected characters')
  })
})

describe('buildOrganizationDetailViewModel', () => {
  it('maps kind vocabulary, authored description, and connected characters', () => {
    expect(
      buildOrganizationDetailViewModel(
        CITY_COUNCIL,
        emptyConnectedCharacters,
        emptyLocationConnections,
      ),
    ).toEqual({
      statRows: [
        {
          label: 'Type',
          value: 'Government',
          info: 'A kingdom, council, administration, or other governing body.',
          infoAriaLabel: 'About Government',
        },
      ],
      description: '<p>The elected council governing the city.</p>',
      connectedCharacters: emptyConnectedCharacters,
      locationConnections: emptyLocationConnections,
    })
  })
})
