import { describe, expect, it, vi } from 'vitest'
import type { CreateLocationInput, CreateOrganizationInput } from '@rpg/contracts'

import {
  buildBuildingOperatorCreateInput,
  createBuildingWithOptionalOperator,
  locationBuildingCreateDraftFormSchema,
  pruneBuildingOperatorDraft,
  resolveBuildingCreateCompletionToast,
  type CreateBuildingWithOptionalOperatorResult,
  type LocationBuildingCreateFormValues,
} from './location-building-create-composition.lib'

const buildingCreateInput = {
  name: 'The Copper Kettle',
  slug: 'the-copper-kettle',
  kind: 'building',
} as unknown as CreateLocationInput

const operatorCreateInput = {
  name: 'Red Dragon Brewing Company',
  slug: 'red-dragon-brewing-company',
  organizationKind: 'commercial',
  organizationSubtype: 'company',
  activities: ['brewing'],
} as CreateOrganizationInput

describe('Building operator form composition', () => {
  it('accepts draft sentinels without persisting them through the Organization builder', () => {
    expect(() =>
      locationBuildingCreateDraftFormSchema.parse({
        name: 'The Copper Kettle',
        operatorOrganization: { name: '', organizationKind: '', activities: [] },
      }),
    ).not.toThrow()

    expect(
      buildBuildingOperatorCreateInput({
        name: 'The Copper Kettle',
        operatorOrganization: {
          name: 'Red Dragon Brewing Company',
          organizationKind: 'commercial',
          organizationSubtype: 'company',
          activities: ['brewing'],
        },
      } as unknown as LocationBuildingCreateFormValues),
    ).toMatchObject(operatorCreateInput)
  })

  it('prunes only unsaved operator fields when intent is removed', () => {
    const draft = {
      name: 'The Copper Kettle',
      classification: { facilityType: 'brewery' },
      operatorOrganization: { name: 'Red Dragon Brewing Company' },
    }

    expect(pruneBuildingOperatorDraft(draft)).toEqual({
      name: draft.name,
      classification: draft.classification,
    })
  })
})

describe('createBuildingWithOptionalOperator', () => {
  it('creates Building, Organization, then operator relationship in order', async () => {
    const calls: string[] = []
    const createEntity = vi.fn(async (_campaignId: string, routeKey: string) => {
      calls.push(routeKey)
      return { id: routeKey === 'locations' ? 'building-1' : 'organization-1' }
    })
    const connectOperator = vi.fn(async () => {
      calls.push('operator')
      return {}
    })

    const result = await createBuildingWithOptionalOperator(
      {
        campaignId: 'campaign-1',
        locationRouteKey: 'locations',
        buildingCreateInput,
        pendingAccess: null,
        operatorCreateInput,
      },
      { createEntity, connectOperator },
    )

    expect(calls).toEqual(['locations', 'organizations', 'operator'])
    expect(connectOperator).toHaveBeenCalledWith('campaign-1', 'organization-1', {
      locationId: 'building-1',
      kind: 'operator',
    })
    expect(result.operator).toEqual({
      status: 'created',
      organization: { id: 'organization-1' },
    })
  })

  it('reports Organization failure without attempting the relationship', async () => {
    const createEntity = vi.fn(async (_campaignId: string, routeKey: string) => {
      if (routeKey === 'organizations') throw new Error('organization failed')
      return { id: 'building-1' }
    })
    const connectOperator = vi.fn(async () => ({}))

    const result = await createBuildingWithOptionalOperator(
      {
        campaignId: 'campaign-1',
        locationRouteKey: 'locations',
        buildingCreateInput,
        pendingAccess: null,
        operatorCreateInput,
      },
      { createEntity, connectOperator },
    )

    expect(result.operator).toEqual({ status: 'organization_failed' })
    expect(connectOperator).not.toHaveBeenCalled()
  })

  it('retains the created Organization id when only the relationship fails', async () => {
    const createEntity = vi.fn(async (_campaignId: string, routeKey: string) => ({
      id: routeKey === 'locations' ? 'building-1' : 'organization-1',
    }))
    const connectOperator = vi.fn(async () => {
      throw new Error('relationship failed')
    })

    const result = await createBuildingWithOptionalOperator(
      {
        campaignId: 'campaign-1',
        locationRouteKey: 'locations',
        buildingCreateInput,
        pendingAccess: null,
        operatorCreateInput,
      },
      { createEntity, connectOperator },
    )

    expect(result.operator).toEqual({
      status: 'relationship_failed',
      organization: { id: 'organization-1' },
    })
  })
})

describe('resolveBuildingCreateCompletionToast', () => {
  it('aggregates deterministic partial completion warnings', () => {
    const result: CreateBuildingWithOptionalOperatorResult = {
      building: { id: 'building-1' },
      deferredAccessFailed: true,
      operator: { status: 'organization_failed' },
    }
    expect(resolveBuildingCreateCompletionToast(result)).toEqual({
      kind: 'warning',
      message: 'Building created, but campaign access and the organization could not be completed.',
    })
  })
})
