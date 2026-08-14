import { describe, expect, it, vi } from 'vitest'
import { ApiError, type CreateLocationInput } from '@rpg/contracts'
import type { UseFormReturn } from 'react-hook-form'

import {
  applyBuildingCreateCompositionBuildingIssues,
  buildBuildingCreateCompositionRequest,
  handleBuildingCreateCompositionFailure,
  mapBuildingCreateSubmitError,
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
  it('normalizes building.input.* Zod paths into building field paths', () => {
    const request = buildBuildingCreateCompositionRequest({
      buildingInput: { ...buildingInput, name: '' },
      plan: { organizations: [], relationships: [] },
    })

    const result = validateBuildingCreateCompositionRequest(request)
    expect(result.building).toEqual([
      expect.objectContaining({
        target: 'building',
        path: 'name',
      }),
    ])
  })

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

describe('mapBuildingCreateSubmitError', () => {
  it('surfaces composition capability failures for form display', () => {
    const error = new ApiError(
      503,
      'transactions_unavailable',
      'Atomic Building creation is unavailable because MongoDB transactions are disabled.',
      {
        issues: [
          {
            target: 'capability',
            code: 'transactions_unavailable',
            message: 'Atomic Building creation requires MongoDB transaction support.',
          },
        ],
      },
    )

    expect(mapBuildingCreateSubmitError(error)).toBe(
      'Atomic Building creation requires MongoDB transaction support.',
    )
  })

  it('suppresses formError when panel-attributed issues were handled inline', () => {
    const error = new ApiError(422, 'building_create_validation_failed', 'Invalid plan.', {
      issues: [
        {
          target: 'building',
          code: 'validation_error',
          message: 'Name is required.',
          path: 'name',
        },
      ],
    })

    expect(mapBuildingCreateSubmitError(error)).toBeUndefined()
  })
})

describe('applyBuildingCreateCompositionBuildingIssues', () => {
  it('sets form errors on normalized field paths', () => {
    const form = { setError: vi.fn() } as unknown as UseFormReturn<Record<string, unknown>>

    applyBuildingCreateCompositionBuildingIssues(form, [
      {
        target: 'building',
        code: 'validation_error',
        message: 'Name is required.',
        path: 'building.input.name',
      },
    ])

    expect(form.setError).toHaveBeenCalledWith('name', { message: 'Name is required.' })
  })
})

describe('handleBuildingCreateCompositionFailure', () => {
  it('rethrows capability failures so they can map to formError', () => {
    const error = new ApiError(
      503,
      'transactions_unavailable',
      'Atomic Building creation is unavailable because MongoDB transactions are disabled.',
      {
        issues: [
          {
            target: 'capability',
            code: 'transactions_unavailable',
            message: 'Atomic Building creation requires MongoDB transaction support.',
          },
        ],
      },
    )
    const form = { setError: vi.fn() } as unknown as UseFormReturn<Record<string, unknown>>

    expect(() =>
      handleBuildingCreateCompositionFailure({
        error,
        form,
      }),
    ).toThrow(error)
  })

  it('throws a blocked error after hydrating panel-attributed issues', () => {
    const error = new ApiError(422, 'building_create_validation_failed', 'Invalid plan.', {
      issues: [
        {
          target: 'relationship',
          relationshipDraftId: 'relationship-1',
          code: 'relationship_conflict',
          message: 'Owner conflicts with another relationship.',
        },
      ],
    })
    const form = { setError: vi.fn() } as unknown as UseFormReturn<Record<string, unknown>>

    expect(() =>
      handleBuildingCreateCompositionFailure({
        error,
        form,
      }),
    ).toThrow(expect.objectContaining({ name: 'BuildingCreateSubmitBlockedError' }))
  })
})
