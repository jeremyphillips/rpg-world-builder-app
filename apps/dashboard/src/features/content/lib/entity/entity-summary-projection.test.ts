import { describe, expect, it } from 'vitest'

import { projectEntitySummaryModel } from './entity-summary-projection.lib'

describe('projectEntitySummaryModel', () => {
  it('maps heading-only input', () => {
    expect(projectEntitySummaryModel({ heading: 'Harborford' })).toEqual({
      heading: 'Harborford',
    })
  })

  it('maps classification, description, and status', () => {
    expect(
      projectEntitySummaryModel({
        heading: 'Yawning Portal',
        classification: ' · Building · Tavern',
        description: 'Located in Dock Ward',
        status: 'Unavailable',
      }),
    ).toEqual({
      heading: 'Yawning Portal',
      classification: ' · Building · Tavern',
      description: 'Located in Dock Ward',
      status: ['Unavailable'],
    })
  })

  it('omits empty optional fields', () => {
    expect(
      projectEntitySummaryModel({
        heading: 'Harborford',
        classification: '',
        description: undefined,
        status: '',
      }),
    ).toEqual({ heading: 'Harborford' })
  })
})
