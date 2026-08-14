import type { QueryClient } from '@tanstack/react-query'
import type { FieldPath, FieldValues, UseFormReturn } from 'react-hook-form'
import type { z } from 'zod'

import {
  buildingCreateCompositionErrorDetailsSchema,
  buildingCreateCompositionRequestSchema,
  getErrorMessage,
  isApiError,
  normalizeBuildingCreateCompositionIssuePath,
  type ApiError,
  type BuildingCreateCompositionIssue,
  type BuildingCreateCompositionRequest,
  type BuildingCreateCompositionResponse,
  type ContentCampaignAccessPatch,
  type CreateLocationInput,
} from '@rpg/contracts'

import { postJson } from '@/lib/api-client'
import { updateRouteContentCampaignAccess } from '../../lib/campaign-access/campaign-access-api'
import { isDefaultCampaignAccessPatch } from '../../lib/campaign-access/campaign-access-state'
import { buildOrganizationCreateInput } from '../../lib/forms/organization-form-projection'
import { invalidateContentFormDefQueries } from '../../lib/list/use-content-mutations'
import { invalidateLocationConnectionQueries } from '../../lib/invalidate-location-connection-queries'
import { organizationsQueryKey } from '../../organizations/hooks/use-organizations'
import { locationFormDef } from './location-form-def'
import type {
  BuildingOrganizationDraftIssue,
  BuildingOrganizationDraftPlan,
} from './building-organization-create-drafts'

export class BuildingCreateSubmitBlockedError extends Error {
  constructor() {
    super('')
    this.name = 'BuildingCreateSubmitBlockedError'
  }
}

export function isBuildingCreateSubmitBlockedError(
  error: unknown,
): error is BuildingCreateSubmitBlockedError {
  return error instanceof BuildingCreateSubmitBlockedError
}

const BUILDING_CREATE_COMPOSITION_FALLBACK = 'Could not create building.' as const

export type BuildBuildingCreateCompositionRequestInput = Readonly<{
  buildingInput: CreateLocationInput
  plan: BuildingOrganizationDraftPlan
}>

export function buildBuildingCreateCompositionRequest(
  input: BuildBuildingCreateCompositionRequestInput,
): BuildingCreateCompositionRequest {
  return {
    building: { status: 'published', input: input.buildingInput },
    organizations: input.plan.organizations.map((draft) => ({
      organizationDraftId: draft.draftOrganizationId,
      status: 'published' as const,
      input: buildOrganizationCreateInput(draft.values),
    })),
    relationships: input.plan.relationships.map((relationship) => ({
      relationshipDraftId: relationship.draftId,
      kind: relationship.kind,
      organization:
        relationship.organization.kind === 'existing'
          ? {
              kind: 'existing' as const,
              organizationId: relationship.organization.organizationId,
            }
          : {
              kind: 'new' as const,
              organizationDraftId: relationship.organization.draftOrganizationId,
            },
    })),
  }
}

export async function createBuildingComposition(
  campaignId: string,
  request: BuildingCreateCompositionRequest,
): Promise<BuildingCreateCompositionResponse> {
  return postJson<BuildingCreateCompositionResponse>(
    `/api/campaigns/${campaignId}/content/locations/building-compositions`,
    request,
    BUILDING_CREATE_COMPOSITION_FALLBACK,
  )
}

export type PartitionedBuildingCreateCompositionIssues = Readonly<{
  building: readonly BuildingCreateCompositionIssue[]
  organizations: readonly BuildingOrganizationDraftIssue[]
  composition: readonly BuildingCreateCompositionIssue[]
  fallback?: string
}>

function parseBuildingCreateCompositionIssues(
  error: ApiError,
): readonly BuildingCreateCompositionIssue[] {
  const parsed = buildingCreateCompositionErrorDetailsSchema.safeParse(error.details)
  return parsed.success ? parsed.data.issues : []
}

export function partitionBuildingCreateCompositionIssues(
  error: unknown,
): PartitionedBuildingCreateCompositionIssues {
  if (!isApiError(error)) {
    return {
      building: [],
      organizations: [],
      composition: [],
      fallback: getErrorMessage(error, BUILDING_CREATE_COMPOSITION_FALLBACK),
    }
  }

  const issues = parseBuildingCreateCompositionIssues(error)
  if (issues.length === 0) {
    return {
      building: [],
      organizations: [],
      composition: [],
      fallback: error.message,
    }
  }

  const building: BuildingCreateCompositionIssue[] = []
  const organizations: BuildingOrganizationDraftIssue[] = []
  const composition: BuildingCreateCompositionIssue[] = []

  for (const issue of issues) {
    if (issue.target === 'building') {
      building.push(issue)
      continue
    }
    if (issue.target === 'organization') {
      organizations.push({
        organizationDraftId: issue.organizationDraftId,
        message: issue.message,
      })
      continue
    }
    if (issue.target === 'relationship') {
      organizations.push({
        relationshipDraftId: issue.relationshipDraftId,
        message: issue.message,
      })
      continue
    }
    composition.push(issue)
  }

  return { building, organizations, composition }
}

