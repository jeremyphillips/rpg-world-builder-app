import { describe, expect, it } from 'vitest'

import { CITY_COUNCIL } from '../fixtures'
import { buildOrganizationDetailViewModel } from './organization-display'

describe('buildOrganizationDetailViewModel', () => {
  it('maps kind vocabulary and authored description', () => {
    expect(buildOrganizationDetailViewModel(CITY_COUNCIL)).toEqual({
      statRows: [
        {
          label: 'Type',
          value: 'Government',
          info: 'A kingdom, council, administration, or other governing body.',
          infoAriaLabel: 'About Government',
        },
      ],
      description: '<p>The elected council governing the city.</p>',
    })
  })
})
