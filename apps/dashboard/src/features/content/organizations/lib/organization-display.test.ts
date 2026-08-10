import { describe, expect, it } from 'vitest'

import { CITY_COUNCIL } from '../fixtures'
import {
  buildOrganizationDetailViewModel,
  formatLocationConnectionsCount,
  ORGANIZATION_EMPTY_SECTION_TEXT,
  type OrganizationLocationConnectionsViewModel,
} from './organization-display'

const emptyLocationConnections: OrganizationLocationConnectionsViewModel = {
  previewItems: [],
  total: 0,
  emptyText: ORGANIZATION_EMPTY_SECTION_TEXT.locationConnections,
}

describe('formatLocationConnectionsCount', () => {
  it('pluralizes location connection count copy', () => {
    expect(formatLocationConnectionsCount(1)).toBe('1 location connection')
    expect(formatLocationConnectionsCount(4)).toBe('4 location connections')
  })
})

describe('buildOrganizationDetailViewModel', () => {
  it('maps kind vocabulary, authored description, and location connections', () => {
    expect(buildOrganizationDetailViewModel(CITY_COUNCIL, emptyLocationConnections)).toEqual({
      statRows: [
        {
          label: 'Type',
          value: 'Government',
          info: 'A kingdom, council, administration, or other governing body.',
          infoAriaLabel: 'About Government',
        },
      ],
      description: '<p>The elected council governing the city.</p>',
      locationConnections: emptyLocationConnections,
    })
  })
})