export function applyBuildingCreateCompositionBuildingIssues<T extends FieldValues>(
  form: UseFormReturn<T>,
  issues: readonly BuildingCreateCompositionIssue[],
): void {
  for (const issue of issues) {
    const path = normalizeBuildingCreateCompositionIssuePath(issue.path)
    if (!path) continue
    form.setError(path as FieldPath<T>, { message: issue.message })
  }
}

export async function applyDeferredBuildingCampaignAccess(input: {
  campaignId: string
  buildingId: string
  pendingAccess: ContentCampaignAccessPatch | null
}): Promise<boolean> {
  if (!input.pendingAccess || isDefaultCampaignAccessPatch(input.pendingAccess)) {
    return false
  }

  try {
    await updateRouteContentCampaignAccess(
      input.campaignId,
      locationFormDef.routeKey,
      input.buildingId,
      input.pendingAccess,
    )
    return false
  } catch {
    return true
  }
}

export async function invalidateBuildingCreateCompositionQueries(
  queryClient: QueryClient,
  campaignId: string,
  response: BuildingCreateCompositionResponse,
): Promise<void> {
  invalidateContentFormDefQueries(queryClient, campaignId, locationFormDef)
  void queryClient.invalidateQueries({ queryKey: organizationsQueryKey(campaignId) })

  const organizationIds = new Set<string>()
  for (const row of response.organizations) {
    organizationIds.add(row.organization.id)
  }
  for (const row of response.relationships) {
    organizationIds.add(row.organizationId)
  }

  await invalidateLocationConnectionQueries(queryClient, {
    campaignId,
    locationIds: [response.building.id],
  })

  await Promise.all(
    [...organizationIds].map((organizationId) =>
      invalidateLocationConnectionQueries(queryClient, {
        campaignId,
        organizationId,
        locationIds: [response.building.id],
      }),
    ),
  )
}

export type BuildingCreateCompletionToast = Readonly<
  { kind: 'success' } | { kind: 'warning'; message: string }
>

export function resolveBuildingCreateCompletionToast(input: {
  deferredAccessFailed: boolean
}): BuildingCreateCompletionToast {
  if (!input.deferredAccessFailed) return { kind: 'success' }
  return {
    kind: 'warning',
    message: 'Building created, but campaign access could not be updated.',
  }
}

export type BuildingOrganizationsPanelController = Readonly<{
  validate: () => Promise<{ valid: boolean; issueCount: number }>
  focusFirstIssue: () => void
  getPayload: () => BuildingOrganizationDraftPlan
  hydrateServerIssues: (issues: readonly BuildingOrganizationDraftIssue[]) => void
  reset: () => void
}>

function hasPartitionedIssues(issues: PartitionedBuildingCreateCompositionIssues): boolean {
  return (
    issues.building.length > 0 || issues.organizations.length > 0 || issues.composition.length > 0
  )
}

function hasPanelAttributedIssues(issues: PartitionedBuildingCreateCompositionIssues): boolean {
  return issues.building.length > 0 || issues.organizations.length > 0
}

function applyPartitionedBuildingCreateIssues<T extends FieldValues>(input: {
  form: UseFormReturn<T>
  issues: PartitionedBuildingCreateCompositionIssues
  organizationsController?: BuildingOrganizationsPanelController | null
  onNavigateToTab?: (tabId: string) => void
}): void {
  if (input.issues.building.length > 0) {
    applyBuildingCreateCompositionBuildingIssues(input.form, input.issues.building)
    input.onNavigateToTab?.('details')
  }
  if (input.issues.organizations.length > 0) {
    input.onNavigateToTab?.('organizations')
    input.organizationsController?.hydrateServerIssues(input.issues.organizations)
    input.organizationsController?.focusFirstIssue()
  }
}

export async function validateBuildingCreateOrganizationsPanel(input: {
  organizationsController?: BuildingOrganizationsPanelController | null
  onNavigateToTab?: (tabId: string) => void
}): Promise<void> {
  const controller = input.organizationsController
  if (!controller) return
  const validation = await controller.validate()
  if (validation.valid) return
  input.onNavigateToTab?.('organizations')
  controller.focusFirstIssue()
  throw new BuildingCreateSubmitBlockedError()
}

