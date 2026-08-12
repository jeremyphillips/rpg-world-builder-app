import type {
  ContentCampaignAccessPatch,
  CreateLocationInput,
  CreateOrganizationInput,
} from '@rpg/contracts'
import type { FormItem } from '@rpg/ui/form'

import { createWithDeferredCampaignAccess } from '../../lib/campaign-access/create-with-deferred-campaign-access'
import type { ContentFormCtx } from '../../lib/forms/content-form-registry'
import {
  buildOrganizationCreateInput,
  buildOrganizationFields,
  buildOrganizationFormValueSyncs,
  organizationCreateDefaultValues,
  organizationDraftFormSchema,
  type OrganizationFormValues,
} from '../../lib/forms/organization-form-projection'
import { createOrganizationLocationConnection } from '../../lib/organization-location-connection-client'
import { createContent } from '../../lib/list/content-client'
import { locationDraftFormSchema, type LocationFormValues } from './location-form-fields'

export const BUILDING_OPERATOR_FORM_PATH = 'operatorOrganization' as const
export const BUILDING_OPERATOR_GROUP_LEGEND = 'Organization' as const
export const buildingOperatorFormValueSyncs = buildOrganizationFormValueSyncs(
  BUILDING_OPERATOR_FORM_PATH,
)

export const locationBuildingCreateDraftFormSchema = locationDraftFormSchema.extend({
  operatorOrganization: organizationDraftFormSchema,
})

export type LocationBuildingCreateFormValues = LocationFormValues & {
  operatorOrganization: OrganizationFormValues
}

export function buildBuildingOperatorFormItems(ctx: ContentFormCtx): FormItem[] {
  return [
    {
      kind: 'group',
      legend: BUILDING_OPERATOR_GROUP_LEGEND,
      description: 'Create the organization that operates here.',
      chrome: { variant: 'inset' },
      fields: buildOrganizationFields(ctx, {
        prefix: BUILDING_OPERATOR_FORM_PATH,
        includeName: true,
      }),
    },
  ]
}

export function buildingOperatorDefaultValues(): Record<string, unknown> & {
  operatorOrganization: Record<string, unknown>
} {
  return {
    operatorOrganization: {
      name: '',
      organizationDomain: '',
      activities: organizationCreateDefaultValues.activities ?? [],
    },
  }
}

/** Setup owns intent only; removing it prunes just the unsaved embedded projection. */
export function pruneBuildingOperatorDraft<T extends Record<string, unknown>>(values: T): T {
  if (!(BUILDING_OPERATOR_FORM_PATH in values)) return values
  const next = { ...values }
  delete next[BUILDING_OPERATOR_FORM_PATH]
  return next
}

export function buildBuildingOperatorCreateInput(
  values: LocationBuildingCreateFormValues,
): CreateOrganizationInput {
  return buildOrganizationCreateInput(values.operatorOrganization)
}

type CreatedEntity = { id: string }

export type BuildingOperatorCreateResult =
  | { status: 'not_requested' }
  | { status: 'organization_failed' }
  | { status: 'relationship_failed'; organization: CreatedEntity }
  | { status: 'created'; organization: CreatedEntity }

export type CreateBuildingWithOptionalOperatorResult = {
  building: CreatedEntity
  deferredAccessFailed: boolean
  operator: BuildingOperatorCreateResult
}

export type CreateBuildingWithOptionalOperatorParams = {
  campaignId: string
  locationRouteKey: string
  buildingCreateInput: CreateLocationInput
  pendingAccess: ContentCampaignAccessPatch | null
  operatorCreateInput?: CreateOrganizationInput
}

type CreateBuildingWithOptionalOperatorDependencies = {
  createEntity: (
    campaignId: string,
    routeKey: string,
    input: unknown,
    fallbackMessage?: string,
  ) => Promise<CreatedEntity>
  connectOperator: (
    campaignId: string,
    organizationId: string,
    input: { locationId: string; kind: 'operator' },
  ) => Promise<unknown>
}

const defaultDependencies: CreateBuildingWithOptionalOperatorDependencies = {
  createEntity: createContent,
  connectOperator: createOrganizationLocationConnection,
}

export async function createBuildingWithOptionalOperator(
  params: CreateBuildingWithOptionalOperatorParams,
  dependencies: CreateBuildingWithOptionalOperatorDependencies = defaultDependencies,
): Promise<CreateBuildingWithOptionalOperatorResult> {
  const { entity: building, deferredAccessFailed } = await createWithDeferredCampaignAccess({
    campaignId: params.campaignId,
    routeKey: params.locationRouteKey,
    createInput: params.buildingCreateInput,
    mutateAsync: (input) =>
      dependencies.createEntity(
        params.campaignId,
        params.locationRouteKey,
        input,
        'Could not create locations.',
      ),
    pendingAccess: params.pendingAccess,
  })

  if (!params.operatorCreateInput) {
    return { building, deferredAccessFailed, operator: { status: 'not_requested' } }
  }

  let organization: CreatedEntity
  try {
    organization = await dependencies.createEntity(
      params.campaignId,
      'organizations',
      params.operatorCreateInput,
      'Could not create organizations.',
    )
  } catch {
    return { building, deferredAccessFailed, operator: { status: 'organization_failed' } }
  }

  try {
    await dependencies.connectOperator(params.campaignId, organization.id, {
      locationId: building.id,
      kind: 'operator',
    })
  } catch {
    return {
      building,
      deferredAccessFailed,
      operator: { status: 'relationship_failed', organization },
    }
  }

  return { building, deferredAccessFailed, operator: { status: 'created', organization } }
}

export type BuildingCreateCompletionToast =
  | { kind: 'success' }
  | { kind: 'warning'; message: string }

export function resolveBuildingCreateCompletionToast(
  result: CreateBuildingWithOptionalOperatorResult,
): BuildingCreateCompletionToast {
  const incomplete: string[] = []
  if (result.deferredAccessFailed) incomplete.push('campaign access')
  if (result.operator.status === 'organization_failed') incomplete.push('the organization')
  if (result.operator.status === 'relationship_failed') incomplete.push('the operator relationship')

  if (incomplete.length === 0) return { kind: 'success' }
  const summary =
    incomplete.length === 1
      ? incomplete[0]
      : `${incomplete.slice(0, -1).join(', ')} and ${incomplete.at(-1)}`
  return { kind: 'warning', message: `Building created, but ${summary} could not be completed.` }
}
