import { describe, expect, it } from 'vitest'

import { projectEntitySummaryModel } from './entity-summary-projection.lib'

describe('projectEntitySummaryModel', () => {
  it('maps heading only', () => {
    expect(projectEntitySummaryModel({ heading: 'Harborford' })).toEqual({
      heading: 'Harborford',
    })
  })

  it('maps classification, description, and structured status', () => {
    expect(
      projectEntitySummaryModel({
        heading: 'Harborford',
        classification: 'City',
        description: 'Coastal trade hub',
        status: { kind: 'badge', label: 'Unavailable', tone: 'warning' },
      }),
    ).toEqual({
      heading: 'Harborford',
      classification: 'City',
      description: 'Coastal trade hub',
      status: [{ kind: 'badge', label: 'Unavailable', tone: 'warning' }],
    })
  })

  it('omits empty optional fields', () => {
    expect(
      projectEntitySummaryModel({
        heading: 'Harborford',
        classification: '',
        description: '',
      }),
    ).toEqual({
      heading: 'Harborford',
    })
  })
})