export function assertClientBuildingCreatePlan<T extends FieldValues>(input: {
  request: BuildingCreateCompositionRequest
  form: UseFormReturn<T>
  organizationsController?: BuildingOrganizationsPanelController | null
  onNavigateToTab?: (tabId: string) => void
}): void {
  const issues = validateBuildingCreateCompositionRequest(input.request)
  if (!hasPartitionedIssues(issues)) return
  applyPartitionedBuildingCreateIssues({
    form: input.form,
    issues,
    organizationsController: input.organizationsController,
    onNavigateToTab: input.onNavigateToTab,
  })
  if (hasPanelAttributedIssues(issues)) {
    throw new BuildingCreateSubmitBlockedError()
  }
  const compositionMessage = issues.composition[0]?.message
  throw new Error(compositionMessage ?? 'Could not create building.')
}

export function mapBuildingCreateSubmitError(error: unknown): string | undefined {
  if (isBuildingCreateSubmitBlockedError(error)) return undefined
  const partitioned = partitionBuildingCreateCompositionIssues(error)
  if (partitioned.building.length > 0 || partitioned.organizations.length > 0) {
    return undefined
  }
  if (partitioned.composition.length > 0) {
    return partitioned.composition[0]?.message ?? partitioned.fallback
  }
  return partitioned.fallback
}

export function handleBuildingCreateCompositionFailure<T extends FieldValues>(input: {
  error: unknown
  form: UseFormReturn<T>
  organizationsController?: BuildingOrganizationsPanelController | null
  onNavigateToTab?: (tabId: string) => void
}): void {
  const partitioned = partitionBuildingCreateCompositionIssues(input.error)
  applyPartitionedBuildingCreateIssues({
    form: input.form,
    issues: partitioned,
    organizationsController: input.organizationsController,
    onNavigateToTab: input.onNavigateToTab,
  })
  if (hasPanelAttributedIssues(partitioned)) {
    throw new BuildingCreateSubmitBlockedError()
  }
  throw input.error
}

export async function completeBuildingCreateComposition(input: {
  campaignId: string
  request: BuildingCreateCompositionRequest
  queryClient: QueryClient
  pendingAccess: ContentCampaignAccessPatch | null
  organizationsController?: BuildingOrganizationsPanelController | null
}): Promise<BuildingCreateCompletionToast> {
  const result = await createBuildingComposition(input.campaignId, input.request)
  const deferredAccessFailed = await applyDeferredBuildingCampaignAccess({
    campaignId: input.campaignId,
    buildingId: result.building.id,
    pendingAccess: input.pendingAccess,
  })
  await invalidateBuildingCreateCompositionQueries(input.queryClient, input.campaignId, result)
  input.organizationsController?.reset()
  return resolveBuildingCreateCompletionToast({ deferredAccessFailed })
}

function classifyRequestValidationIssue(
  request: BuildingCreateCompositionRequest,
  issue: z.ZodIssue,
):
  | { bucket: 'organizations'; issue: BuildingOrganizationDraftIssue }
  | { bucket: 'building'; issue: BuildingCreateCompositionIssue }
  | { bucket: 'composition'; issue: BuildingCreateCompositionIssue } {
  const path = issue.path.map(String).join('.')
  const normalizedPath = normalizeBuildingCreateCompositionIssuePath(path)
  const organizationDraftId =
    issue.path[0] === 'organizations' && typeof issue.path[1] === 'number'
      ? request.organizations[issue.path[1]]?.organizationDraftId
      : undefined
  const relationshipDraftId =
    issue.path[0] === 'relationships' && typeof issue.path[1] === 'number'
      ? request.relationships[issue.path[1]]?.relationshipDraftId
      : undefined

  if (organizationDraftId) {
    return { bucket: 'organizations', issue: { organizationDraftId, message: issue.message } }
  }
  if (relationshipDraftId) {
    return { bucket: 'organizations', issue: { relationshipDraftId, message: issue.message } }
  }
  if (issue.path[0] === 'building') {
    return {
      bucket: 'building',
      issue: {
        target: 'building',
        code: 'validation_error',
        message: issue.message,
        ...(normalizedPath ? { path: normalizedPath } : {}),
      },
    }
  }
  return {
    bucket: 'composition',
    issue: {
      target: 'capability',
      code: 'validation_error',
      message: issue.message,
    },
  }
}

export function validateBuildingCreateCompositionRequest(
  request: BuildingCreateCompositionRequest,
): PartitionedBuildingCreateCompositionIssues {
  const parsed = buildingCreateCompositionRequestSchema.safeParse(request)
  if (parsed.success) {
    return { building: [], organizations: [], composition: [] }
  }

  const building: BuildingCreateCompositionIssue[] = []
  const organizations: BuildingOrganizationDraftIssue[] = []
  const composition: BuildingCreateCompositionIssue[] = []

  for (const issue of parsed.error.issues) {
    const classified = classifyRequestValidationIssue(request, issue)
    if (classified.bucket === 'organizations') {
      organizations.push(classified.issue)
      continue
    }
    if (classified.bucket === 'building') {
      building.push(classified.issue)
      continue
    }
    composition.push(classified.issue)
  }

  return { building, organizations, composition }
}
