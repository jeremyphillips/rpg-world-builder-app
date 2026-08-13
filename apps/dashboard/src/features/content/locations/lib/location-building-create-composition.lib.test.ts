import { describe, expect, it } from 'vitest'
import { ApiError, type CreateLocationInput } from '@rpg/contracts'

import {
  buildBuildingCreateCompositionRequest,
  partitionBuildingCreateCompositionIssues,
  resolveBuildingCreateCompletionToast,
  validateBuildingCreateCompositionRequest,
} from './location-building-create-composition.lib'
import type { BuildingOrganizationDraftPlan } from './building-organization-create-drafts'

const buildingInput = {
  slug: 'clock-tower',
  name: 'Clock Tower',
  kind: 'structure',
  structureType: 'building',
} as CreateLocationInput

const organizationPlan: BuildingOrganizationDraftPlan = {
  organizations: [
    {
      draftOrganizationId: 'organization-1',
      values: {
        name: 'Clockkeepers',
        organizationDomain: 'commercial',
        organizationForm: 'company',
        activities: [],
      },
    },
  ],
  relationships: [
    {
      draftId: 'relationship-1',
      kind: 'operator',
      organization: { kind: 'new', draftOrganizationId: 'organization-1' },
    },
  ],
}

describe('buildBuildingCreateCompositionRequest', () => {
  it('maps building input and draft plan into the composite contract', () => {
    expect(
      buildBuildingCreateCompositionRequest({
        buildingInput,
        plan: organizationPlan,
      }),
    ).toMatchObject({
      building: { status: 'published', input: buildingInput },
      organizations: [
        expect.objectContaining({
          organizationDraftId: 'organization-1',
          input: expect.objectContaining({ name: 'Clockkeepers' }),
        }),
      ],
      relationships: [
        {
          relationshipDraftId: 'relationship-1',
          kind: 'operator',
          organization: { kind: 'new', organizationDraftId: 'organization-1' },
        },
      ],
    })
  })
})

describe('validateBuildingCreateCompositionRequest', () => {
  it('partitions dangling draft references into organization issues', () => {
    const request = buildBuildingCreateCompositionRequest({
      buildingInput,
      plan: {
        organizations: [],
        relationships: [
          {
            draftId: 'relationship-1',
            kind: 'owns',
            organization: { kind: 'new', draftOrganizationId: 'missing' },
          },
        ],
      },
    })

    const result = validateBuildingCreateCompositionRequest(request)
    expect(result.organizations).toEqual([
      expect.objectContaining({
        relationshipDraftId: 'relationship-1',
        message: 'Relationship references an unknown organization draft.',
      }),
    ])
  })
})

describe('partitionBuildingCreateCompositionIssues', () => {
  it('routes attributed API issues to building and organization partitions', () => {
    const error = new ApiError(422, 'building_create_validation_failed', 'Invalid plan.', {
      issues: [
        {
          target: 'building',
          code: 'validation_error',
          message: 'Name is required.',
          path: 'name',
        },
        {
          target: 'relationship',
          relationshipDraftId: 'relationship-1',
          code: 'relationship_conflict',
          message: 'Owner conflicts with another relationship.',
        },
        {
          target: 'capability',
          code: 'transactions_unavailable',
          message: 'Atomic Building creation requires MongoDB transaction support.',
        },
      ],
    })

    expect(partitionBuildingCreateCompositionIssues(error)).toEqual({
      building: [
        expect.objectContaining({ target: 'building', message: 'Name is required.', path: 'name' }),
      ],
      organizations: [
        {
          relationshipDraftId: 'relationship-1',
          message: 'Owner conflicts with another relationship.',
        },
      ],
      composition: [
        expect.objectContaining({
          target: 'capability',
          code: 'transactions_unavailable',
        }),
      ],
    })
  })
})

describe('resolveBuildingCreateCompletionToast', () => {
  it('warns only when deferred campaign access fails', () => {
    expect(resolveBuildingCreateCompletionToast({ deferredAccessFailed: false })).toEqual({
      kind: 'success',
    })
    expect(resolveBuildingCreateCompletionToast({ deferredAccessFailed: true })).toEqual({
      kind: 'warning',
      message: 'Building created, but campaign access could not be updated.',
    })
  })
})
