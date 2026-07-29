import { describe, expect, it } from 'vitest'

import { CITY_COUNCIL } from '../fixtures'
import {
  buildOrganizationDetailViewModel,
  ORGANIZATION_EMPTY_SECTION_TEXT,
  type OrganizationConnectedCharactersViewModel,
} from './organization-display'

const emptyConnectedCharacters: OrganizationConnectedCharactersViewModel = {
  previewItems: [],
  total: 0,
  emptyText: ORGANIZATION_EMPTY_SECTION_TEXT.connectedCharacters,
}

describe('buildOrganizationDetailViewModel', () => {
  it('maps kind vocabulary, authored description, and connected characters', () => {
    expect(buildOrganizationDetailViewModel(CITY_COUNCIL, emptyConnectedCharacters)).toEqual({
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
    })
  })
})
