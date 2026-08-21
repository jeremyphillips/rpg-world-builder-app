import type {
  CreateOrganizationLocationConnectionInput,
  OrganizationLocationConnection,
  UpdateOrganizationLocationConnectionInput,
} from '@rpg/contracts'

import { deleteJson, patchJson, postJson } from '@/lib/api-client'

function locationConnectionsPath(
  campaignId: string,
  organizationId: string,
  connectionId?: string,
): string {
  const base = `/api/campaigns/${campaignId}/content/organizations/${organizationId}/location-connections`
  return connectionId ? `${base}/${connectionId}` : base
}

export async function createOrganizationLocationConnection(
  campaignId: string,
  organizationId: string,
  input: CreateOrganizationLocationConnectionInput,
): Promise<{ locationConnection: OrganizationLocationConnection }> {
  return postJson(
    locationConnectionsPath(campaignId, organizationId),
    input,
    'Could not add this location connection.',
  )
}

export async function updateOrganizationLocationConnection(
  campaignId: string,
  organizationId: string,
  connectionId: string,
  input: UpdateOrganizationLocationConnectionInput,
): Promise<{ locationConnection: OrganizationLocationConnection }> {
  return patchJson(
    locationConnectionsPath(campaignId, organizationId, connectionId),
    input,
    'Could not update this location connection.',
  )
}

export async function deleteOrganizationLocationConnection(
  campaignId: string,
  organizationId: string,
  connectionId: string,
): Promise<{ ok: true }> {
  return deleteJson(
    locationConnectionsPath(campaignId, organizationId, connectionId),
    'Could not remove this location connection.',
  )
}
